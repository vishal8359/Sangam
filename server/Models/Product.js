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
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be under 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than or equal to 0"],
    },
    offerPrice: {
      type: Number,
      min: [0, "Offer price must be greater than or equal to 0"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity must be greater than or equal to 0"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description can't exceed 1000 characters"],
    },
    earnings: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: (val) => val.length > 0,
        message: "At least one image is required",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔁 Auto-unlist or relist based on quantity
productSchema.pre("save", function (next) {
  if (this.quantity <= 0) {
    this.isActive = false;
    this.quantity = 0;
  } else if (this.quantity > 0 && !this.isActive) {
    this.isActive = true;
  }
  next();
});

export default mongoose.model("Product", productSchema);
