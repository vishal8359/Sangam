import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Divider,
  CardMedia,
} from "@mui/material";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { useMediaQuery, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    products,
    cartItems,
    removeFromCart,
    updateCartItem,
    getCartAmount,
    getCartCount,
    axios,
    user,
    setCartItems,
    currency,
    addresses,
    setAddresses,
    selectedAddress,
    setSelectedAddress,
    token,
    productsLoading,
    cartArray,
    setCartArray,
  } = useAppContext();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const [paymentOption, setPaymentOption] = useState("COD");
  const [showAddress, setShowAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } },
  };

  const itemCardVariants = {
    initial: { opacity: 0, x: -50, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
    exit: { opacity: 0, x: 50, scale: 0.8, transition: { duration: 0.3 } },
  };

  const summaryCardVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.02, boxShadow: "0px 6px 15px rgba(0,0,0,0.15)" },
    tap: { scale: 0.98 },
  };

  const placeOrder = async () => {
    setIsPlacingOrder(true);
    try {
      if (!selectedAddress) {
        toast.error("Please select a delivery address.");
        return;
      }

      const payload = {
        userId: user._id,
        items: cartArray.map((item) => ({
          product: item._id,
          quantity: item.cartQuantity,
        })),
        address: selectedAddress._id,
        paymentMethod: paymentOption,
      };

      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/users/order/create", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          localStorage.removeItem("sangam-cart");
          setCartArray([]);
          navigate("/reports/user_products");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("/api/order/stripe", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.success && data.url) {
          window.location.replace(data.url);
        } else {
          toast.error(data.message || "Failed to initiate online payment.");
        }
      }
    } catch (error) {
      console.error("❌ Order placement failed:", error);
      toast.error(error.response?.data?.message || error.message || "An error occurred during order placement.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    const loadAddress = async () => {
      if (addresses.length > 0 || selectedAddress) {
        return;
      }

      const stored = JSON.parse(localStorage.getItem("mock-addresses") || "[]");

      if (stored.length > 0) {
        setAddresses(stored);
        setSelectedAddress(stored[0]);
      } else if (user?.address) {
        const fallback = {
          _id: "default",
          street: user.address,
          city: "",
          state: "",
          country: "",
        };
        setAddresses([fallback]);
        setSelectedAddress(fallback);
      }
    };

    if (user && !productsLoading) {
      loadAddress();
    }
  }, [user, addresses.length, selectedAddress, setAddresses, setSelectedAddress, productsLoading]);


  if (productsLoading || !user) {
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
        }}
      >
        <CircularProgress color="primary" size={60} />
        <Typography variant="h6" mt={2}>
          {productsLoading ? "Loading Products..." : "Loading User Data..."}
        </Typography>
      </Box>
    );
  }

  if (cartArray.length === 0) {
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
          Your cart is empty. 🙁
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/my-society/ads")}
          sx={{ borderRadius: 3, px: 4 }}
        >
          Start Shopping
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
        padding: isMobile ? theme.spacing(2) : theme.spacing(4),
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: "100vh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? theme.spacing(4) : theme.spacing(6),
      }}
    >
      <Box flex={2}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={600} mb={isMobile ? 2 : 3}>
          Shopping Cart{" "}
          <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
            ({getCartCount()} items)
          </Typography>
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: isMobile ? theme.spacing(2) : theme.spacing(3),
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          <AnimatePresence>
            {cartArray.map((product) => (
              <motion.div
                key={product._id}
                variants={itemCardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <Paper
                  elevation={4}
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    width: isMobile ? 380 : 280,
                    maxWidth: isMobile ? '100%' : 280,
                    minHeight: 160,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    transition: "box-shadow 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Box display="flex" gap={isMobile ? 1.5 : 2} alignItems="center">
                    <CardMedia
                      component="img"
                      onClick={() =>
                        navigate(`/my-society/ads/${product._id}/product_detail`)
                      }
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      sx={{
                        width: isMobile ? 60 : 70,
                        height: isMobile ? 60 : 70,
                        objectFit: "cover",
                        borderRadius: 2,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                    <Box flex={1}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        onClick={() =>
                          navigate(`/my-society/ads/${product._id}/product_detail`)
                        }
                        sx={{
                          cursor: "pointer",
                          color: theme.palette.primary.main,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Qty:
                        </Typography>
                        <Select
                          value={product.cartQuantity || 1}
                          size="small"
                          onChange={(e) => {
                            const selectedQty = Number(e.target.value);
                            const availableQty = product.quantity;

                            if (selectedQty > availableQty) {
                              toast.error(`Only ${availableQty} left. Please reduce quantity.`);
                              return;
                            }
                            updateCartItem(product._id, selectedQty);
                          }}
                          sx={{
                            ml: 1,
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            "& .MuiSelect-select": { py: 0.5, px: 1 },
                            bgcolor: isDark ? theme.palette.grey[800] : theme.palette.grey[200],
                            borderRadius: 1,
                          }}
                        >
                          {Array.from(
                            {
                              length: Math.min(
                                10,
                                Math.max(1, product.quantity || 0)
                              ),
                            },
                            (_, i) => (
                              <MenuItem key={i + 1} value={i + 1}>
                                {i + 1}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    mt={isMobile ? 1.5 : 2}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6" fontWeight={700} color={theme.palette.success.main}>
                      {currency}
                      {(product.offerPrice * product.cartQuantity).toFixed(2)}
                    </Typography>
                    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => removeFromCart(product._id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Remove
                      </Button>
                    </motion.div>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>

        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
          <Button
            variant="text"
            color="primary"
            sx={{ mt: isMobile ? 3 : 4, borderRadius: 2 }}
            onClick={() => navigate("/my-society/ads")}
          >
            Continue Shopping
          </Button>
        </motion.div>
      </Box>

      <motion.div
        flex={1}
        component={Paper}
        p={isMobile ? 2.5 : 4}
        sx={{
          width: isMobile ? "100%" : 350,
          borderRadius: 3,
          boxShadow: theme.shadows[6],
          backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.background.paper,
          color: theme.palette.text.primary,
          alignSelf: 'flex-start',
        }}
        variants={summaryCardVariants}
        initial="initial"
        animate="animate"
      >
        <Typography variant="h5" fontWeight={600} mb={isMobile ? 2 : 3}>
          Order Summary
        </Typography>

        <Typography variant="subtitle1" fontWeight={500} mb={0.5}>Delivery Address</Typography>
        <Typography color="text.secondary" mb={1.5}>
          {selectedAddress
            ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
            : user?.address || "No address selected"}
        </Typography>

        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
          <Button
            size="small"
            onClick={() => navigate("/my-society/ads/add-address")}
            sx={{ mb: isMobile ? 2 : 3, borderRadius: 2 }}
          >
            Change Address
          </Button>
        </motion.div>

        {addresses.length > 1 && (
          <Button
            size="small"
            onClick={() => setShowAddress((prev) => !prev)}
            sx={{ mb: isMobile ? 2 : 3, ml: 1, borderRadius: 2 }}
          >
            {showAddress ? "Hide Other Addresses" : "Show Other Addresses"}
          </Button>
        )}

        <AnimatePresence>
          {showAddress && addresses.map((address) => (
            <motion.div
              key={address._id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  border: `1px solid ${selectedAddress?._id === address._id ? theme.palette.primary.main : theme.palette.grey[400]}`,
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  cursor: "pointer",
                  bgcolor: selectedAddress?._id === address._id ? (isDark ? theme.palette.primary.dark + '20' : theme.palette.primary.light + '20') : 'transparent',
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: isDark ? theme.palette.grey[800] : theme.palette.grey[100],
                  },
                }}
                onClick={() => {
                  setSelectedAddress(address);
                  setShowAddress(false);
                }}
              >
                <Typography variant="body2">
                  {address.street}, {address.city}, {address.state},{" "}
                  {address.country}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        <Divider sx={{ my: isMobile ? 2 : 3, borderColor: theme.palette.divider }} />

        <Typography variant="subtitle1" fontWeight={500} mb={0.5}>
          Payment Method
        </Typography>
        <Select
          fullWidth
          size="small"
          value={paymentOption}
          onChange={(e) => setPaymentOption(e.target.value)}
          sx={{
            mt: 1,
            mb: isMobile ? 2 : 3,
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.grey[500] },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
            "& .MuiSelect-select": { color: theme.palette.text.primary },
            "& .MuiSvgIcon-root": { color: theme.palette.text.secondary },
          }}
        >
          <MenuItem value="COD">Cash on Delivery</MenuItem>
          <MenuItem value="Online">Online Payment</MenuItem>
        </Select>

        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body1">Price ({getCartCount()} items):</Typography>
          <Typography variant="body1" fontWeight={600}>
            {currency}
            {getCartAmount().toFixed(2)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body1">Shipping Fee:</Typography>
          <Typography variant="body1" fontWeight={600}>
            {currency}
            {Math.ceil(getCartAmount() * 0.005).toFixed(2)}
          </Typography>
        </Box>

        <Divider sx={{ my: isMobile ? 2 : 3, borderColor: theme.palette.divider }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Total:
          </Typography>
          <Typography variant="h5" fontWeight={700} color={theme.palette.success.main}>
            {currency}
            {(getCartAmount() + Math.ceil(getCartAmount() * 0.005)).toFixed(2)}
          </Typography>
        </Box>

        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: isMobile ? 3 : 4, py: 1.5, borderRadius: 3 }}
            onClick={placeOrder}
            disabled={isPlacingOrder || cartArray.length === 0 || !selectedAddress}
          >
            {isPlacingOrder ? (
              <CircularProgress size={24} color="inherit" />
            ) : paymentOption === "COD" ? (
              "Place Order"
            ) : (
              "Proceed to Checkout"
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CartPage;
