import mongoose from 'mongoose';

const petsSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    playerID: { type: String, required: true },
    equipped: { type: Boolean, default: false },
  },
  { collection: 'pet' },
);
export default petsSchema;
