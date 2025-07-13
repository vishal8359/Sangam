// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
  },
  paymentMethod: { type: String, enum: ["COD", "Online"], default: "COD" },
  placedAt: { type: Date, default: Date.now },
}, { timestamps: true });
const Order = mongoose.model("Order", orderSchema);
export default Order;
