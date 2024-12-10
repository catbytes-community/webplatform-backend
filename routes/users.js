const express = require("express");
const router = express.Router();
const userService = require("../services/user_service");
const rolesService = require("../services/roles_service");
const {verifyOwnership, OWNED_ENTITIES} = require("../middleware/authorization");
const { isValidIntegerId, respondWithError, isUniqueConstraintViolation, isNotNullConstraintViolation } = require("./helpers");

router.use(express.json());

// Get all users
router.get("/users", async (req, res) => {
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
        const userId = await userService.createNewUser(name, email, about, languages);
        // todo add transactions: if something went wrong here, the user should not be saved
        await rolesService.assignRoleToUser(userId, 'member');
        res.status(201).json({ id: userId });
    } catch (err) {
        console.error(err);
        if (isUniqueConstraintViolation(err.code)) {
            return respondWithError(res, 409, "User with this email is already registered");
        } else if (isNotNullConstraintViolation(err.code)) {
            return respondWithError(res, 400, err.message);
        }
        respondWithError(res);
    }
});


// Get user by ID
router.get("/users/:id", async (req, res) => {
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
        const [updatedUser] = await userService.updateUserById(id, name, about, languages);
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
        res.status(200).json({ id });
    } catch (err) {
        console.error(err);
        respondWithError(res);
    }
});

module.exports = router;