import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { Box, Typography, Button, Paper, Grid, useTheme } from "@mui/material";
import { FaStar, FaRegStar, FaShoppingCart } from "react-icons/fa";
import { useMediaQuery } from "@mui/material";
import { IconButton } from "@mui/material";
import FloatingCartIcon from "../../components/FloatingCartIcon"; // ✅ Added

const ProductDetailPage = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    products,
    currency,
    updateCartItem,
    cartItems,
    firstCartId,
    setFirstCartId,
  } = useAppContext();

  const isMobile = useMediaQuery("(max-width:600px)");

  const [product, setProduct] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const found = products.find((p) => p._id === product_id);
    setProduct(found);
    if (found?.image?.length) setThumbnail(found.image[0]);
  }, [products, product_id]);

  useEffect(() => {
    if (product && products.length > 0) {
      const filtered = products.filter((p) => p._id !== product._id);
      setRelatedProducts(filtered.slice(0, 5));
    }
  }, [product, products]);

  const handleQtyChange = (productId, delta) => {
    const currentQty = cartItems[productId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    updateCartItem(productId, newQty);

    if (newQty > 0 && !firstCartId) setFirstCartId(productId);
    if (newQty === 0 && productId === firstCartId) setFirstCartId(null);

    if (productId === product._id && delta > 0) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  if (!product) {
    return <Typography p={3}>Product not found.</Typography>;
  }

  return (
    <Box px={isMobile ? 4 : 10} py={5} position="relative">
      <Typography mb={2} sx={{ color: "#1976d2" }}>
        <Link to="/my-society">Home</Link> /{" "}
        <Link to="/my-society/ads">Products</Link> / {product.name}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box display="flex" gap={2}>
            <Box display="flex" flexDirection="column" gap={1}>
              {product.image.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setThumbnail(img)}
                  sx={{
                    cursor: "pointer",
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    overflow: "hidden",
                    width: isMobile ? 60 : 90,
                    height: isMobile ? 60 : 90,
                  }}
                >
                  <img
                    src={img}
                    alt={`thumb-${i}`}
                    width="100%"
                    height="100%"
                    style={{ objectFit: "fill" }}
                  />
                </Box>
              ))}
            </Box>
            <Box flex={1}>
              <img
                src={thumbnail}
                alt="main"
                style={{
                  width: isMobile ? 300 : 400,
                  height: 400,
                  objectFit: "contain",
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" fontWeight={600}>
            {product.name}
          </Typography>

          <Box mt={1} display="flex" alignItems="center" gap={0.5}>
            {Array.from({ length: 5 }, (_, i) =>
              i < Math.floor(product.rating) ? (
                <FaStar key={i} color="gold" />
              ) : (
                <FaRegStar key={i} color="gold" />
              )
            )}
            <Typography variant="body2" ml={1}>
              ({product.reviews} reviews)
            </Typography>
          </Box>

          <Box mt={3}>
            <Typography
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              MRP: {currency}
              {product.price}
            </Typography>
            <Typography variant="h6">
              Offer: {currency}
              {product.offerPrice}
            </Typography>
            <Typography color="text.secondary">
              (inclusive of all taxes)
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Seller: <strong>{product.sellerName || "N/A"}</strong>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Address: <strong>{product.sellerAddress || "Not Provided"}</strong>
          </Typography>

          <Typography mt={3} variant="subtitle1">
            About Product:
          </Typography>
          <ul style={{ paddingLeft: 0, listStyle: "none", marginTop: "1rem" }}>
            {product.description?.map((d, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "start",
                  gap: "0.6rem",
                  marginBottom: "0.5rem",
                  color: "#444",
                  fontSize: "0.75rem",
                  lineHeight: 1.1,
                }}
              >
                <span
                  style={{
                    color: theme.palette.primary.main,
                    fontWeight: "bold",
                  }}
                >
                  ✔
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>

          <Box
            mt={4}
            display="flex"
            gap={2}
            sx={{
              pt: isMobile ? 1 : 5,
              position: "absolute",
              width: isMobile ? 300 : 600,
              height: isMobile ? 50 : 90,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => handleQtyChange(product._id, 1)}
              fullWidth
              sx={{
                borderColor: "#e8e8e8",
                "&:hover": {
                  borderColor: "#bbb",
                  backgroundColor: "#f3f3f3",
                },
              }}
            >
              {added ? "Added" : "Add to Cart"}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                updateCartItem(product._id, cartItems[product._id] || 1);
                navigate(`/my-society/ads/cart`);
              }}
              fullWidth
            >
              Buy Now
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Box mt={8}>
        <Typography variant="h5" mb={2} sx={{ mt: 10 }}>
          Related Products
        </Typography>
        <Grid container spacing={2}>
          {relatedProducts.map((prod, i) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              key={i}
              sx={{ width: isMobile ? 165 : 220 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: 340,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                <img
                  onClick={() =>
                    navigate(`/my-society/ads/${prod._id}/product_detail`, {
                      state: { product: prod },
                    })
                  }
                  src={prod.image[0]}
                  alt={prod.name}
                  style={{
                    width: "100%",
                    height: 140,
                    objectFit: "contain",
                    cursor: "pointer",
                  }}
                />
                <Typography fontWeight={600} mt={1}>
                  {prod.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₹{prod.offerPrice}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Seller: {prod.sellerName}
                </Typography>
                <Box mt={1} display="flex" alignItems="center" gap={0.5}>
                  {Array.from({ length: 5 }, (_, i) =>
                    i < Math.floor(prod.rating) ? (
                      <FaStar key={i} size={14} color="gold" />
                    ) : (
                      <FaRegStar key={i} size={14} color="gold" />
                    )
                  )}
                  <Typography variant="caption" color="text.secondary" ml={0.5}>
                    ({prod.reviews})
                  </Typography>
                </Box>

                <Box
                  mt="auto"
                  pt={2}
                  display="flex"
                  justifyContent="space-between"
                >
                  <Button
                    variant="text"
                    size="small"
                    onClick={() =>
                      navigate(`/my-society/ads/${prod._id}/product_detail`, {
                        state: { product: prod },
                      })
                    }
                  >
                    View
                  </Button>

                  {cartItems[prod._id] ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      border={`1px solid ${theme.palette.success.main}`}
                      borderRadius={2}
                      height={40}
                      bgcolor="#e3f2fd"
                    >
                      <IconButton
                        onClick={() => handleQtyChange(prod._id, -1)}
                        size="small"
                        sx={{ color: theme.palette.success.dark }}
                      >
                        –
                      </IconButton>
                      <Typography sx={{ mx: 1.5, fontWeight: 500 }}>
                        {cartItems[prod._id]}
                      </Typography>
                      <IconButton
                        onClick={() => handleQtyChange(prod._id, 1)}
                        size="small"
                        sx={{ color: theme.palette.success.dark }}
                      >
                        +
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<FaShoppingCart />}
                      onClick={() => handleQtyChange(prod._id, 1)}
                      sx={{
                        minWidth: 100,
                        color: "#1976d2",
                        borderColor: "#1976d2",
                        "&:hover": {
                          color: "#1976d2",
                          borderColor: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        "&:active": {
                          color: "#1976d2",
                          borderColor: "#1976d2",
                          backgroundColor: "#bbdefb",
                        },
                      }}
                    >
                      Add
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Floating Cart Icon globally shown */}
      <FloatingCartIcon />
    </Box>
  );
};

export default ProductDetailPage;
