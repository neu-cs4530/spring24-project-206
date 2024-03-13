import mongoose from "mongoose";
const petsSchema = new mongoose.Schema({
  petID: {type: Number, required: true}, 
  playerID: {type: Number, required: true},
  speed: {type: Number, required: true},
}, { collection: "pet" });
export default petsSchema;