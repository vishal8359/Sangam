import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ProductIcon from "../../assets/Product_Icon.png";
import Product_Bg from "../../assets/products_bg.png";
import { useNavigate } from "react-router-dom";

const ProductFormSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");

  const inputContainerStyle = {
    backgroundColor: isDark ? "#121212" : "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    boxShadow: isDark
      ? "0 0 10px rgba(255, 255, 255, 0.1)"
      : "0 0 10px rgba(0, 0, 0, 0.1)",
    marginBottom: 8,
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(
      files.slice(0, 5).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
    );
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        position: "relative",
        zIndex: 1,
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "150vh",
          backgroundImage: `url(${Product_Bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          filter: "blur(8px)",
          zIndex: -2,
        },
      }}
    >
      <Box
        component="h4"
        sx={{
          m: 3,
          pt:3,
          color: "#000",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          fontSize: isMobile ? "1.5rem" : "2rem",
        }}
      >
        <StorefrontIcon sx={{ mr: 1 }} />
        Add a Product
      </Box>

      <Paper
        sx={{
          ...inputContainerStyle,
          m: 3,
          p: 3,
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            display: "flex",
            mb: 2,
            color: isDark ? "#fff" : "#000",
          }}
        >
          <img
            className="w-10 h-10 mr-4 rounded-2xl"
            src={ProductIcon}
            alt="Product"
          />
          <div className="mt-1">Add Your Product</div>
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Product Name"
            variant="filled"
            size="small"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            fullWidth
            InputProps={{ sx: { backgroundColor: "#fff", color: "black" } }}
          />

          <TextField
            label="Price (₹)"
            variant="filled"
            size="small"
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            InputProps={{ sx: { backgroundColor: "#fff", color: "black" } }}
          />

          <TextField
            label="Available Quantity"
            variant="filled"
            size="small"
            type="number"
            inputProps={{ min: 0, step: "1" }}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            InputProps={{ sx: { backgroundColor: "#fff", color: "black" } }}
          />

          <TextField
            label="Product Description"
            variant="filled"
            size="small"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            InputProps={{ sx: { backgroundColor: "#fff", color: "black" } }}
          />

          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: isDark ? "#fff" : "#121212",
              color: isDark ? "#121212" : "#fff",
              maxWidth: 300,
              mx: "auto",
            }}
          >
            Upload Images (Max 5)
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
            {images.map((img, i) => (
              <Box
                key={i}
                sx={{
                  position: "relative",
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  overflow: "hidden",
                  boxShadow: theme.shadows[3],
                  flexShrink: 0,
                }}
              >
                <img
                  src={img.url}
                  alt={`Preview ${i}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeImage(i)}
                  sx={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate("/my-society/ads")}
            sx={{
              maxWidth: 200,
              mx: "auto",
              backgroundColor: isDark ? "#fff" : "#121212",
              color: isDark ? "#121212" : "#fff",
            }}
          >
            Add Product
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductFormSection;
