// pages/SubmitComplaint.jsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Slide,
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Complaint_Bg from "../../assets/Complaint_Bg.jpg";
import { useAppContext } from "../../context/AppContext";

const complaintTypes = [
  "Water Leakage",
  "Electricity Issue",
  "Noise Complaint",
  "Security Concern",
  "Other",
];

const SubmitComplaint = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const inputBg = isDark ? "#2c2c2c" : "#fafafa";
  const textColor = isDark ? "#e0e0e0" : "#222";
  const { token, axios } = useAppContext();

  const [form, setForm] = useState({
    name: "",
    flat: "",
    type: "",
    description: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("complaint_type", form.type);
    formData.append("description", form.description);
    formData.append("house_no", form.flat);
    if (form.file) formData.append("file", form.file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/complaints/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      alert("✅ Complaint submitted!");
      navigate("/my-society/complaints");
    } catch (err) {
      console.error(
        "❌ Complaint submission failed:",
        err.response?.data || err.message
      );
      alert("Failed to submit complaint.");
    }
  };

  return (
    <Slide direction="up" in mountOnEnter unmountOnExit>
      <Box
        minHeight="100vh"
        sx={{
          position: "relative",
          zIndex: 1,
          background: isDark ? "#121212" : "#f5f5f5",
          "&::before": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "150vh",
            backgroundImage: `url(${Complaint_Bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(8px)",
            zIndex: -2,
          },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: isMobile ? "100%" : "70vw",
            p: 4,
            mx: "auto",
            mt: 8,
            borderRadius: 3,
            bgcolor: isDark ? "#1e1e1e" : "#fff",
            color: textColor,
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={3}>
            📝 Sangam Society Complaint Form
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                sx: { backgroundColor: inputBg, color: textColor },
              }}
              InputLabelProps={{ sx: { color: isDark ? "white" : "#555" } }}
            />
            <TextField
              fullWidth
              label="Flat Number"
              name="flat"
              value={form.flat}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                sx: { backgroundColor: inputBg, color: textColor },
              }}
              InputLabelProps={{ sx: { color: isDark ? "white" : "#555" } }}
            />
            <TextField
              select
              fullWidth
              label="Complaint Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                sx: { backgroundColor: inputBg, color: textColor },
              }}
              InputLabelProps={{ sx: { color: isDark ? "white" : "#555" } }}
            >
              {complaintTypes.map((type, i) => (
                <MenuItem key={i} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
              margin="normal"
              InputProps={{
                sx: { backgroundColor: inputBg, color: textColor },
              }}
              InputLabelProps={{ sx: { color: isDark ? "white" : "#555" } }}
            />
            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{ my: 2 }}
              startIcon={<UploadFile />}
            >
              {form.file ? form.file.name : "Upload File (Optional)"}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </Button>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Submit Complaint
            </Button>
          </form>
        </Paper>
      </Box>
    </Slide>
  );
};

export default SubmitComplaint;
