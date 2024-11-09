// import npm packages and env config
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
 

const app = express();

// Middleware
app.use(express.json()); // read documentation on what this does
app.use(cors());

// Routes

// API routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

//GET Endpoint

//raw query
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/applications", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM applications");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
 

// POST Endpoint
//raw query
app.post("/users", async (req, res) => {
  const { username } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO users (username) VALUES ($1) RETURNING *",
      [username]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/applications", async (req, res) => {
    const { userId, text } = req.body;
    const date = new Date();  

    try {
        const result = await pool.query(
            "INSERT INTO applications (user_id, sumbission_date, text) VALUES ($1, $2, $3) RETURNING *",
            [userId, date, text]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

 

app.listen(8080, () => {
  console.log(`Server is running`);
});
