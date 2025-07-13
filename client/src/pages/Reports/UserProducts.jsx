import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
import soaps from "../../assets/soaps.jpg";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const purchasedProducts = [
  {
    id: 3,
    name: "Handmade Soap",
    description: "Natural soap with aloe vera.",
    date: "2025-06-19",
    image: soaps,
  },
];

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

  const pieData = [
    {
      name: "Sold",
      value: products.reduce(
        (acc, p) =>
          acc +
          (p.soldQuantity > 0 ? p.soldQuantity * (p.offerPrice ?? p.price) : 0),
        0
      ),
    },
    {
      name: "Unsold",
      value: products.reduce(
        (acc, p) =>
          acc +
          (p.soldQuantity === 0 ? p.quantity * (p.offerPrice ?? p.price) : 0),
        0
      ),
    },
  ];

  return (
    <Box
      sx={{
        width: isMobile ? "100vw" : "80",
        minHeight: "100vh",
        px: { xs: 1, sm: 3, md: 5 },
        py: 3,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
      >
        <Box
          color={isDark ? "#f5f5ff" : ""}
          component="h4"
          fontWeight={600}
          fontSize="2rem"
          sx={{ lineHeight: 1.3 }}
        >
          🛒 Your Products
        </Box>

        {/* Sell Product Button on the right */}
        <Button
          component={RouterLink}
          to="/reports/products"
          variant="contained"
          color="primary"
          startIcon={<ShoppingCartIcon />}
          size="large"
          sx={{ px: 4, borderRadius: 3, mt: { xs: 2, sm: 0 } }}
        >
          Sell Product
        </Button>
        <Button
          component={RouterLink}
          to="/reports/orders"
          variant="contained"
          color="primary"
          startIcon={<ReceiptLongIcon />}
          size="large"
          sx={{ px: 4, borderRadius: 3, mt: { xs: 2, sm: 0 } }}
        >
          Orders
        </Button>
      </Box>

      {/* Uploaded Products Section */}
      <Grid container spacing={3} mb={4}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card
              sx={{
                borderRadius: isMobile ? 2 : 3,
                boxShadow: theme.shadows[4],
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                width: isMobile ? 175 : 250,
              }}
            >
              {/* Product Image */}
              <CardMedia
                component="img"
                image={
                  product.images?.[0]?.url || "https://via.placeholder.com/150"
                }
                alt={product.name}
                sx={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  borderTopLeftRadius: isMobile ? 8 : 12,
                  borderTopRightRadius: isMobile ? 8 : 12,
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150"; // fallback if broken
                }}
              />

              {/* Product Info */}
              <CardContent
                sx={{
                  flex: 1,
                  px: 2,
                  pt: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Posted on: {new Date(product.createdAt).toLocaleDateString()}
                </Typography>

                <Typography mt={1}>
                  Quantity:{" "}
                  {product.quantity > 0 ? product.quantity : "Sold Out"}
                </Typography>
                <Typography>
                  Status: {product.sold ? "Sold" : "Available"}
                </Typography>
                <Typography fontWeight={500} color="success.main">
                  Earnings: ₹{product.soldQuantity * product.offerPrice ?? 0}
                </Typography>

                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">Listed</Typography>
                  <Switch
                    checked={product.isActive}
                    onChange={() => handleToggle(product._id)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pie Chart Section */}
      <Card sx={{ mb: 5, p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          📈 Earnings Distribution
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              nameKey="name"
              data={[
                {
                  name: "Sold",
                  value: products.reduce(
                    (acc, p) =>
                      acc + (p.soldQuantity || 0) * (p.offerPrice ?? p.price),
                    0
                  ),
                },
                {
                  name: "Unsold",
                  value: products.reduce((acc, p) => {
                    const remainingQty = p.quantity ?? 0;
                    const price = p.offerPrice ?? p.price;
                    return acc + remainingQty * price;
                  }, 0),
                },
              ]}
              outerRadius={100}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {COLORS.map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Purchased Products Section */}
      <Card sx={{ borderRadius: 3, p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          🛍️ Purchased Products
        </Typography>
        <Grid container spacing={3}>
          {purchasedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: theme.shadows[3],
                  width: 160,
                  height: 300,
                }}
              >
                <CardMedia
                  component="img"
                  height="150"
                  sx={{ height: 130 }}
                  image={product.image}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2">{product.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Purchased on: {product.date}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  );
};

export default YourProductsPage;
