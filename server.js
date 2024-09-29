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

const CLARIFAI_API_URL = "https://api.clarifai.com/v2/models/face-detection/outputs";
const CLARIFAI_API_KEY = "ec0b830809234f1b90a4d0b3f8a0b5d1";

// Proxy route to Clarifai API
app.post('/clarifai-api', (req, res) => {
  const { input } = req.body;

  const requestOptions = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Key ${CLARIFAI_API_KEY}`
    },
    body: JSON.stringify({
      user_app_id: {
        user_id: 'qwe123',
        app_id: 'my-first-application-da5bga',
      },
      inputs: [
        {
          data: {
            image: {
              url: input,
            }
          }
        }
      ]
    })
  };

  fetch(CLARIFAI_API_URL, requestOptions)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(err => res.status(400).json('Error communicating with Clarifai API'));
});
