// controllers/orderController.js
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";
import DeliveryAddress from "../Models/DeliveryAddress.js"; // Uncommented this import

export const createOrder = async (req, res) => {
  try {
    const { userId, items, address, paymentMethod = "COD" } = req.body;

    if (!userId || !items?.length || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Missing order details" });
    }

    // 1. Create order first
    const order = await Order.create({
      user: userId,
      items,
      address, // This should be the _id of the DeliveryAddress document
      paymentMethod,
    });

    // 2. Update each product: soldQuantity, earnings, quantity, isActive
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (product) {
        const price = product.offerPrice ?? product.price;
        const earnings = price * item.quantity;

        product.earnings += earnings;
        product.soldQuantity += item.quantity;
        product.quantity -= item.quantity;

        // Ensure quantity doesn't go below 0 and deactivate product
        if (product.quantity <= 0) {
          product.quantity = 0;
          product.isActive = false;
        }

        await product.save();
      }
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Order placement failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// controllers/orderController.js

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const allOrders = await Order.find()
      .populate("user", "name phone_no address") // Populates user details
      .populate("address") // Populate the DeliveryAddress document
      .populate({
        path: "items.product",
        select: "name images seller offerPrice",
      })
      .lean();

    console.log("Seller ID:", sellerId);
    console.log("All orders fetched:", allOrders.length);

    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        console.log("Item:", {
          productId: item.product?._id,
          seller: item.product?.seller,
        });
      });
    });

    // Filter orders that contain at least one product uploaded by this seller
    const sellerOrders = allOrders
      .map((order) => {
        const sellerItems = order.items.filter(
          (item) => item.product?.seller?.toString() === sellerId.toString()
        );

        return sellerItems.length > 0 ? { ...order, items: sellerItems } : null;
      })
      .filter(Boolean); 

    res.status(200).json({ success: true, orders: sellerOrders });
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const myOrders = await Order.find({ user: req.user._id })
      .populate("address") // Populate the DeliveryAddress document for buyer's own orders
      .populate({
        path: "items.product",
        select: "name images description",
      })
      .lean();

    res.status(200).json({ success: true, orders: myOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
