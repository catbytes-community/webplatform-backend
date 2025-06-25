const express = require("express");

const router = express.Router();
const userService = require("../services/user_service");
const authService = require("../services/auth_service");
const { ROLE_NAMES } = require("../utils");
const {verifyOwnership, verifyRole, OWNED_ENTITIES} = require("../middleware/authorization");
const { isValidIntegerId, respondWithError, isUniqueConstraintViolation, 
  isNotNullConstraintViolation, parseColumnNameFromConstraint } = require("./helpers");

  const logger = require('../logger')(__filename);

router.use(express.json());

// POST /users/login
router.post("/users/login", async (req, res) => {
  const firebaseToken = req.get('X-Firebase-Token') || null;
  const discordCode = req.get('X-Discord-Code') || null;

  try {
    let user;

    if (firebaseToken) {
      user = await authService.handleFirebaseAuth(firebaseToken);
    } else if (discordCode) {
      user = await authService.handleDiscordAuth(discordCode);
    }
    else return respondWithError(res, 401, 'No token provided or invalid token');

    res.cookie('userUID', user.firebaseId, { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(200).json({ user: user });

  } catch (error) {
    if (error.status) {
      return respondWithError(res, error.status, error.message);
    }
    return respondWithError(res, 500, "Authentication failed");
  }
});

// Get all users
router.get("/users", verifyRole(ROLE_NAMES.member), async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});

// Create a new user
router.post("/users", async (req, res) => {
  const { name, email, about, languages } = req.body;
  // console.log(req.body); // Log the entire request body
  try {
    // todo: firebase will only know user's email, we will need to get user's application by email
    // and populate user entity with that data here 
    const user = await userService.createNewMemberUser(name, email, about, languages);       
    res.status(201).json({ id: user.id });
  } catch (err) {
    logger.error(err);
    const violatedValue = parseColumnNameFromConstraint(err.constraint, 'users');
    if (isUniqueConstraintViolation(err.code)) {
      return respondWithError(
        res,
        409,
        `User with this ${violatedValue} is already registered`
      );
    } else if (isNotNullConstraintViolation(err.code)) {
      return respondWithError(
        res, 400, `Field ${violatedValue} is required`);
    }
    respondWithError(res);
  }
});

// Get user by ID
router.get("/users/:id", verifyRole(ROLE_NAMES.member), async (req, res) => {
  const { id } = req.params;
  if (!isValidIntegerId(id)) {
    return respondWithError(res, 400, "Invalid user id supplied");
  }
  try {
    const userInfo = await userService.getUserById(id);
    if (!userInfo) {
      return respondWithError(res, 404, "User not found");
    }
    res.json(userInfo);
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});

// Update user by ID
router.put("/users/:id", verifyOwnership(OWNED_ENTITIES.USER), async (req, res) => {
  const { id } = req.params;
  const { name, about, languages } = req.body;
  if (!isValidIntegerId(id)) {
    return respondWithError(res, 400, "Invalid user id supplied");
  }
  try {
    const updatedUser = await userService.updateUserById(id, { name: name, about: about, languages: languages });
    if (!updatedUser) {
      return respondWithError(res, 404, "User not found");
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});

// Delete user by ID
router.delete("/users/:id", verifyOwnership(OWNED_ENTITIES.USER), async (req, res) => {
  const { id } = req.params;
  if (!isValidIntegerId(id)) {
    return respondWithError(res, 400, "Invalid user id supplied");
  }
  try {
    const result = await userService.deleteUserById(id);
    if (result === 0) {
      return respondWithError(res, 404, "User not found.");
    }
    res.status(200).json({ user_id: id });
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});

module.exports = router;