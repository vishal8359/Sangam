import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DownloadIcon from "@mui/icons-material/Download";
import { motion, AnimatePresence } from "framer-motion";

const OrderReceiptPage = () => {
  const { axios, token } = useAppContext();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const receiptRefs = useRef({}); // Ref to store DOM elements for PDF generation

  // Framer Motion Variants for animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const orderCardVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const itemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  /**
   * Fetches orders from the backend API.
   * IMPORTANT: The backend API must populate the 'product' field within each item.
   * For example, if using Mongoose, your query might look like:
   * Order.find({ seller: sellerId }).populate('items.product');
   */
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/users/order/seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort orders by placedAt in descending order (most recent first)
      const sortedOrders = data.orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
      setOrders(sortedOrders || []);
    } catch (err) {
      console.error("❌ Failed to fetch orders:", err);
      // You might want to show a user-friendly error message here, e.g., using toast.error
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when component mounts or token changes
  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => {
      // Use offerPrice if available, otherwise regular price
      const price = item.product?.offerPrice || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const generatePDF = async (orderId) => {
    const element = receiptRefs.current[orderId];
    if (!element) {
      console.error("Receipt element not found for order ID:", orderId);
      return;
    }

    // Use a higher scale for better PDF quality
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4"); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
 
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Add the image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    // Save the PDF with a dynamic filename
    pdf.save(`receipt-${orderId}.pdf`);
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        <CircularProgress color="primary" size={60} />
        <Typography variant="h6" ml={2} color="text.secondary">Loading Orders...</Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        padding: isMobile ? theme.spacing(2) : theme.spacing(4),
      }}
    >
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom fontWeight="bold" mb={4}>
        Order Receipts
      </Typography>

      {orders.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
            color: theme.palette.text.secondary,
          }}
        >
          <Typography variant="h6" mb={2}>
            No orders found.
          </Typography>
          <Typography variant="body1">
            It looks like you haven't received any orders yet.
          </Typography>
        </Box>
      ) : (
        <AnimatePresence>
          {orders.map((order) => {
            // Calculate total amount for the current order
            const orderTotal = calculateOrderTotal(order.items);

            return (
              <motion.div
                key={order._id}
                variants={orderCardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout // Enables smooth layout transitions for items being added/removed
                style={{ marginBottom: theme.spacing(4) }}
              >
                <Paper
                  elevation={6} // Increased elevation for a more premium look
                  sx={{
                    p: isMobile ? 2 : 4, // Responsive padding
                    borderRadius: 3, // More rounded corners
                    backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.background.paper,
                    boxShadow: isDark
                      ? `0px 8px 20px rgba(0,0,0,0.4)`
                      : `0px 8px 20px rgba(0,0,0,0.1)`, // Enhanced shadow
                    overflow: 'hidden', // Ensure internal content doesn't break layout
                  }}
                  // Set the ref to the Paper element for html2canvas
                  ref={(el) => (receiptRefs.current[order._id] = el)}
                >
                  {/* Order ID + Download Button Row */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600} color={theme.palette.primary.main}>
                      Order ID: {order._id.substring(0, 8)}... {/* Truncate for brevity */}
                    </Typography>
                    <Button
                      onClick={() => generatePDF(order._id)}
                      variant="contained" // Use contained variant for prominence
                      size="medium" // Medium size button
                      startIcon={<DownloadIcon />}
                      sx={{
                        borderRadius: 2,
                        fontWeight: "bold",
                        bgcolor: theme.palette.secondary.main, // Use secondary color for download
                        color: theme.palette.secondary.contrastText,
                        "&:hover": {
                          bgcolor: theme.palette.secondary.dark,
                          transform: "translateY(-2px)", // Subtle lift on hover
                          boxShadow: theme.shadows[4],
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      PDF
                    </Button>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Placed on: {new Date(order.placedAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method: {order.paymentMethod}
                  </Typography>

                  <Divider sx={{ my: 3, borderColor: isDark ? theme.palette.grey[700] : theme.palette.grey[300] }} />

                  {/* Customer Info Section */}
                  <motion.div variants={itemVariants}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      Customer Information:
                    </Typography>
                    <Typography variant="body2">Name: {order.user?.name || "N/A"}</Typography>
                    <Typography variant="body2">Phone: {order.user?.phone_no || "N/A"}</Typography>
                    <Typography variant="body2">
                      Address:{" "}
                      {order.address?.street || order.address?.city || order.address?.state || order.address?.country
                        ? `${order.address?.street || ""}${order.address?.street ? ", " : ""}` +
                          `${order.address?.city || ""}${order.address?.city ? ", " : ""}` +
                          `${order.address?.state || ""}${order.address?.state ? ", " : ""}` +
                          `${order.address?.country || ""}`
                        : order.user?.address || "N/A"}
                    </Typography>
                  </motion.div>

                  <Divider sx={{ my: 3, borderColor: isDark ? theme.palette.grey[700] : theme.palette.grey[300] }} />

                  {/* Products Section */}
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Products Ordered:
                  </Typography>
                  {order.items.map((item, index) => {
                    // Use offerPrice if available, otherwise regular price
                    const itemPrice = item.product?.offerPrice || item.product?.price || 0;
                    const itemTotalPrice = (itemPrice * item.quantity).toFixed(2);

                    return (
                      <motion.div key={item.product?._id || index} variants={itemVariants}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={isMobile ? 1.5 : 2}
                          mb={2}
                          sx={{
                            bgcolor: isDark ? theme.palette.grey[800] : theme.palette.grey[100],
                            p: 1.5,
                            borderRadius: 2,
                            boxShadow: theme.shadows[1], // Subtle shadow for each product item
                            transition: "background-color 0.2s ease-in-out",
                            "&:hover": {
                              bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[200],
                            },
                          }}
                        >
                          <Avatar
                            src={item.product?.images?.[0]?.url || 'https://placehold.co/56x56/cccccc/333333?text=No+Image'} // Placeholder for missing image
                            alt={item.product?.name || "Product"}
                            variant="rounded"
                            sx={{
                              width: 56,
                              height: 56,
                              border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}`,
                              flexShrink: 0,
                            }}
                          />
                          <Box flexGrow={1}>
                            <Typography variant="body1" fontWeight={500}>
                              {item.product?.name || "Unknown Product"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Price per item: ₹{itemPrice.toFixed(2)}
                            </Typography>
                          </Box>
                          <Typography variant="body1" fontWeight={600} sx={{ ml: 2, flexShrink: 0 }}>
                            Total: ₹{itemTotalPrice}
                          </Typography>
                        </Box>
                      </motion.div>
                    );
                  })}

                  <Divider sx={{ my: 3, borderColor: isDark ? theme.palette.grey[700] : theme.palette.grey[300] }} />

                  {/* Total Section */}
                  <motion.div variants={itemVariants}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="h6" fontWeight={700}>
                        Order Total:
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color={theme.palette.success.main}>
                        ₹{orderTotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </motion.div>
                </Paper>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default OrderReceiptPage;