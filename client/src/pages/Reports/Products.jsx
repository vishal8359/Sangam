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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ProductIcon from "../../assets/Product_Icon.png";
import Product_Bg from "../../assets/products_bg.png";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => {
      const combined = [...prev, ...newImages].slice(0, 4);
      return combined;
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !productName ||
      !price ||
      !quantity ||
      !description ||
      images.length === 0
    ) {
      alert("Please fill all required fields and upload at least one image.");
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
    // formData.append("createdBy", userId);

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    try {
      setSubmitting(true); // Start loading
      const { data } = await axios.post("/api/users/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("🎉 Product uploaded successfully!");
      navigate("/my-society/ads");
    } catch (err) {
      console.error("❌ Upload failed:", err.response?.data || err.message);
      alert("Failed to upload product");
      toast.error("❌ Failed to upload product.");
    } finally {
      setSubmitting(false); // Stop loading
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        overflow: "hidden",

        "&::before": {
          content: '""',
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
        },

        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: isDark ? "#121212" : "#ffffff",
          opacity: isDark ? 0.85 : 0.85,
          backdropFilter: "blur(10px)",
          zIndex: -1,
        },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 3,
              gap: 1,
              color: isDark ? "#fff" : "#000",
            }}
          >
            <StorefrontIcon />
            <Typography variant="h5" fontWeight="bold">
              Add a Product
            </Typography>
          </Box>

          {/* <Box sx={{ textAlign: "center", mb: 2 }}>
            <img
              src={ProductIcon}
              alt="Product"
              style={{ width: 50, height: 50, borderRadius: 10 }}
            />
          </Box> */}

          {/* Form Inputs */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Product Name"
              variant="outlined"
              fullWidth
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />

            <TextField
              label="Price (₹)"
              variant="outlined"
              fullWidth
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <TextField
              label="Offer Price (₹)"
              variant="outlined"
              fullWidth
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />

            <TextField
              label="Quantity"
              variant="outlined"
              fullWidth
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <TextField
              label="Description"
              variant="outlined"
              multiline
              minRows={3}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Rating:</Typography>
              <Rating
                value={rating}
                precision={0.5}
                onChange={(e, newValue) => setRating(newValue)}
              />
            </Box>

            <Button
              variant="contained"
              component="label"
              sx={{
                py: 1.2,
                fontWeight: "bold",
                backgroundColor: isDark ? "#fff" : "#121212",
                color: isDark ? "#121212" : "#fff",
                "&:hover": {
                  backgroundColor: isDark ? "#e0e0e0" : "#333",
                },
              }}
            >
              Upload Images (Max 4)
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={(e) => {
                  handleImageChange(e);
                  e.target.value = "";
                }}
                disabled={images.length >= 4}
              />
            </Button>

            {/* Image Previews */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 1,
                flexWrap: "wrap",
              }}
            >
              {images.map((img, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "relative",
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    overflow: "hidden",
                    boxShadow: 2,
                  }}
                >
                  <img
                    src={img.url}
                    alt={`preview-${i}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeImage(i)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.8)",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                py: 1.4,
                fontWeight: "bold",
                backgroundColor: isDark ? "#fff" : "#121212",
                color: isDark ? "#121212" : "#fff",
                "&:hover": {
                  backgroundColor: isDark ? "#e0e0e0" : "#333",
                },
              }}
            >
              {submitting ? "Uploading..." : "Add Product"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProductFormSection;
