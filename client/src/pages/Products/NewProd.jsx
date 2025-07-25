import { useEffect, useState } from "react";
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
  CircularProgress, // Added for loading state
} from "@mui/material";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaShoppingCart,
} from "react-icons/fa";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import { keyframes } from "@emotion/react";
import { useAppContext } from "../../context/AppContext.jsx";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence

import prod2 from "../../assets/prod2_bg.jpg"; // Background image

const Products = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const {
    axios,
    token,
    societyId, // Destructure societyId from useAppContext
    products,
    setProducts,
    cartItems,
    updateCartItem,
    getCartCount,
    firstCartId,
    setFirstCartId,
  } = useAppContext();

  const [loading, setLoading] = useState(true); // New loading state for products

  // Framer Motion Variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } },
  };

  const productCardVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const cartIconVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 10 },
    },
    bounce: {
      scale: [1, 1.2, 1], // Bounce effect
      transition: { duration: 0.3, type: "keyframes", ease: "easeOut" }, // Changed type to "keyframes"
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" },
    tap: { scale: 0.95 },
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token || !societyId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await axios.get(`/api/users/products?societyId=${societyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(data.products); 
      } catch (err) {
        console.error("❌ Error fetching society products:", err);
        toast.error("Failed to load products.");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchProducts();
  }, [token, societyId, setProducts, axios]); // Added societyId to dependencies

  const handleQtyChange = (productId, delta) => {
    const currentQty = cartItems[productId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    // Find the product to check its available quantity
    const product = products.find((p) => p._id === productId);
    if (product && newQty > product.quantity) {
      toast.error(
        `Only ${product.quantity} of ${product.name} left. Please reduce quantity.`
      );
      return; // Prevent update if quantity exceeds available
    }

    updateCartItem(productId, newQty);

    if (newQty > 0 && !firstCartId) setFirstCartId(productId);
    if (newQty === 0 && productId === firstCartId) setFirstCartId(null);
  };

  // Keyframes for the background animation
  const backgroundMove = keyframes`
    0% { background-position: 0% 100%; }
    100% { background-position: 0% 0%; }
  `;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{
        minHeight: "100vh",
        padding: isMobile ? theme.spacing(2) : theme.spacing(6),
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        backgroundColor: isDark ? theme.palette.background.default : "#fff",
      }}
    >
      {/* Animated Background Layer */}
      <Box
        sx={{
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
          opacity: 0.05,
          filter: "blur(0px)", // Keep blur at 0 as per original
          zIndex: -2,
        }}
      />
      {/* Dark Mode Overlay */}
      {isDark && (
        <Box
          sx={{
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "150vh",
            backgroundColor: "rgba(100, 10, 10, 0.1)", // Original dark overlay color
            zIndex: -1,
          }}
        />
      )}

      {/* "New Items" Badge */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: "#fff",
          color: "#000",
          borderRadius: 2,
          px: 2,
          py: 1,
          mb: 3,
          fontWeight: 600,
          fontSize: "1rem",
          boxShadow: theme.shadows[2],
          width: "fit-content",
        }}
      >
        <NewReleasesIcon sx={{ fontSize: 22 }} /> New Items
      </Box>

      {/* Floating Cart Icon */}
      {getCartCount() > 0 && firstCartId && (
        <motion.div
          initial="initial"
          animate="animate"
          whileTap="bounce"
          variants={cartIconVariants}
          onClick={() => navigate(`/my-society/ads/cart`)}
          style={{
            position: "fixed",
            top: 75,
            right: 20,
            zIndex: 999,
            cursor: "pointer",
            backgroundColor: theme.palette.background.paper,
            borderRadius: "50%",
            boxShadow: theme.shadows[3],
            padding: theme.spacing(1.2),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Badge badgeContent={getCartCount()} color="primary">
            <ShoppingCartIcon
              sx={{
                fontSize: 30,
                color: isDark ? "#ffff" : theme.palette.primary.main,
              }}
            />
          </Badge>
        </motion.div>
      )}

      {/* Products Grid */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" ml={2} color="text.secondary">
            Loading Products...
          </Typography>
        </Box>
      ) : products.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 5,
            color: theme.palette.text.secondary,
          }}
        >
          <Typography variant="h6">No products available yet.</Typography>
          <Typography variant="body1">
            Check back later or add your own!
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
              lg: "1fr 1fr 1fr 1fr",
            },
            gap: isMobile ? theme.spacing(2) : theme.spacing(3),
            justifyItems: "center",
          }}
        >
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product._id}
                variants={productCardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover={{ y: -5, boxShadow: theme.shadows[8] }}
                transition={{ duration: 0.2 }}
                layout
                style={{ width: "100%" }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    width: "100%",
                    maxWidth: isMobile ? 160 : 280,
                    p: isMobile ? 1.5 : 3,
                    borderRadius: 3,
                    bgcolor: isDark
                      ? theme.palette.grey[900]
                      : theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[4],
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  {/* Product Image */}
                  <Box
                    onClick={() =>
                      navigate(
                        `/my-society/ads/${product._id}/product_detail`,
                        {
                          state: { product },
                        }
                      )
                    }
                    component="img"
                    src={
                      product.images?.[0]?.url ||
                      "https://placehold.co/150x150/cccccc/333333?text=No+Image"
                    }
                    alt={product.name}
                    sx={{
                      height: isMobile ? 100 : 140,
                      width: "100%",
                      objectFit: "contain",
                      mb: isMobile ? 1 : 2,
                      cursor: "pointer",
                      borderRadius: 2,
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/150x150/cccccc/333333?text=No+Image"; // Fallback if broken
                    }}
                  />

                  {/* Product Name */}
                  <Typography
                    onClick={() =>
                      navigate(
                        `/my-society/ads/${product._id}/product_detail`,
                        {
                          state: { product },
                        }
                      )
                    }
                    align="center"
                    fontWeight={600}
                    fontSize={isMobile ? "0.9rem" : "1.1rem"} // Adjusted font size
                    sx={{
                      mb: 0.5,
                      lineHeight: 1.2,
                      color: isDark ? "#fff" : "",
                      cursor: "pointer",
                    }}
                  >
                    {product.name}
                  </Typography>
                  {/* Seller Info */}
                  <Typography
                    onClick={() =>
                      navigate(
                        `/my-society/ads/${product._id}/product_detail`,
                        {
                          state: { product },
                        }
                      )
                    }
                    align="center"
                    fontSize="0.75rem"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    Seller: {product.sellerName || "N/A"}
                  </Typography>
                  <Typography
                    onClick={() =>
                      navigate(
                        `/my-society/ads/${product._id}/product_detail`,
                        {
                          state: { product },
                        }
                      )
                    }
                    align="center"
                    fontSize="0.7rem"
                    color="text.secondary"
                    mb={1}
                    sx={{ cursor: "pointer" }}
                  >
                    {product.sellerAddress || "N/A"}
                  </Typography>

                  {/* Rating Stars */}
                  <Box
                    display="flex"
                    onClick={() =>
                      navigate(
                        `/my-society/ads/${product._id}/product_detail`,
                        {
                          state: { product },
                        }
                      )
                    }
                    justifyContent="center"
                    mt={isMobile ? 0.5 : 1}
                    mb={1}
                    sx={{cursor:"pointer"}}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const rating = product.rating || 0; // Ensure rating is a number
                      if (i < Math.floor(rating)) {
                        return (
                          <FaStar
                            key={i}
                            size={isMobile ? 14 : 18}
                            color={theme.palette.warning.main}
                          />
                        );
                      } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                        // Check for half star
                        return (
                          <FaStarHalfAlt
                            key={i}
                            size={isMobile ? 14 : 18}
                            color={theme.palette.warning.main}
                          />
                        );
                      } else {
                        return (
                          <FaRegStar
                            key={i}
                            size={isMobile ? 14 : 18}
                            color={theme.palette.warning.light}
                          />
                        );
                      }
                    })}
                  </Box>

                  {/* Price Info */}
                  <Box
                    mt={isMobile ? 1 : 2}
                    display="flex"
                    justifyContent="center"
                    gap={1}
                    alignItems="center"
                  >
                    <Typography
                      color={theme.palette.primary.main}
                      fontWeight={600}
                      fontSize={isMobile ? "1rem" : "1.1rem"}
                      sx={{
                        color: isDark ? "#fff" : "",
                      }}
                    >
                      ₹
                      {product.offerPrice?.toFixed(2) ||
                        product.price?.toFixed(2) ||
                        "0.00"}
                    </Typography>
                    {product.offerPrice &&
                      product.price &&
                      product.offerPrice < product.price && (
                        <Typography
                          sx={{
                            textDecoration: "line-through",
                            color: isDark ? "#ccc" : "",
                            fontWeight: 400,
                            fontSize: isMobile ? "0.85rem" : "0.95rem",
                          }}
                        >
                          ₹{product.price.toFixed(2)}
                        </Typography>
                      )}
                  </Box>

                  {/* Add/Quantity Controls */}
                  <Box mt={2} display="flex" justifyContent="center">
                    {cartItems[product._id] ? (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        border={`1px solid ${theme.palette.primary.main}`}
                        borderRadius={2}
                        width={120}
                        height={40}
                        bgcolor={
                          isDark
                            ? theme.palette.primary.dark
                            : theme.palette.primary.light + "20"
                        }
                        color={theme.palette.primary.main}
                        sx={{ transition: "background-color 0.2s ease" }}
                      >
                        <motion.div
                          whileHover="hover"
                          whileTap="tap"
                          variants={buttonVariants}
                        >
                          <IconButton
                            onClick={() => handleQtyChange(product._id, -1)}
                            size="small"
                            sx={{ color: theme.palette.primary.main }}
                          >
                            –
                          </IconButton>
                        </motion.div>
                        <Typography
                          sx={{
                            mx: 1.5,
                            fontWeight: 500,
                            color: theme.palette.text.primary, // Themed text color
                          }}
                        >
                          {cartItems[product._id]}
                        </Typography>
                        <motion.div
                          whileHover="hover"
                          whileTap="tap"
                          variants={buttonVariants}
                        >
                          <IconButton
                            onClick={() => handleQtyChange(product._id, 1)}
                            size="small"
                            sx={{ color: theme.palette.primary.main }}
                          >
                            +
                          </IconButton>
                        </motion.div>
                      </Box>
                    ) : (
                      <motion.div
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<FaShoppingCart />}
                          onClick={() => handleQtyChange(product._id, 1)}
                          disabled={product.quantity <= 0}
                          sx={{
                            minWidth: 100,
                            color: isDark ? "#fff" : "",
                            borderColor: theme.palette.primary.main,
                            borderRadius: 2,
                            "&:hover": {
                              color: theme.palette.primary.contrastText,
                              borderColor: theme.palette.primary.dark,
                              backgroundColor: theme.palette.primary.main, // Fill on hover
                              boxShadow: theme.shadows[2],
                            },
                            "&:active": {
                              backgroundColor: theme.palette.primary.dark,
                            },
                            "&.Mui-disabled": {
                              color: theme.palette.grey[500],
                              borderColor: theme.palette.grey[400],
                              backgroundColor: "transparent",
                              cursor: "not-allowed",
                            },
                          }}
                        >
                          {product.quantity <= 0 ? "Out of Stock" : "Add"}
                        </Button>
                      </motion.div>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}
    </motion.div>
  );
};

export default Products;