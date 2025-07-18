import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaShoppingCart,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import FloatingCartIcon from "../../components/FloatingCartIcon";

const ProductDetailPage = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const {
    axios,
    currency,
    updateCartItem,
    cartItems,
    firstCartId,
    setFirstCartId,
    products, // Ensure products are available from context to check quantity
  } = useAppContext();

  const [product, setProduct] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } },
  };

  const sectionVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const imageThumbVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 10 } },
    hover: { scale: 1.05, boxShadow: "0px 4px 12px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95 },
  };

  const mainImageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95 },
  };

  const listItemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/users/products/${product_id}`);
        const prod = data.product;

        const parsedDescription = Array.isArray(prod.description)
          ? prod.description
          : prod.description
              ?.split(/[\n\r,]+/)
              .map((item) => item.trim())
              .filter((d) => d);

        setProduct({ ...prod, description: parsedDescription });
        if (prod.images?.length) setThumbnail(prod.images[0].url);
      } catch (err) {
        console.error("❌ Failed to fetch product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [product_id, axios]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;

      try {
        const { data } = await axios.get(
          `/api/users/products?societyId=${product.societyId}&exclude=${product._id}`
        );

        setRelatedProducts(data.products.slice(0, 5));
      } catch (err) {
        console.error("❌ Failed to fetch related products:", err);
      }
    };

    fetchRelatedProducts();
  }, [product, axios]);

  const handleQtyChange = (productId, delta) => {
    const currentQty = cartItems[productId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    const targetProduct = products.find(p => p._id === productId);
    if (targetProduct && newQty > targetProduct.quantity) {
      toast.error(`Only ${targetProduct.quantity} of ${targetProduct.name} left. Please reduce quantity.`);
      return;
    }

    updateCartItem(productId, newQty);

    if (newQty > 0 && !firstCartId) setFirstCartId(productId);
    if (newQty === 0 && productId === firstCartId) setFirstCartId(null);

    if (productId === product._id && delta > 0) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }}
      >
        <CircularProgress color="primary" size={60} />
        <Typography variant="h6" ml={2}>Loading Product Details...</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          textAlign: "center",
          p: 3,
        }}
      >
        <Typography variant="h5" mb={3}>
          Product not found.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/my-society/ads")}
          sx={{ borderRadius: 3, px: 4 }}
        >
          Browse Products
        </Button>
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
        padding: isMobile ? theme.spacing(2) : theme.spacing(5),
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: "100vh",
      }}
    >
      <Typography mb={isMobile ? 2 : 3} variant="body2">
        <Link to="/my-society" style={{ color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Home
        </Link>{" "}
        /{" "}
        <Link to="/my-society/ads" style={{ color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Products
        </Link>{" "}
        /{" "}
        <Typography component="span" color="text.secondary">
          {product.name}
        </Typography>
      </Typography>

      <Grid container spacing={isMobile ? 3 : 6}>
        <Grid item xs={12} md={6}>
          <motion.div variants={sectionVariants}>
            <Box display="flex" gap={isMobile ? 1.5 : 3} flexDirection={isMobile ? "column-reverse" : "row"}>
              <Box display="flex" flexDirection={isMobile ? "row" : "column"} gap={isMobile ? 1 : 1.5} sx={{ overflowX: isMobile ? 'auto' : 'visible', pb: isMobile ? 1 : 0 }}>
                {product.images.map((img, i) => (
                  <motion.div
                    key={i}
                    variants={imageThumbVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setThumbnail(img.url)}
                    style={{
                      cursor: "pointer",
                      border: `2px solid ${thumbnail === img.url ? theme.palette.primary.main : (isDark ? theme.palette.grey[700] : theme.palette.grey[300])}`,
                      borderRadius: 2,
                      overflow: "hidden",
                      width: isMobile ? 70 : 90,
                      height: isMobile ? 70 : 90,
                      flexShrink: 0,
                      boxShadow: thumbnail === img.url ? theme.shadows[4] : 'none',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`thumbnail-${i}`}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      onError={(e) => { e.target.src = 'https://placehold.co/90x90/cccccc/333333?text=No+Image'; }}
                    />
                  </motion.div>
                ))}
              </Box>
              <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                <Paper
                  elevation={6}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    width: isMobile ? '100%' : 450,
                    height: isMobile ? 300 : 450,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: isDark ? `0px 8px 25px rgba(0,0,0,0.6)` : `0px 8px 25px rgba(0,0,0,0.2)`,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {thumbnail && (
                      <motion.img
                        key={thumbnail}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={mainImageVariants}
                        src={thumbnail}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        onError={(e) => { e.target.src = 'https://placehold.co/450x450/cccccc/333333?text=No+Image'; }}
                      />
                    )}
                  </AnimatePresence>
                </Paper>
              </Box>
            </Box>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={sectionVariants}>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} mb={isMobile ? 1 : 2}>
              {product.name}
            </Typography>

            <Box mt={1} display="flex" alignItems="center" gap={0.5}>
              {Array.from({ length: 5 }, (_, i) => {
                const rating = product.rating || 0;
                if (i < Math.floor(rating)) {
                  return <FaStar key={i} size={isMobile ? 16 : 20} color={theme.palette.warning.main} />;
                } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                  return <FaStarHalfAlt key={i} size={isMobile ? 16 : 20} color={theme.palette.warning.main} />;
                } else {
                  return <FaRegStar key={i} size={isMobile ? 16 : 20} color={theme.palette.warning.light} />;
                }
              })}
              <Typography variant="body2" ml={1} color="text.secondary">
                ({product.reviews || 0} reviews)
              </Typography>
            </Box>

            <Box mt={isMobile ? 2 : 3}>
              {product.price && product.offerPrice && product.offerPrice < product.price && (
                <Typography
                  color="text.secondary"
                  sx={{ textDecoration: "line-through", fontSize: isMobile ? '0.9rem' : '1rem' }}
                >
                  MRP: {currency} {product.price.toFixed(2)}
                </Typography>
              )}
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} color={theme.palette.success.main}>
                Offer: {currency} {product.offerPrice?.toFixed(2) || product.price?.toFixed(2) || '0.00'}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                (inclusive of all taxes)
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Seller: <strong>{product.sellerName || "N/A"}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Address: <strong>{product.sellerAddress || "Not Provided"}</strong>
            </Typography>

            <Typography mt={isMobile ? 3 : 4} variant="subtitle1" fontWeight={600}>
              About Product:
            </Typography>
            <ul style={{ paddingLeft: 0, listStyle: "none", marginTop: theme.spacing(1.5) }}>
              {product.description?.map((d, i) => (
                <motion.li
                  key={i}
                  variants={listItemVariants}
                  initial="initial"
                  animate="animate"
                  style={{
                    display: "flex",
                    alignItems: "start",
                    gap: "0.6rem",
                    marginBottom: "0.5rem",
                    color: theme.palette.text.primary,
                    fontSize: isMobile ? "0.85rem" : "0.95rem",
                    lineHeight: 1.3,
                  }}
                >
                  <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: "bold", flexShrink: 0 }}>
                    ✔
                  </Box>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {d}
                  </Typography>
                </motion.li>
              ))}
            </ul>

            <Box
              mt={isMobile ? 3 : 4}
              display="flex"
              flexDirection={isMobile ? "column" : "row"}
              gap={isMobile ? 2 : 3}
              sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
            >
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants} style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                <Button
                  variant="outlined"
                  onClick={() => handleQtyChange(product._id, 1)}
                  fullWidth
                  size="large"
                  disabled={product.quantity <= 0}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    "&:hover": {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-disabled": {
                      color: theme.palette.grey[500],
                      borderColor: theme.palette.grey[400],
                      backgroundColor: 'transparent',
                      cursor: 'not-allowed',
                    },
                  }}
                >
                  {product.quantity <= 0 ? "Out of Stock" : (added ? "Added!" : "Add to Cart")}
                </Button>
              </motion.div>
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants} style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    updateCartItem(product._id, cartItems[product._id] || 1);
                    navigate(`/my-society/ads/cart`);
                  }}
                  fullWidth
                  size="large"
                  disabled={product.quantity <= 0}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    fontWeight: 'bold',
                    "&:hover": {
                      bgcolor: theme.palette.secondary.dark,
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-disabled": {
                      backgroundColor: isDark ? theme.palette.grey[700] : theme.palette.grey[300],
                      color: isDark ? theme.palette.grey[500] : theme.palette.grey[600],
                    }
                  }}
                >
                  Buy Now
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      <Box mt={isMobile ? 8 : 12}>
        <Typography variant={isMobile ? "h5" : "h4"} mb={isMobile ? 3 : 4} fontWeight={700} sx={{mt:3}}>
          Related Products
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3} justifyContent={isMobile ? "center" : "flex-start"}>
          <AnimatePresence>
            {relatedProducts.map((prod, i) => (
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                lg={2.4}
                key={prod._id || i}
              >
                <motion.div
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover={{ y: -5, boxShadow: theme.shadows[8] }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Paper
                    elevation={4}
                    sx={{
                      p: isMobile ? 1.5 : 2.5,
                      height: isMobile ? 350 : 370,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderRadius: 3,
                      backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      transition: "box-shadow 0.3s ease-in-out",
                      width: isMobile ? 180 : 200
                    }}
                  >
                    <Box
                      onClick={() =>
                        navigate(`/my-society/ads/${prod._id}/product_detail`, {
                          state: { product: prod },
                        })
                      }
                      component="img"
                      src={prod.images?.[0]?.url || "https://placehold.co/150x150/cccccc/333333?text=No+Image"}
                      alt={prod.name}
                      sx={{
                        width: "100%",
                        height: isMobile ? 120 : 140,
                        objectFit: "contain",
                        cursor: "pointer",
                        mb: 1.5,
                        borderRadius: 2,
                      }}
                      onError={(e) => { e.target.src = 'https://placehold.co/150x150/cccccc/333333?text=No+Image'; }}
                    />
                    <Typography fontWeight={600} mt={1} variant="subtitle1" sx={{ lineHeight: 1.2 }}>
                      {prod.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currency}{prod.offerPrice?.toFixed(2) || prod.price?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Seller: {prod.sellerName || "N/A"}
                    </Typography>
                    <Box mt={1} display="flex" alignItems="center" gap={0.5}>
                      {Array.from({ length: 5 }, (_, j) => {
                        const rating = prod.rating || 0;
                        if (j < Math.floor(rating)) {
                          return <FaStar key={j} size={14} color={theme.palette.warning.main} />;
                        } else if (j === Math.floor(rating) && rating % 1 !== 0) {
                          return <FaStarHalfAlt key={j} size={14} color={theme.palette.warning.main} />;
                        } else {
                          return <FaRegStar key={j} size={14} color={theme.palette.warning.light} />;
                        }
                      })}
                      <Typography variant="caption" color="text.secondary" ml={0.5}>
                        ({prod.rating?.toFixed(1) || '0.0'})
                      </Typography>
                    </Box>

                    <Box
                      mt="auto"
                      pt={2}
                      display="flex"
                      justifyContent="center"
                    >
                      {cartItems[prod._id] ? (
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          border={`1px solid ${theme.palette.primary.main}`}
                          borderRadius={2}
                          width={120}
                          height={40}
                          bgcolor={isDark ? theme.palette.primary.dark : theme.palette.primary.light + '20'}
                          color={theme.palette.primary.main}
                          sx={{ transition: 'background-color 0.2s ease' }}
                        >
                          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                            <IconButton
                              onClick={() => handleQtyChange(prod._id, -1)}
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
                              color: theme.palette.text.primary,
                            }}
                          >
                            {cartItems[prod._id]}
                          </Typography>
                          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                            <IconButton
                              onClick={() => handleQtyChange(prod._id, 1)}
                              size="small"
                              sx={{ color: theme.palette.primary.main }}
                            >
                              +
                            </IconButton>
                          </motion.div>
                        </Box>
                      ) : (
                        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                          <Button
                            variant="outlined"
                            startIcon={<FaShoppingCart />}
                            onClick={() => handleQtyChange(prod._id, 1)}
                            disabled={prod.quantity <= 0}
                            sx={{
                              minWidth: 100,
                              color: theme.palette.primary.main,
                              borderColor: theme.palette.primary.main,
                              borderRadius: 2,
                              "&:hover": {
                                color: theme.palette.primary.contrastText,
                                borderColor: theme.palette.primary.dark,
                                backgroundColor: theme.palette.primary.main,
                                boxShadow: theme.shadows[2],
                              },
                              "&:active": {
                                backgroundColor: theme.palette.primary.dark,
                              },
                              "&.Mui-disabled": {
                                color: theme.palette.grey[500],
                                borderColor: theme.palette.grey[400],
                                backgroundColor: 'transparent',
                                cursor: 'not-allowed',
                              },
                            }}
                          >
                            {prod.quantity <= 0 ? "Out of Stock" : "Add"}
                          </Button>
                        </motion.div>
                      )}
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </Box>

      <FloatingCartIcon />
    </motion.div>
  );
};

export default ProductDetailPage;
