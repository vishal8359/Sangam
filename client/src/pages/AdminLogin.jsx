import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import { useAppContext } from "../context/AppContext";

const AdminLogin = () => {
  const { colors, login, navigate } = useAppContext();

  const [formData, setFormData] = useState({
    societyId: "",
    userId: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = () => {
    const { societyId, userId, password } = formData;

    if (!societyId || !userId || !password) {
      setError("Please fill all fields.");
      return;
    }

    // Simulated login validation — Replace with real API call
    if (password !== "admin123") {
      setError("Invalid password. Try 'admin123' for testing.");
      return;
    }

    const adminProfile = {
      name: "Admin",
      contact: "N/A",
      email: "admin@society.com",
    };

    login({
      societyId,
      userId,
      userRole: "admin",
      houseId: "",
      userProfile: adminProfile,
    });

    setError("");
    navigate("/my-society"); // or redirect to admin dashboard
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor={colors.background}
      p={3}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          width: "100%",
          maxWidth: 500,
          backgroundColor: colors.background,
          color: colors.text,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ color: colors.primary }}
          textAlign="center"
          gutterBottom
        >
          🔐 Admin Login
        </Typography>

        {["societyId", "userId", "password"].map((field) => (
          <TextField
            key={field}
            label={
              field === "societyId"
                ? "Society ID"
                : field === "userId"
                ? "Admin User ID"
                : "Password"
            }
            name={field}
            type={field === "password" ? "password" : "text"}
            fullWidth
            value={formData[field]}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: colors.text } }}
            InputProps={{ style: { color: colors.text } }}
          />
        ))}

        {error && (
          <Typography color="error" mb={2} textAlign="center">
            {error}
          </Typography>
        )}

        <Button variant="contained" fullWidth onClick={handleLogin}>
          Login as Admin
        </Button>
      </Paper>
    </Box>
  );
};

export default AdminLogin;
