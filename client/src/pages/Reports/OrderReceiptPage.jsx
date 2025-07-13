import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  CircularProgress,
  Button,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DownloadIcon from "@mui/icons-material/Download";


const OrderReceiptPage = () => {
  const { axios, token } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const receiptRefs = useRef({});

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/users/order/seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data.orders || []);
    } catch (err) {
      console.error("❌ Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const generatePDF = async (orderId) => {
    const element = receiptRefs.current[orderId];
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`receipt-${orderId}.pdf`);
  };

  if (loading) {
    return (
      <Box p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Order Receipts
      </Typography>

      {orders.length === 0 ? (
        <Typography>No orders yet.</Typography>
      ) : (
        orders.map((order) => (
          <Box key={order._id} mb={4}>
            <Paper
              sx={{ p: 2 }}
              ref={(el) => (receiptRefs.current[order._id] = el)}
            >
              {/* Order ID + Download Button Row */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Order ID: {order._id}</Typography>
                <Button
                  onClick={() => generatePDF(order._id)}
                  variant="outlined"
                  size="small"
                >
                  <DownloadIcon />
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Placed on: {new Date(order.placedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment: {order.paymentMethod}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600}>
                Customer Info:
              </Typography>
              <Typography>Name: {order.user?.name}</Typography>
              <Typography>Phone: {order.user?.phone_no}</Typography>
              <Typography>
                Address:{" "}
                {order.address?.street || order.address?.city || order.address?.state || order.address?.country
                  ? `${order.address?.street || ""}, ${order.address?.city || ""}, ${order.address?.state || ""}, ${order.address?.country || ""}`
                  : order.user?.address || "N/A"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600}>
                Products:
              </Typography>
              {order.items.map((item, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  my={1}
                >
                  <Avatar
                    src={item.product?.images?.[0]?.url}
                    alt={item.product?.name}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  />
                  <Box>
                    <Typography>{item.product?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Box>
        ))
      )}
    </Box>
  );
};

export default OrderReceiptPage;
