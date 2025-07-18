import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Rating,
  useTheme,
  useMediaQuery,
  CircularProgress, // For loading spinner
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom is used
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast"; // For toast notifications
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence

// Ensure these paths are correct for your project
import ProductIcon from "../../assets/Product_Icon.png"; // Keeping it commented as it was in original
import Product_Bg from "../../assets/products_bg.png";

const ProductFormSection = () => {
  const { token, societyId, userId, axios, navigate } = useAppContext();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [submitting, setSubmitting] = useState(false);

  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);

  // Variants for Framer Motion animations
  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.4, ease: "easeIn" } },
  };

  const cardVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  const imagePreviewVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // Filter out non-image files if any
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    const newImages = imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: file.name + Date.now(), // Unique ID for keying in AnimatePresence
    }));

    setImages((prev) => {
      // Limit to max 4 images
      const combined = [...prev, ...newImages].slice(0, 4);
      return combined;
    });
  };

  const removeImage = (idToRemove) => {
    setImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const handleSubmit = async () => {
    if (
      !productName ||
      !price ||
      !quantity ||
      !description ||
      images.length === 0
    ) {
      toast.error("Please fill all required fields and upload at least one image.");
      return;
    }

    console.log("📦 Submitting product. userId:", userId);

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice);
    formData.append("quantity", quantity);
    formData.append("description", description);
    formData.append("rating", rating);
    formData.append("societyId", societyId);
    // formData.append("createdBy", userId); // Uncomment if your backend expects this field

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    try {
      setSubmitting(true); // Start loading
      const { data } = await axios.post("/api/users/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Ensure token is sent if required by API
        },
      });
      toast.success("🎉 Product uploaded successfully!");
      navigate("/my-society/ads"); // Navigate on success
    } catch (err) {
      console.error("❌ Upload failed:", err.response?.data || err.message);
      toast.error("❌ Failed to upload product. Please try again.");
    } finally {
      setSubmitting(false); // Stop loading
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "16px" : "48px", // px values for padding
        overflow: "hidden", // Ensure no overflow from animations
        backgroundColor: isDark ? theme.palette.background.default : theme.palette.background.paper, // Base background
      }}
    >
      {/* Background Image Layer */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${Product_Bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          zIndex: -2,
          // Subtle parallax scroll effect
          backgroundAttachment: "fixed",
          animation: "bg-pan 60s linear infinite alternate",
          "@keyframes bg-pan": {
            "0%": { backgroundPosition: "0% 0%" },
            "100%": { backgroundPosition: "100% 100%" },
          },
        }}
      />

      {/* Overlay for Dark/Light Mode and Blur */}
      <Box
        sx={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: isDark ? "rgba(18,18,18,0.85)" : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(5px)", // Reduced blur for better performance/look
          zIndex: -1,
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          initial="initial"
          animate="animate"
          variants={cardVariants}
        >
          <Paper
            elevation={8} // Increased elevation for more prominence
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4, // More rounded corners
              backgroundColor: isDark ? "#2a2a2a" : "#ffffff", // Slightly different dark background
              width: "100%",
              boxShadow: isDark
                ? "0px 10px 30px rgba(0,0,0,0.5)"
                : "0px 10px 30px rgba(0,0,0,0.1)", // Enhanced shadow
              overflow: 'hidden', // Ensure animations within don't overflow
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column", // Stack vertically on small screens
                alignItems: "center",
                mb: 4, // Increased margin-bottom
                gap: 1.5, // Increased gap
                color: isDark ? "#e0e0e0" : "#333", // Adjusted text color
              }}
            >
              <StorefrontIcon sx={{ fontSize: isMobile ? 40 : 50, color: "#000" }} />
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ textAlign: 'center' }}>
                Add a Product for Sale
              </Typography>
            </Box>

            {/* Form Inputs */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Product Name */}
              <motion.div variants={itemVariants}>
                <TextField
                  label="Product Name"
                  variant="outlined"
                  fullWidth
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    "& label": { color: isDark ? "#bbb" : "#666" },
                    "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                    "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                    "&:hover fieldset": { borderColor: theme.palette.primary.main },
                    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                  }}
                />
              </motion.div>

              {/* Price */}
              <motion.div variants={itemVariants}>
                <TextField
                  label="Price (₹)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputProps={{ min: "0", step: "0.01" }} // Ensure valid number input
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    "& label": { color: isDark ? "#bbb" : "#666" },
                    "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                    "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                    "&:hover fieldset": { borderColor: theme.palette.primary.main },
                    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                  }}
                />
              </motion.div>

              {/* Offer Price */}
              <motion.div variants={itemVariants}>
                <TextField
                  label="Offer Price (₹)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  inputProps={{ min: "0", step: "0.01" }}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    "& label": { color: isDark ? "#bbb" : "#666" },
                    "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                    "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                    "&:hover fieldset": { borderColor: theme.palette.primary.main },
                    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                  }}
                />
              </motion.div>

              {/* Quantity */}
              <motion.div variants={itemVariants}>
                <TextField
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputProps={{ min: "1", step: "1" }}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    "& label": { color: isDark ? "#bbb" : "#666" },
                    "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                    "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                    "&:hover fieldset": { borderColor: theme.palette.primary.main },
                    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                  }}
                />
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <TextField
                  label="Description"
                  variant="outlined"
                  multiline
                  minRows={3}
                  fullWidth
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    "& label": { color: isDark ? "#bbb" : "#666" },
                    "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                    "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                    "&:hover fieldset": { borderColor: theme.palette.primary.main },
                    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                  }}
                />
              </motion.div>

              {/* Rating */}
              <motion.div variants={itemVariants}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: isDark ? "#e0e0e0" : "#333" }}>
                  <Typography>Product Rating:</Typography>
                  <Rating
                    value={rating}
                    precision={0.5}
                    onChange={(e, newValue) => setRating(newValue)}
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: theme.palette.warning.main, // Use theme's warning color for stars
                      },
                      "& .MuiRating-iconHover": {
                        color: theme.palette.warning.dark,
                      },
                    }}
                  />
                </Box>
              </motion.div>

              {/* Upload Images Button */}
              <motion.div variants={itemVariants}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  disabled={images.length >= 4}
                  sx={{
                    py: 1.2,
                    fontWeight: "bold",
                    borderRadius: 2,
                    backgroundColor: isDark ? theme.palette.primary.light : "#000",
                    color: isDark ? "#121212" : "#fff",
                    "&:hover": {
                      backgroundColor: isDark ? theme.palette.primary.main : "#121211",
                      transform: "translateY(-2px)", // Subtle lift on hover
                      boxShadow: theme.shadows[4],
                    },
                    "&:active": {
                      transform: "translateY(0)", // Press down effect
                    },
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-disabled": {
                      backgroundColor: isDark ? "#444" : "#e0e0e0",
                      color: isDark ? "#888" : "#aaa",
                      cursor: "not-allowed",
                      animation: images.length >= 4 ? "pulse-disabled 1s infinite" : "none",
                    },
                    "@keyframes pulse-disabled": {
                      "0%": { boxShadow: "0 0 0px rgba(0,0,0,0)" },
                      "50%": { boxShadow: "0 0 8px rgba(255,0,0,0.5)" }, // Red pulse when max images reached
                      "100%": { boxShadow: "0 0 0px rgba(0,0,0,0)" },
                    },
                  }}
                >
                  Upload Images ({images.length}/4)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      handleImageChange(e);
                      
                      e.target.value = '';
                    }}
                  />
                </Button>
              </motion.div>

              {/* Image Previews */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5, // Increased gap between images
                  mt: 1.5,
                  flexWrap: "wrap",
                  justifyContent: 'center', // Center images
                }}
              >
                <AnimatePresence>
                  {images.map((img) => (
                    <motion.div
                      key={img.id} // Unique key for AnimatePresence to track items
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={imagePreviewVariants}
                      whileHover={{ scale: 1.05 }} // Hover effect
                      whileTap={{ scale: 0.95 }} // Tap/click effect
                      style={{
                        position: "relative",
                        width: 80,
                        height: 80,
                        borderRadius: 2, // More rounded corners
                        overflow: "hidden",
                        boxShadow: theme.shadows[4], // Clearer shadow
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={img.url}
                        alt={`preview-${img.id}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(img.id)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.8)",
                            transform: "scale(1.1)", // Hover effect
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{
                    py: 1.6, // Larger padding for a more prominent button
                    fontWeight: "bold",
                    borderRadius: 2,
                    backgroundColor: "#000",
                    color: theme.palette.primary.contrastText,
                    "&:hover": {
                      backgroundColor: "#121211",
                      transform: "translateY(-3px)", // More pronounced lift on hover
                      boxShadow: theme.shadows[6], // Stronger shadow
                    },
                    "&:active": {
                      transform: "translateY(0)", // Press down effect
                    },
                    transition: "all 0.3s ease-in-out", // Smooth transition for all properties
                    "&.Mui-disabled": {
                      backgroundColor: isDark ? "#444" : "#e0e0e0",
                      color: isDark ? "#888" : "#aaa",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  {submitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default ProductFormSection;
