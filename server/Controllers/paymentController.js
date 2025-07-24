import razorpayInstance from "../Utils/razorpayInstance.js";
import crypto from "crypto";
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";
import User from "../Models/User.js";
import DeliveryAddress from "../Models/DeliveryAddress.js";
import sendEmail from "../Utils/emailService.js";

export const createRazorpayOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount for Razorpay order." });
    }

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      message: "Razorpay order created successfully.",
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create Razorpay order." });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload,
    } = req.body;

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      console.warn("Razorpay signature verification failed!");
      return res.status(400).json({ success: false, message: "Transaction not authentic!" });
    }

    const { userId, items, address, totalAmount, paymentMethod } = orderPayload;

    if (!userId || !items?.length || !address || !totalAmount || paymentMethod !== 'Online') {
      return res.status(400).json({ success: false, message: "Missing or invalid order details for DB entry after payment verification." });
    }

    let order;
    const productDetailsForEmail = [];
    try {
      order = await Order.create({
        user: userId,
        items: items,
        address: address,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        status: "Paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });

      for (const item of items) {
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
          productDetailsForEmail.push({
            name: product.name,
            quantity: item.quantity,
            price: item.priceAtOrder,
          });
        } else {
          console.warn(`Product with ID ${item.product} not found during payment verification for order ${order._id}. Stock not updated.`);
        }
      }

    } catch (dbError) {
      console.error("Error saving order to DB after Razorpay verification:", dbError);
      return res.status(500).json({ success: false, message: "Order could not be saved after successful payment verification." });
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
        <p>Your online payment for Order ID <strong>${order._id}</strong> was successful!</p>
        <p>Your order has been successfully placed and will be processed shortly.</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Total Amount Paid:</strong> INR ${order.totalAmount.toFixed(2)}</p>
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
        <p><strong>Delivery Address:</strong></p>
        <p>${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.zipcode}, ${deliveryAddress.country}</p>
        <p>Phone: ${deliveryAddress.phone}</p>
        <p>Thank you for your purchase!</p>
        <p>Best regards,</p>
        <p>The Sangam Society App Team</p>
      `;

      // Generate plain text version (simplified)
      const plainTextContent = `
Dear ${user.name},

Your online payment for Order ID ${order._id} was successful!
Your order has been successfully placed and will be processed shortly.

Payment ID: ${razorpay_payment_id}
Order ID: ${order._id}
Payment Method: ${order.paymentMethod}
Total Amount Paid: INR ${order.totalAmount.toFixed(2)}

Order Details:
--------------------------------------------------
Product       Quantity    Price (per unit)    Subtotal
--------------------------------------------------
${productDetailsForEmail.map(item =>
  `${item.name.padEnd(14)} ${String(item.quantity).padEnd(10)} INR ${item.price.toFixed(2).padEnd(19)} INR ${(item.price * item.quantity).toFixed(2)}`
).join('\n')}
--------------------------------------------------

Delivery Address:
${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.zipcode}, ${deliveryAddress.country}
Phone: ${deliveryAddress.phone}

Thank you for your purchase!

Best regards,
The Sangam Society App Team
`;

      console.log("Online Payment Email HTML Content (for debug):", emailContentHtml);
      console.log("Online Payment Email Plain Text Content (for debug):", plainTextContent);

      await sendEmail({
        to: user.email,
        subject: `Payment Successful & Order Placed - Order #${order._id} (Sangam Society App)`,
        html: emailContentHtml,
        text: plainTextContent,
      });
    } else {
      console.warn("User or Delivery Address not found for email notification after online payment.");
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to verify payment." });
  }
};