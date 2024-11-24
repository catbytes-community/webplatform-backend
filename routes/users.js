const express = require("express");
const { getPool } = require('../db');
const pool = getPool();
const router = express.Router();
const userService = require("../services/user_service")
const {verifyOwnership, OWNED_ENTITIES} = require("../middleware/authorization");
const { isValidIntegerId, respondWithError, isUniqueConstraintViolation, isNotNullConstraintViolation } = require("./helpers");
router.use(express.json());

// Get all users
router.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, languages FROM users");
        res.json({ users: result.rows});
    } catch (err) {
        console.error(err);
        respondWithError(res);
    }
});

// Create a new user
router.post("/users", async (req, res) => {
    const { name, email, about, languages} = req.body;
    console.log(req.body); // Log the entire request body
    try {
        // todo: firebase will only know user's email, we will need to get user's application by email
        // and populate user entity with that data here 
        const result = await pool.query(
            "INSERT INTO users (name, email, about, languages) VALUES ($1, $2, $3, $4) RETURNING id",
            [name, email, about, languages]
        );

        let userId = result.rows[0].id;
        
        // todo add transactions: if something went wrong here, the user should not be saved
        await userService.assignRoleToUser(userId, 'member');

        res.status(201).json({ id: userId});
    } catch (err) {
        console.error(err)
        if (isUniqueConstraintViolation(err.code)) {
            return respondWithError(res, 409, "User with this email is already registered")
        } else if (isNotNullConstraintViolation(err.code)) {
            return respondWithError(res, 400, err.message)
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
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return respondWithError(res, 404, "User not found");
        }

        const userInfo = result.rows[0];
        const roles = await pool.query(
            "select r.role_name, r.id from roles r join user_roles on r.id = user_roles.role_id where user_roles.user_id = $1", 
            [id]);
        userInfo.roles = roles.rows.length > 0 ? roles.rows : [];
        
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
        const result = await pool.query(
            "UPDATE users SET name = $1, about = $2, languages = $3  WHERE id = $4 RETURNING *",
            [name, about, languages, id]
        );

        if (result.rowCount === 0) {
            return respondWithError(res, 404, "User not found");
        }

        res.status(200).json(result.rows);
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
        const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            return respondWithError(res, 404, "User not found.");
        }

        res.status(200).json({id: id});
    } catch (err) {
        console.error(err);
        respondWithError(res);
    }
});

module.exports = router;