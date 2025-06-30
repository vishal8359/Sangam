import React, { useState } from "react";
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
import soaps from "../../assets/soaps.jpg";
import pickels from "../../assets/pickels.jpg";
import honey from "../../assets/honey.jpeg";

const sampleProducts = [
  {
    id: 1,
    name: "Organic Honey",
    quantity: 0,
    description: "Pure organic honey from local bees.",
    date: "2025-06-20",
    image: honey,
    price: 250,
    sold: true,
    earnings: 2500,
    listed: true,
  },
  {
    id: 2,
    name: "Homemade Pickles",
    quantity: 5,
    description: "Spicy mango pickles, 500g jar.",
    date: "2025-06-15",
    image: pickels,
    price: 150,
    sold: false,
    earnings: 450,
    listed: true,
  },
];

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
  const [products, setProducts] = useState(sampleProducts);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const handleToggle = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, listed: !p.listed } : p))
    );
  };

  const navigate = useNavigate();

  const pieData = [
    {
      name: "Sold",
      value: products
        .filter((p) => p.sold)
        .reduce((acc, p) => acc + p.earnings, 0),
    },
    {
      name: "Unsold",
      value: products
        .filter((p) => !p.sold)
        .reduce((acc, p) => acc + p.earnings, 0),
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
        flexWrap="wrap" // ensures responsiveness on small screens
      >
        {/* Title on the left */}
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
          component={RouterLink} to="/reports/products"
          variant="contained"
          color="primary"
          startIcon={<ShoppingCartIcon />}
          size="large"
          sx={{ px: 4, borderRadius: 3, mt: { xs: 2, sm: 0 } }}
        >
          Sell Product
        </Button>
      </Box>

      {/* Uploaded Products Section */}
      <Grid container spacing={3} mb={4}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
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
                image={product.image}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  borderTopLeftRadius: isMobile ? 8 : 12,
                  borderTopRightRadius: isMobile ? 8 : 12,
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
                  Posted on: {product.date}
                </Typography>
                <Typography mt={1}>
                  Quantity:{" "}
                  {product.quantity > 0 ? product.quantity : "Sold Out"}
                </Typography>
                <Typography>
                  Status: {product.sold ? "Sold" : "Available"}
                </Typography>
                <Typography fontWeight={500} color="success.main">
                  Earnings: ₹{product.earnings}
                </Typography>
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">Listed</Typography>
                  <Switch
                    checked={product.listed}
                    onChange={() => handleToggle(product.id)}
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
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
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
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3], width:160, height:310 }}>
                <CardMedia
                  component="img"
                  height="150"
                  sx={{height:130}}
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
