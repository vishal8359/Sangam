import Product from "../Models/Product.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";


// POST: User uploads product
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
        images.push(result);
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
    });

    await product.save();
    res.status(201).json({ message: "✅ Product added successfully", product });
  } catch (error) {
    console.error("❌ Product Upload Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getMyProducts = async (req, res) => {
  try {
    const myProducts = await Product.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    // Inject earnings field into each product
    const updatedProducts = myProducts.map((p) => ({
      ...p._doc,
      earnings: (p.price || 0) * (p.soldQuantity || 0), // You can change this logic as needed
    }));

    res.status(200).json(updatedProducts);
  } catch (error) {
    console.error("❌ Fetch My Products Error:", error);
    res.status(500).json({ message: "Failed to fetch your products." });
  }
};
export const getSocietyProducts = async (req, res) => {
  try {
    const { societyId } = req.user;

    const products = await Product.find({
      societyId,
      isActive: true,
    })
      .populate("createdBy", "name address")
      .sort({ createdAt: -1 });

    // Format the product data
    const formatted = products.map((p) => ({
      ...p._doc,
      image: p.images?.[0]?.url || "", 
      sellerName: p.createdBy?.name || "Unknown",
      sellerAddress: p.createdBy?.address || "N/A",
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("❌ Error in getSocietyProducts:", err);
    res.status(500).json({ message: "Failed to fetch society products." });
  }
};

export const toggleProductActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only owner can toggle
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      message: `Product ${product.isActive ? "listed" : "unlisted"} successfully`,
      isActive: product.isActive,
    });
  } catch (err) {
    console.error("❌ Error toggling product status:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getCartProducts = async (req, res) => {
  try {
    const { ids } = req.body; // Array of product IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided" });
    }

    const products = await Product.find({
      _id: { $in: ids },
      isActive: true,
    }).populate("createdBy", "name address");

    const formatted = products.map((p) => ({
      ...p._doc,
      image: p.images?.[0]?.url || "",
      sellerName: p.createdBy?.name || "Unknown",
      sellerAddress: p.createdBy?.address || "N/A",
    }));

    res.status(200).json({ products: formatted });
  } catch (err) {
    console.error("❌ Error fetching cart products:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
