import Order from "../Models/Order.js";
import Product from "../Models/Product.js";
import DeliveryAddress from "../Models/DeliveryAddress.js"; // Uncommented this import
import sendEmail from "../Utils/emailService.js";
import User from "../Models/User.js";

export const createOrder = async (req, res) => {
  try {
    const { userId, items, address, paymentMethod, totalAmount } = req.body;

    if (!userId || !items || items.length === 0 || !address || !totalAmount) {
      return res.status(400).json({ success: false, message: "Missing required order details." });
    }

    let calculatedTotalAmount = 0;
    const itemsForOrder = [];
    const productDetailsForEmail = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${item.product} not found.` });
      }
      const actualPrice = product.offerPrice || product.price;

      itemsForOrder.push({
        product: item.product,
        quantity: item.quantity,
        priceAtOrder: actualPrice,
      });
      calculatedTotalAmount += actualPrice * item.quantity;

      productDetailsForEmail.push({
        name: product.name,
        quantity: item.quantity,
        price: actualPrice,
      });
    }

    const shippingFee = Math.ceil(calculatedTotalAmount * 0.005);
    calculatedTotalAmount += shippingFee;

    const order = await Order.create({
      user: userId,
      items: itemsForOrder,
      address: address,
      totalAmount: calculatedTotalAmount,
      paymentMethod: paymentMethod,
      status: "Pending",
    });

    for (const item of itemsForOrder) {
      const product = await Product.findById(item.product);
      if (product) {
        product.earnings += item.priceAtOrder * item.quantity;
        product.soldQuantity += item.quantity;
        product.quantity -= item.quantity;
        if (product.quantity <= 0) {
          product.quantity = 0;
          product.isActive = false;
        }
        await product.save();
      }
    }

    const user = await User.findById(userId);
    const deliveryAddress = await DeliveryAddress.findById(address);

    if (user && deliveryAddress) {
      const productTableRowsHtml = productDetailsForEmail.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>INR ${item.price.toFixed(2)}</td>
          <td>INR ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      const emailContentHtml = `
        <p>Dear ${user.name},</p>
        <p>Your Cash on Delivery (COD) order has been successfully placed!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Total Amount:</strong> INR ${order.totalAmount.toFixed(2)}</p>
        <p><strong>Order Details:</strong></p>
        <table border="1" style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price (per unit)</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productTableRowsHtml}
          </tbody>
        </table>
        <p><strong>Shipping Fee:</strong> INR ${shippingFee.toFixed(2)}</p>
        <p><strong>Total (including shipping):</strong> INR ${order.totalAmount.toFixed(2)}</p>
        <p><strong>Delivery Address:</strong></p>
        <p>${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.zipcode}, ${deliveryAddress.country}</p>
        <p>Phone: ${deliveryAddress.phone}</p>
        <p>We will process your order soon. Thank you for shopping with us!</p>
        <p>Best regards,</p>
        <p>The Sangam Society App Team</p>
      `;

      // Generate plain text version (simplified)
      const plainTextContent = `
Dear ${user.name},

Your Cash on Delivery (COD) order has been successfully placed!

Order ID: ${order._id}
Payment Method: ${order.paymentMethod}
Total Amount: INR ${order.totalAmount.toFixed(2)}

Order Details:
--------------------------------------------------
Product       Quantity    Price (per unit)    Subtotal
--------------------------------------------------
${productDetailsForEmail.map(item =>
  `${item.name.padEnd(14)} ${String(item.quantity).padEnd(10)} INR ${item.price.toFixed(2).padEnd(19)} INR ${(item.price * item.quantity).toFixed(2)}`
).join('\n')}
--------------------------------------------------
Shipping Fee: INR ${shippingFee.toFixed(2)}
Total (including shipping): INR ${order.totalAmount.toFixed(2)}

Delivery Address:
${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.zipcode}, ${deliveryAddress.country}
Phone: ${deliveryAddress.phone}

We will process your order soon. Thank you for shopping with us!

Best regards,
The Sangam Society App Team
`;

      console.log("COD Email HTML Content (for debug):", emailContentHtml);
      console.log("COD Email Plain Text Content (for debug):", plainTextContent);


      await sendEmail({
        to: user.email,
        subject: `Your COD Order from Sangam Society App - Order #${order._id} Placed!`,
        html: emailContentHtml,
        text: plainTextContent,
      });
    } else {
      console.warn("User or Delivery Address not found for email notification after COD order.");
    }

    res.status(201).json({ success: true, message: "Order placed successfully!", order });
  } catch (error) {
    console.error("Order placement failed:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    res.status(500).json({ success: false, message: "Server error during order placement." });
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
