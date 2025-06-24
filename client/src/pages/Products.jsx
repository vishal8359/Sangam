import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import StorefrontIcon from "@mui/icons-material/Storefront";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ProductIcon from "../assets/Product_Icon.png";
import Product_Bg from "../assets/products_bg.png";
import { useNavigate } from "react-router-dom";
const SocietyProductsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  // Dark mode styles for input container
  const inputContainerStyle = {
    backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 0 10px rgba(255, 255, 255, 0.1)"
        : "0 0 10px rgba(0, 0, 0, 0.1)",
    marginBottom: 8,
  };

  // State
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  // Handle image upload, limit preview size to 80x80
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(
      files.slice(0, 5).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
    );
  };

  // Remove image preview
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add product
  const addProduct = () => {
    if (
      !productName.trim() ||
      !price.trim() ||
      !quantity.trim() ||
      images.length === 0
    ) {
      alert(
        "Please add product name, price, quantity, and at least one image."
      );
      return;
    }

    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: productName.trim(),
        price: parseFloat(price).toFixed(2),
        quantity: parseInt(quantity, 10),
        description: description.trim(),
        images,
      },
    ]);

    // Reset inputs
    setProductName("");
    setPrice("");
    setQuantity("");
    setDescription("");
    setImages([]);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        m: 0,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
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
        ...(isDark && {
          "&::after": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "150vh",
            backgroundColor: "rgba(100, 10, 10, 0.1)", // slightly darker dim
            zIndex: -1,
          },
        }),
      }}
    >
      {/* Products Display */}
      {products.length !== 0 && (
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            m: 3,
            color: "#000",
            fontWeight: "bold",
          }}
        >
          Available Products
        </Typography>
      )}

      <Grid container spacing={3} mt={4}>
        {products.map(({ id, name, price, quantity, description, images }) => (
          <Grid item xs={12} sm={6} md={4} key={id}>
            <Paper
              sx={{
                p: 2,
                ml: isMobile ? 5 : 3,
                borderRadius: 2,
                boxShadow: theme.shadows[4],
                backgroundColor:
                  theme.palette.mode === "dark" ? "#222" : "#fff",
                display: "flex",
                flexDirection: "column",
                width: 330, // ✅ Fixed height
                justifyContent: "space-between",
                marginBottom: 3,
              }}
            >
              {/* Images container: scroll horizontally on mobile */}
              <Box
                sx={{
                  display: "flex",
                  overflowX: isMobile ? "auto" : "visible",
                  gap: 1,
                  mb: 1,
                  scrollbarWidth: "thin",
                }}
              >
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={`${name} ${i}`}
                    style={{
                      width: 90,
                      height: 90,
                      objectFit: "cover",
                      borderRadius: 8,
                      flexShrink: 0,
                      boxShadow: theme.shadows[2],
                    }}
                  />
                ))}
                <Box className="ml-2.5">
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 0.5,
                      color: "text.primary",
                      fontSize: isMobile ? "1.1rem" : "1.25rem",
                    }}
                  >
                    {name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      fontSize: isMobile ? "1rem" : "1.1rem",
                    }}
                  >
                    ₹ {price}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: "medium",
                      color:
                        theme.palette.mode === "dark" ? "#f5f5f5" : "#121212",
                      mb: 1,
                      fontSize: isMobile ? "0.85rem" : "0.95rem",
                    }}
                  >
                    Quantity Available: {quantity}
                  </Typography>
                </Box>
              </Box>

              {/* Description as bullet points with icon */}
              {description ? (
                <Box
                  sx={{
                    mb: 1,
                    minHeight: 40,
                    color:
                      theme.palette.mode === "dark" ? "#f5f5f5" : "#121212",
                  }}
                >
                  {description
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((point, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          fontSize: isMobile ? "0.8rem" : "0.9rem",
                          mb: 0.5,
                          flexWrap: "wrap", // ensures the row wraps
                        }}
                      >
                        <FiberManualRecordIcon
                          sx={{
                            fontSize: "0.6rem",
                            color: "text.secondary",
                            mt: "4px",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: "break-word",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.4,
                          }}
                        >
                          {point.trim()}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: "text.secondary", minHeight: 40 }}
                >
                  No description provided.
                </Typography>
              )}
              <Button
                variant="outlined"
                size="small"
                sx={{
                  mt: "auto",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#fff" : "#f5f5f5",
                }}
                fullWidth={isMobile}
              >
                Buy Now
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box
        component="h4"
        sx={{
          m: 3,
          color: "#000",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          fontSize: isMobile ? "1.5rem" : "2rem",
        }}
      >
        <StorefrontIcon sx={{ mr: 1 }} />
        Society Products Marketplace
      </Box>

      {/* Input Section */}
      <Paper
        sx={{
          ...inputContainerStyle,
          width: isMobile ? "50" : "440", // full width on mobile, fixed on desktop
          m: 3,
          p: 3,
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            display: "flex",
            mb: 2,
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
          }}
        >
          <img
            className="w-10 h-10 mr-4 rounded-2xl"
            src={ProductIcon}
            alt="img"
          />
          <div className="mt-1">Add Your Product</div>
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
          {/* All TextFields have fullWidth */}
          <TextField
            label="Product Name"
            variant="filled"
            size="small"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            InputProps={{
              sx: {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#fff" : "#fff",
                color: "black", // force input text color to black
                "& input": {
                  color: "black", // ensures actual input text is black
                },
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "white" : "#f5f5f5",
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "white" : "#fff",
                },
              },
            }}
            fullWidth
          />

          <TextField
            label="Price (₹)"
            variant="filled"
            size="small"
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            InputProps={{
              sx: {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#fff" : "#fff",
                color: "black", // force input text color to black
                "& input": {
                  color: "black", // ensures actual input text is black
                },
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "white" : "#f5f5f5",
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "white" : "#fff",
                },
              },
            }}
            fullWidth
          />

          <TextField
            label="Available Quantity"
            variant="filled"
            size="small"
            type="number"
            inputProps={{ min: 0, step: "1" }}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            InputProps={{
              sx: {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#fff" : "#fff",
                color: "black", // force input text color to black
                "& input": {
                  color: "black", // ensures actual input text is black
                },
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "white" : "#f5f5f5",
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "white" : "#fff",
                },
              },
            }}
            fullWidth
          />

          <TextField
            label="Product Description"
            variant="filled"
            size="small"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputProps={{
              sx: {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#fff" : "#fff",
                color: "black", // force input text color to black
                "& input": {
                  color: "black", // ensures actual input text is black
                },
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "white" : "#f5f5f5",
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "white" : "#fff",
                },
              },
            }}
            fullWidth
          />

          <Button
            variant="contained"
            component="label"
            sx={{
              maxWidth: isMobile ? "100%" : 300,
              width: isMobile ? "100%" : "auto",
              mx: "auto",
              backgroundColor:
                theme.palette.mode === "dark" ? "#fff" : "#121212",
              color: theme.palette.mode === "dark" ? "#121212" : "#fff",
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

          {/* Preview selected images */}
          <Box
            sx={{
              mt: 1,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              maxWidth: "100%", // always full width to avoid cropping on mobile
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
            onClick={() => navigate('/my-society/ads')}
            sx={{
              mt: 0,
              maxWidth: isMobile ? "100%" : 200,
              width: isMobile ? "100%" : "auto",
              mx: "auto",
              backgroundColor:
                theme.palette.mode === "dark" ? "#fff" : "#121212",
              color: theme.palette.mode === "dark" ? "#121212" : "#fff",
            }}
          >
            Add Product
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SocietyProductsPage;
