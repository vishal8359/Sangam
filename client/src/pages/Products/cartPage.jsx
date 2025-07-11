// src/pages/CartPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { useMediaQuery, useTheme } from "@mui/material";

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

  const [paymentOption, setPaymentOption] = useState("COD");
  const [showAddress, setShowAddress] = useState(false);

  const placeOrder = async () => {
    try {
      if (!selectedAddress) return toast.error("Please select an address");

      const payload = {
        userId: user._id,
        items: cartArray.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        address: selectedAddress._id,
      };

      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", payload);
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          localStorage.removeItem("sangam-cart");
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("/api/order/stripe", payload);
        if (data.success) {
          window.location.replace(data.url);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const loadAddress = async () => {
      const stored = JSON.parse(localStorage.getItem("mock-addresses") || "[]");

      if (stored.length > 0) {
        setAddresses(stored);
        setSelectedAddress((prev) => prev || stored[0]);
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

    if (user && addresses.length === 0 && !selectedAddress) {
      loadAddress();
    }
  }, [user, addresses.length, selectedAddress]);

  useEffect(() => {
    console.log("🧾 user object:", user);
  }, [user]);

  if (productsLoading) {
    return (
      <Box p={3}>
        <Typography variant="h6">Loading Cart...</Typography>
      </Box>
    );
  }
  if (!user) {
    return (
      <Box p={3}>
        <Typography variant="h6">Loading user data...</Typography>
      </Box>
    );
  }

  if (
    Array.isArray(cartArray) &&
    cartArray.length === 0 &&
    Array.isArray(products) &&
    products.length > 0
  ) {
    return (
      <Box p={3}>
        <Typography variant="h6">Your cart is empty.</Typography>
        <Button onClick={() => navigate("/my-society/ads")}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      mx={1}
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      gap={4}
    >
      {/* Cart List */}
      <Box flex={2}>
        <Typography variant="h4" mb={2}>
          Shopping Cart{" "}
          <span style={{ fontSize: "1rem", color: "#1976d2" }}>
            ({getCartCount()} items)
          </span>
        </Typography>

        <div className="flex flex-row flex-wrap gap-5">
          {cartArray.map((product, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 0,
                width: isMobile ? 350 : 290,
                height: 150,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Box display="flex" gap={2}>
                <img
                  onClick={() =>
                    navigate(`/my-society/ads/${product._id}/product_detail`)
                  }
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  width={isMobile ? 40 : 40}
                  height={40}
                  style={{
                    objectFit: "cover",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                />
                <Box flex={1}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    onClick={() =>
                      navigate(`/my-society/ads/${product._id}/product_detail`)
                    }
                    sx={{ cursor: "pointer" }}
                  >
                    {product.name}
                  </Typography>
                  <Typography>
                    Quantity:
                    <Select
                      value={product.quantity}
                      size="small"
                      onChange={(e) =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                      sx={{ ml: 1 }}
                    >
                      {Array(Math.max(9, product.quantity || 0))
                        .fill("")
                        .map((_, i) => (
                          <MenuItem key={i} value={i + 1}>
                            {i + 1}
                          </MenuItem>
                        ))}
                    </Select>
                  </Typography>
                </Box>
              </Box>

              {/* Bottom section: price and remove button */}
              <Box
                mt={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {currency}
                  {(product.offerPrice * product.quantity).toFixed(2)}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => removeFromCart(product._id)}
                >
                  Remove
                </Button>
              </Box>
            </Paper>
          ))}
        </div>

        <Button
          variant="text"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/my-society/ads")}
        >
          Continue Shopping
        </Button>
      </Box>

      {/* Summary */}
      <Box flex={1} component={Paper} p={3} sx={{ width: 300 }}>
        <Typography variant="h6" mb={2}>
          Order Summary
        </Typography>

        <Typography variant="subtitle2">Delivery Address</Typography>
        <Typography color="text.secondary" mb={1}>
          {selectedAddress
            ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
            : user?.address || "No address found"}
        </Typography>

        <Button
          size="small"
          onClick={() => navigate("/my-society/ads/add-address")}
          sx={{ mb: 2 }}
        >
          Change Address
        </Button>

        {showAddress &&
          addresses.map((address, index) => (
            <Box
              key={index}
              sx={{
                border: "1px solid #ccc",
                p: 1,
                mb: 1,
                borderRadius: 1,
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedAddress(address);
                setShowAddress(false);
              }}
            >
              <Typography fontSize="0.9rem">
                {address.street}, {address.city}, {address.state},{" "}
                {address.country}
              </Typography>
            </Box>
          ))}

        <Typography variant="subtitle2" mt={2}>
          Payment Method
        </Typography>
        <Select
          fullWidth
          size="small"
          value={paymentOption}
          onChange={(e) => setPaymentOption(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        >
          <MenuItem value="COD">Cash on Delivery</MenuItem>
          <MenuItem value="Online">Online Payment</MenuItem>
        </Select>

        <Typography variant="body1">
          Price: {currency}
          {getCartAmount()}
        </Typography>
        <Typography variant="body1">Shipping: Free</Typography>
        <Typography variant="body1">
          Tax (2%): {currency}
          {(getCartAmount() * 0.02).toFixed(2)}
        </Typography>

        <Typography variant="h6" mt={2}>
          Total: {currency}
          {(getCartAmount() * 1.02).toFixed(2)}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          onClick={placeOrder}
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </Button>
      </Box>
    </Box>
  );
};

export default CartPage;
