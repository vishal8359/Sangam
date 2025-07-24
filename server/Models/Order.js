// server/Models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        // Required for accurate historical pricing of items
        priceAtOrder: {
          type: Number,
          required: true,
        },
      },
    ],
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAddress",
      required: true,
    },
    // Total amount of the order, including shipping
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Paid", "Failed"],
      default: "Pending",
    },
    razorpayOrderId: {
      type: String,
      required: function() { return this.paymentMethod === 'Online'; },
    },
    razorpayPaymentId: {
      type: String,
      required: function() { return this.paymentMethod === 'Online' && this.status === 'Paid'; },
    },
    razorpaySignature: {
      type: String,
      required: function() { return this.paymentMethod === 'Online' && this.status === 'Paid'; },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);