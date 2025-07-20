import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Switch,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { motion } from "framer-motion";

const COLORS = ["#00C49F", "#FF8042"];

const YourProductsPage = () => {
  const { axios, token } = useAppContext();
  const [products, setProducts] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const handleToggle = async (productId) => {
    try {
      const { data } = await axios.patch(
        `/api/users/products/${productId}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, isActive: data.isActive } : p
        )
      );

      toast.success(
        `Product ${data.isActive ? "listed" : "unlisted"} successfully`
      );
    } catch (err) {
      toast.error("Failed to update product listing");
      console.error("❌ Toggle error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchMyProducts = async () => {
      try {
        const { data } = await axios.get("/api/users/products/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(data);
      } catch (err) {
        toast.error("Failed to load your products.");
        console.error("❌ Fetch error:", err.response?.data || err.message);
      }
    };

    fetchMyProducts();
  }, [token]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await axios.get("/api/users/order/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const flattenedProducts = data.orders.flatMap((order) =>
          order.items.map((item) => ({
            id: item.product._id,
            name: item.product.name,
            image: item.product.images?.[0]?.url || "/default.jpg",
            date: new Date(order.createdAt || order.placedAt).toLocaleString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
            ),
          }))
        );

        setPurchasedProducts(flattenedProducts);
      } catch (err) {
        console.error("❌ Failed to fetch purchased products:", err);
      }
    };

    if (token) fetchMyOrders();
  }, [token]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        px: { xs: 2, sm: 3, md: 5 },
        py: 3,
        bgcolor: theme.palette.background.default,
        background: isDark
          ? `linear-gradient(180deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`
          : `linear-gradient(180deg, ${theme.palette.grey[50]}, ${theme.palette.background.default})`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          flexWrap="wrap"
        >
          <Typography
            component="h4"
            fontWeight={700}
            fontSize={{ xs: "2rem", sm: "2.5rem" }}
            sx={{
              lineHeight: 1.3,
              mb: isMobile? 2 : 0,
              color: isDark ? theme.palette.primary.light : theme.palette.primary.dark,
              textShadow: isDark ? "1px 1px 3px rgba(0,0,0,0.5)" : "none",
            }}
          >
            🛒 Your Products
          </Typography>

          <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, mt: { xs: 2, sm: 0 } }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                component={RouterLink}
                to="/reports/products"
                variant="contained"
                color="primary"
                startIcon={<ShoppingCartIcon />}
                size="large"
                sx={{
                  px: { xs: 2, sm: 4 },
                  borderRadius: 3,
                  whiteSpace: "nowrap",
                  bgcolor: isDark ? theme.palette.primary.dark : theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    bgcolor: isDark ? theme.palette.primary.main : theme.palette.primary.dark,
                  },
                  boxShadow: theme.shadows[3],
                }}
              >
                Sell Product
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                component={RouterLink}
                to="/reports/orders"
                variant="contained"
                color="secondary"
                startIcon={<ReceiptLongIcon />}
                size="large"
                sx={{
                  px: { xs: 2, sm: 4 },
                  borderRadius: 3,
                  whiteSpace: "nowrap",
                  bgcolor: isDark ? theme.palette.secondary.dark : theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  "&:hover": {
                    bgcolor: isDark ? theme.palette.secondary.main : theme.palette.secondary.dark,
                  },
                  boxShadow: theme.shadows[3],
                }}
              >
                Orders
              </Button>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />

      {/* Uploaded Products Section */}
      <Typography variant="h5" fontWeight={600} mb={3} color={theme.palette.text.primary}>
        🛍️ Your Listed Products
      </Typography>
      <Grid container spacing={3} mb={5}>
        {products.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: theme.shadows[6],
                  height: "100%",
                  display: "flex",
                  width: isMobile ? 185 : 300,
                  flexDirection: "column",
                  bgcolor: isDark ? theme.palette.background.paper : theme.palette.grey[100],
                  color: theme.palette.text.primary,
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: theme.shadows[10],
                  },
                  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                }}
              >
                {/* Product Image */}
                <CardMedia
                  component="img"
                  image={
                    product.images?.[0]?.url || "https://via.placeholder.com/200?text=No+Image"
                  }
                  alt={product.name}
                  sx={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                  }}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/200?text=No+Image";
                  }}
                />

                {/* Product Info */}
                <CardContent sx={{ flex: 1, px: 2, pt: 2, pb: 1 }}>
                  <Typography variant="h6" fontWeight={600} noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Posted on: {new Date(product.createdAt).toLocaleDateString()}
                  </Typography>

                  <Typography variant="body2" mt={1}>
                    Quantity:{" "}
                    <Typography component="span" fontWeight={500} color={product.quantity > 0 ? theme.palette.text.primary : theme.palette.error.main}>
                      {product.quantity > 0 ? product.quantity : "Sold Out"}
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    Status:{" "}
                    <Typography component="span" fontWeight={500} color={product.isActive ? theme.palette.success.main : theme.palette.error.main}>
                      {product.isActive ? "Available" : "Unlisted"}
                    </Typography>
                  </Typography>
                  <Typography fontWeight={600} color={theme.palette.success.main} mt={1}>
                    Earnings: ₹{(product.soldQuantity || 0) * (product.offerPrice ?? product.price) || 0}
                  </Typography>

                  <Box mt={2} display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                    <Typography variant="body2" fontWeight={500}>Listed for Sale:</Typography>
                    <Switch
                      sx={{
                        "& .MuiSwitch-thumb": {
                          backgroundColor: product.isActive
                            ? isDark
                              ? theme.palette.success.main
                              : theme.palette.primary.main
                            : theme.palette.grey[500],
                        },
                        "& .MuiSwitch-track": {
                          backgroundColor: product.isActive
                            ? isDark
                              ? theme.palette.success.light
                              : theme.palette.primary.light
                            : theme.palette.grey[300],
                          opacity: 0.5,
                        },
                      }}
                      checked={product.isActive}
                      onChange={() => handleToggle(product._id)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 5, borderColor: theme.palette.divider }} />

      {/* Pie Chart Section */}
      <Card sx={{ mb: 5, p: 3, borderRadius: 3, boxShadow: theme.shadows[6], bgcolor: theme.palette.background.paper }}>
        <Typography variant="h5" fontWeight={600} mb={2} color={theme.palette.text.primary}>
          📈 Earnings Distribution
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              nameKey="name"
              data={[
                {
                  name: "Sold Value",
                  value: products.reduce(
                    (acc, p) => acc + (p.soldQuantity || 0) * (p.offerPrice ?? p.price),
                    0
                  ),
                },
                {
                  name: "Unsold Value",
                  value: products.reduce((acc, p) => {
                    const remainingQty = (p.quantity ?? 0) - (p.soldQuantity ?? 0);
                    const price = p.offerPrice ?? p.price;
                    return acc + remainingQty * price;
                  }, 0),
                },
              ]}
              outerRadius={isMobile ? 80 : 100}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              fill="#8884d8"
            >
              {COLORS.map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Divider sx={{ mb: 5, borderColor: theme.palette.divider }} />

      {/* Purchased Products Section */}
      <Card sx={{ borderRadius: 3, p: 3, boxShadow: theme.shadows[6], bgcolor: theme.palette.background.paper }}>
        <Typography variant="h5" fontWeight={600} mb={2} color={theme.palette.text.primary}>
          🛍️ Purchased Products
        </Typography>
        <Grid container spacing={3}>
          {purchasedProducts.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" textAlign="center" py={3}>
                You haven't purchased any products yet.
              </Typography>
            </Grid>
          ) : (
            purchasedProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: theme.shadows[3],
                      height: "100%",
                      width: isMobile ? 160 : 200,
                      display: "flex",
                      flexDirection: "column",
                      bgcolor: isDark ? theme.palette.background.default : theme.palette.grey[50],
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: theme.shadows[6],
                      },
                      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="150"
                      sx={{ height: 160, objectFit: "cover", borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
                      image={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200?text=No+Image";
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}>
                      <Typography variant="h6" fontWeight={600} noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        Purchased on: {product.date}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>
      </Card>
    </Box>
  );
};

export default YourProductsPage;