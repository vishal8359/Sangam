import Product from "../Models/Product.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";


// POST: User uploads product
export const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, description, society_id } = req.body;

    const files = req.files || [];

    const imageUrls = await Promise.all(
      files.map((file) => uploadToCloudinary(file.path, "products"))
    );

    const product = await Product.create({
      name,
      price,
      quantity,
      description,
      images: imageUrls,
      created_by: req.user._id,
      society_id: society_id || req.user.joined_society,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET: All active products
export const getActiveProducts = async (req, res) => {
  try {
    const products = await Product.find({
      society_id: req.user.joined_society,
      is_active: true,
    });
    res.json(products);
  } catch (err) {
    console.error("Fetch products error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE: Admin deactivates suspicious product
export const deactivateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.is_active = false;
    await product.save();

    res.json({ message: "Product deactivated by admin" });
  } catch (err) {
    console.error("Deactivate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE: By resident
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (product.created_by.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this product" });
    }

    for (const img of product.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Delete product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
