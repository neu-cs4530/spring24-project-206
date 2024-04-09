import mongoose from 'mongoose';

const petsCatalogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    price: { type: Number, required: true },
    counter: { type: Number, required: true },
    img_id: { type: Number, required: true },
    speed: { type: Number, required: true },
  },
  { collection: 'pet-shop' },
);
export default petsCatalogSchema;
