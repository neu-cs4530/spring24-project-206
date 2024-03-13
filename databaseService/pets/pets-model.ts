import mongoose from "mongoose";
import petsSchema from "./pets-schema.ts";
const petsModel = mongoose.model("pet", petsSchema);
export default petsModel;