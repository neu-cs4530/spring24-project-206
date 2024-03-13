// this coding pattern was inspired by a previous semester's group project 409 

import express from 'express';
import PetsController from './pets/pets-controller.js';
import session from "express-session";
import "dotenv/config";
import mongoose from "mongoose";
import connectMongo from "connect-mongo";

// connect to mongo
const CONNECTION_STRING = 'mongodb+srv://ananya:cWxO4lhcRGjkMx9S@personal-pet-collection.hbmnsu4.mongodb.net/?retryWrites=true&w=majority&appName=personal-pet-collection'; 
console.log("Trying to connect to MongoDB...");
mongoose.connect(CONNECTION_STRING)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB:', err));

const app = express();

const store = connectMongo.create({ mongoUrl: CONNECTION_STRING });

const sessionOptions = {
    secret: "any string",
    resave: false,
    saveUninitialized: false,
    store: store
};

app.use(session(sessionOptions));
  
app.use(express.json());

// Logging for Debugging
app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body);
    next();
});

PetsController(app); 

// error handling 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});