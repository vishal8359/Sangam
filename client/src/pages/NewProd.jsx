import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  Paper,
  useMediaQuery,
  Badge,
} from "@mui/material";
import { FaStar, FaRegStar, FaShoppingCart } from "react-icons/fa";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import { keyframes } from "@emotion/react";
import { useAppContext } from "../context/AppContext";

import lamp from "../assets/lamp.jpg";
import vase from "../assets/vase.jpg";
import painting from "../assets/wall_painting.jpg";
import prod2 from "../assets/prod2_bg.jpg";

const dummyProducts = [
  {
    _id: "1",
    name: "Handmade Vase",
    price: 699,
    offerPrice: 499,
    image: [vase],
    category: "Decor",
    rating: 4.3,
    reviews: 4,
    sellerName: "Rita Arts",
    sellerAddress: "101, Maple Lane, Pune",
  },
  {
    _id: "2",
    name: "Wall Painting",
    price: 999,
    offerPrice: 799,
    image: [painting],
    category: "Decor",
    rating: 4.1,
    reviews: 4,
    sellerName: "Kala Studio",
    sellerAddress: "Sector 12, Noida",
  },
  {
    _id: "3",
    name: "Wooden Lamp",
    price: 1499,
    offerPrice: 1299,
    image: [lamp],
    category: "Lighting",
    rating: 4.5,
    reviews: 4,
    sellerName: "WoodWorks",
    sellerAddress: "MG Road, Bengaluru",
  },
];

const Products = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    products,
    setProducts,
    cartItems,
    updateCartItem,
    getCartCount,
    firstCartId,
    setFirstCartId,
  } = useAppContext();

  useEffect(() => {
    setProducts(dummyProducts);
  }, [setProducts]);

  const handleQtyChange = (productId, delta) => {
    const currentQty = cartItems[productId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    updateCartItem(productId, newQty);

    if (newQty > 0 && !firstCartId) setFirstCartId(productId);
    if (newQty === 0 && productId === firstCartId) setFirstCartId(null);
  };

  const backgroundMove = keyframes`
    0% { background-position: 0% 100%; }
    100% { background-position: 0% 0%; }
  `;

  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 6 },
        py: 3,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "200vh",
          backgroundImage: `url(${prod2})`,
          backgroundSize: "cover",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "center bottom",
          animation: `${backgroundMove} 30s linear infinite`,
          opacity: 0.1,
          filter: "blur(2px)",
          zIndex: -2,
        },
        ...(isDark && {
          "&::after": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "150vh",
            backgroundColor: "rgba(100, 10, 10, 0.1)",
            zIndex: -1,
          },
        }),
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "#e3f2fd",
          color: theme.palette.primary.main,
          borderRadius: 2,
          px: 2,
          py: 1,
          mb: 3,
          fontWeight: 600,
          fontSize: "1rem",
          boxShadow: 2,
          width: "fit-content",
        }}
      >
        <NewReleasesIcon sx={{ fontSize: 22 }} /> New Items
      </Box>

      {getCartCount() > 0 && firstCartId && (
        <Box
          onClick={() =>
            navigate(`/my-society/ads/cart`, {
              state: {
                product: products.find((p) => p._id === firstCartId),
              },
            })
          }
          sx={{
            position: "fixed",
            top: 75,
            right: 20,
            zIndex: 999,
            cursor: "pointer",
            bgcolor: theme.palette.background.paper,
            borderRadius: "50%",
            boxShadow: 3,
            p: 1.2,
          }}
        >
          <Badge badgeContent={getCartCount()} color="primary">
            <ShoppingCartIcon
              sx={{ fontSize: 30, color: theme.palette.primary.main }}
            />
          </Badge>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr 1fr",
          },
          gap: 3,
          justifyItems: "center",
        }}
      >
        {products.map((product) => (
          <Paper
            key={product._id}
            elevation={4}
            sx={{
              width: "100%",
              maxWidth: isMobile ? 160 : 280,
              p: isMobile ? 1.5 : 3,
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
              transition: "transform 0.2s ease",
              "&:hover": { transform: "scale(1.03)" },
            }}
          >
            <Box
              component="img"
              src={product.image[0]}
              alt={product.name}
              sx={{
                height: isMobile ? 60 : 140,
                width: "100%",
                objectFit: "contain",
                mb: isMobile ? 1 : 2,
              }}
            />

            <Typography
              align="center"
              fontWeight={600}
              fontSize={isMobile ? "0.8rem" : "1rem"}
            >
              {product.name}
            </Typography>
            {/* Seller Info */}
            <Typography
              align="center"
              fontSize="0.75rem"
              color="text.secondary"
            >
              Seller: {product.sellerName || "Unknown"}
            </Typography>
            <Typography
              align="center"
              fontSize="0.7rem"
              color="text.secondary"
              mb={1}
            >
              {product.sellerAddress || "N/A"}
            </Typography>

            <Box display="flex" justifyContent="center" mt={isMobile ? 0.5 : 1}>
              {Array.from({ length: 5 }, (_, i) =>
                i < Math.floor(product.rating) ? (
                  <FaStar key={i} size={isMobile ? 12 : 16} color="gold" />
                ) : (
                  <FaRegStar key={i} size={isMobile ? 12 : 16} color="gold" />
                )
              )}
            </Box>

            <Box
              mt={isMobile ? 1 : 2}
              display="flex"
              justifyContent="center"
              gap={1}
            >
              <Typography color="success.main">
                ₹{product.offerPrice}
              </Typography>
              <Typography
                sx={{
                  textDecoration: "line-through",
                  color: theme.palette.text.secondary,
                }}
              >
                ₹{product.price}
              </Typography>
            </Box>

            <Box mt={2} display="flex" justifyContent="center">
              {cartItems[product._id] ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border={`1px solid ${theme.palette.success.main}`}
                  borderRadius={2}
                  width={120}
                  height={40}
                  bgcolor={theme.palette.success.light}
                >
                  <IconButton
                    onClick={() => handleQtyChange(product._id, -1)}
                    size="small"
                    sx={{ color: theme.palette.success.dark }}
                  >
                    –
                  </IconButton>
                  <Typography sx={{ mx: 1.5, fontWeight: 500 }}>
                    {cartItems[product._id]}
                  </Typography>
                  <IconButton
                    onClick={() => handleQtyChange(product._id, 1)}
                    size="small"
                    sx={{ color: theme.palette.success.dark }}
                  >
                    +
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<FaShoppingCart />}
                  onClick={() => handleQtyChange(product._id, 1)}
                  sx={{ minWidth: 120 }}
                >
                  Add
                </Button>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Products;
