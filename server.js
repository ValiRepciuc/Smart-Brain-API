const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const image = require("./controllers/image");

const PORT = process.env.PORT || 3000;

const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL, // Use DATABASE_URL for Render deployment
        ssl: {
          rejectUnauthorized: false, // Necessary for connecting to PostgreSQL on Render
        },
      }
    : (() => {
        console.log("Error: DATABASE_URL not provided");
        
      })(),
});


const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/signin", (req, res) => {
  signin.handleSignin(req, res, db, bcrypt);
});

app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

app.get("/profile/:id", (req, res) => {
  profile.handleProfile(req, res, db);
});

app.put("/image", (req, res) => {
  image.handleImage(req, res, db);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
