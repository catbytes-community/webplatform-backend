const express = require("express");
const pool = require("../db");
const router = express.Router();
const userService = require("../services/user_service")
const {verifyOwnership, OWNED_ENTITIES} = require("../middleware/authorization");
router.use(express.json());

// Validating userId 
const isValidUserId = (id) => {
    const userId = parseInt(id, 10);
    return !isNaN(userId) && userId > 0;
};

// Check if has rights to edit   
const hasEditRights = (req) => {
    //**** NEED TO KNOW THE CONDITIONS *****/
    return true;
};

// Get all users
router.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
    const { id } = req.params;

    if (!isValidUserId(id)) {
        return res.status(400).send("Invalid user id supplied");
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        // todo: get user roles, too

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Create a new user
router.post("/users", async (req, res) => {
    const { name, email, about, languages} = req.body;
    console.log(req.body); // Log the entire request body
    try {
        // todo: firebase will only know user's email, we will need to get user's application by email
        // and populate user entity with that data here 
        const existingUser = await pool.query(
            "SELECT email FROM users WHERE name = $1 OR email = $2",
            [name, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: "Username or email already exists." });
        }

        const result = await pool.query(
            "INSERT INTO users (name, email, about, languages) VALUES ($1, $2, $3, $4) RETURNING id",
            [name, email, about, languages]
        );

        let user_id = result.rows[0].id;
        
        // todo add transactions: if something went wrong here, the user should not be saved
        await userService.assignRoleToUser(user_id, 'member');

        res.status(201).json({ id: user_id, message: "User created successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Update user by ID
router.put("/users/:id", verifyOwnership(OWNED_ENTITIES.USER), async (req, res) => {
    const { id } = req.params;
    const { name, email, about, languages } = req.body;

    if (!isValidUserId(id)) {
        return res.status(400).send("Invalid user id supplied");
    }

    if (!hasEditRights(req)) {
        return res.status(403).send("You don't have the rights to edit this user");
    }

    try {
        const result = await pool.query(
            "UPDATE users SET name = $1, email = $2, about = $3, languages = $4  WHERE id = $5",
            [name, email, about, languages, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "User updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Delete user by ID
router.delete("/users/:id", async (req, res) => {
    const { id } = req.params;

    if (!isValidUserId(id)) {
        return res.status(400).send("Invalid user id supplied");
    }

    if (!hasEditRights(req)) {
        return res.status(403).send("You don't have the rights to edit this user");
    }

    try {
        const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "User deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;