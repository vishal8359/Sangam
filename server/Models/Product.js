import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be >= 0"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity must be >= 0"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: (val) => val.length > 0,
        message: "At least one image is required",
      },
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    society_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true, // Admin can deactivate
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
