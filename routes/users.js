const express = require("express");

const router = express.Router();
const userService = require("../services/user_service");
const applService = require("../services/applications_service");
const admin = require("firebase-admin");
const { ROLE_NAMES } = require("../utils");
const {verifyOwnership, verifyRole, OWNED_ENTITIES} = require("../middleware/authorization");
const { isValidIntegerId, respondWithError, isUniqueConstraintViolation, 
  isNotNullConstraintViolation, parseColumnNameFromConstraint } = require("./helpers");

router.use(express.json());

// POST /users/login
router.post("/users/login", async (req, res) => {
  const token = req.headers['token'];
  if (!token) {
    return respondWithError(res, 401, "No token provided");
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;
    const firebaseId = decodedToken.uid;

    if (!decodedToken.email_verified) {
      return respondWithError(res, 403, "Email not verified");
    }

    const application = await applService.getApplicationByEmail(email);  
    if (!application || !application.status === 'approved') {
      return respondWithError(res, 403, "Application is not approved or does not exist");
    }

    let user = await userService.getUserByEmail(email);
    if (!user) {
      user = await userService.createNewMemberUser(
        application.name,
        email,
        application.about,
        application.languages, 
        application.discord_nickname
      );
    }

    await userService.updateUserById(user.id, {firebase_id: firebaseId});  

    res.cookie('userUID', firebaseId, { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(200).json({ user: user });
  } catch (error) {
    console.error(error);
    return respondWithError(res, 401, "Unauthorized");
  }
});

// Get all users
router.get("/users", verifyRole(ROLE_NAMES.member), async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (err) {
    console.error(err);
    respondWithError(res);
  }
});

// Create a new user
router.post("/users", async (req, res) => {
  const { name, email, about, languages } = req.body;
  console.log(req.body); // Log the entire request body
  try {
    // todo: firebase will only know user's email, we will need to get user's application by email
    // and populate user entity with that data here 
    const user = await userService.createNewMemberUser(name, email, about, languages);       
    res.status(201).json({ id: user.id });
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    respondWithError(res);
  }
});

module.exports = router;