import Product from "../Models/Product.js";
import Order from "../Models/Order.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import mongoose from "mongoose";
import User from "../Models/User.js";

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      offerPrice,
      quantity,
      description,
      rating,
      societyId,
    } = req.body;
    const uploader = req.user._id;
    const images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "sangam-products",
          file.mimetype
        );
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const product = new Product({
      name,
      price,
      offerPrice,
      quantity,
      description,
      rating,
      images,
      createdBy: uploader,
      societyId,
      seller: uploader,
    });

    await product.save();
    res.status(201).json({ message: "✅ Product added successfully", product });
  } catch (error) {
    console.error("Product Upload Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const myProducts = await Product.find({
      createdBy: req.user._id,
    })
      .populate("seller", "name address")
      .sort({ createdAt: -1 })
      .lean();

    const updatedProducts = myProducts.map((p) => {
      const price = p.offerPrice ?? p.price;
      const earnings = (price || 0) * (p.soldQuantity || 0);
      return {
        ...p,
        earnings: earnings,
        sellerName: p.seller?.name || "Unknown",
        sellerAddress: p.seller?.address || "N/A",
      };
    });

    res.status(200).json(updatedProducts);
  } catch (error) {
    console.error("Fetch My Products Error:", error);
    res.status(500).json({ message: "Failed to fetch your products." });
  }
};

export const getSocietyProducts = async (req, res) => {
  try {
    const { societyId } = req.query;
    const currentUserId = req.user._id;

    if (!societyId) {
      return res.status(400).json({ message: "societyId is required" });
    }

    const products = await Product.find({
      societyId,
      isActive: true,
      seller: { $ne: currentUserId },
    })
      .populate("seller", "name address")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = products.map((p) => ({
      ...p,
      image: p.images?.[0]?.url || "",
      sellerName: p.seller?.name || "Unknown",
      sellerAddress: p.seller?.address || "N/A",
    }));

    res.status(200).json({ products: formatted });
  } catch (err) {
    console.error("Error in getSocietyProducts:", err);
    res.status(500).json({ message: "Failed to fetch society products." });
  }
};

export const getAllProductsForAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("seller", "name address")
      .sort({ createdAt: -1 })
      .lean();

    const formattedProducts = products.map((p) => ({
      ...p,
      image: p.images?.[0]?.url || "",
      sellerName: p.seller?.name || "Unknown",
      sellerAddress: p.seller?.address || "N/A",
    }));

    res.status(200).json({ products: formattedProducts });
  } catch (error) {
    console.error("Error in getAllProductsForAdmin:", error);
    res.status(500).json({ message: "Failed to fetch all products for admin." });
  }
};

export const toggleProductActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      message: `Product ${
        product.isActive ? "listed" : "unlisted"
      } successfully`,
      isActive: product.isActive,
    });
  } catch (err) {
    console.error("Error toggling product status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided" });
    }

    const products = await Product.find({
      _id: { $in: ids },
      isActive: true,
    })
      .populate("seller", "name address")
      .lean();

    const formatted = products.map((p) => ({
      ...p,
      image: p.images?.[0]?.url || "",
      sellerName: p.seller?.name || "N/A",
      sellerAddress: p.seller?.address || "Not Provided",
    }));

    res.status(200).json({ products: formatted });
  } catch (err) {
    console.error("Error fetching cart products:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getSellerProductsWithStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const soldStats = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      { $match: { "productDetails.seller": sellerId } },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
    ]);

    const soldMap = new Map();
    soldStats.forEach((item) => {
      soldMap.set(item._id.toString(), item.totalSold);
    });

    const products = await Product.find({ seller: sellerId }).lean();

    const enrichedProducts = products.map((product) => {
      const soldQty = soldMap.get(product._id.toString()) || 0;
      const price = product.offerPrice ?? product.price;
      const earnings = soldQty * price;

      return {
        ...product,
        soldQuantity: soldQty,
        earnings,
      };
    });

    res.status(200).json({ success: true, products: enrichedProducts });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId)
      .populate("seller", "name address")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.sellerName = product.seller?.name || "N/A";
    product.sellerAddress = product.seller?.address || "Not Provided";

    delete product.seller;

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error in getProductById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const { societyId, exclude } = req.query;

    if (!societyId) {
      return res.status(400).json({ message: "societyId is required" });
    }

    const query = {
      societyId,
      isActive: true,
    };

    if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
      query._id = { $ne: exclude };
    }

    const products = await Product.find(query)
      .populate("seller", "name address")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-__v")
      .lean();

    const formatted = products.map((p) => ({
      ...p,
      image: p.images?.[0]?.url || "",
      sellerName: p.seller?.name || "Unknown",
      sellerAddress: p.seller?.address || "N/A",
    }));

    res.status(200).json({ products: formatted });
  } catch (error) {
    console.error("Error in getRelatedProducts:", error);
    res.status(500).json({ message: "Server error" });
  }
};