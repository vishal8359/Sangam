import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    description: { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    society_id: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    is_active: { type: Boolean, default: true }, // Admin can deactivate
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
