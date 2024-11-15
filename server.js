// import npm packages and env config
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

 

const app = express();

// Middleware
app.use(express.json()); // read documentation on what this does
app.use(cors());

// Routes
app.use(routes);
// API routes
app.get("/", (req, res) => {
  res.send("Hello World");
});


app.listen(8080, () => {
  console.log(`Server is running`);
});
