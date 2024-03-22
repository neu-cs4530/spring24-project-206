import mongoose from 'mongoose';

const petsSchema = new mongoose.Schema(
  {
    petID: { type: Number }, // TODO: remove
    type: { type: String, required: true },
    playerID: { type: Number, required: true },
    equipped: { type: Boolean, default: false },
  },
  { collection: 'pet' },
);
export default petsSchema;
