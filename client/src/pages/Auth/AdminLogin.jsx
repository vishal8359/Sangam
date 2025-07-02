import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const AdminLogin = () => {
  const { colors, login, navigate, axios } = useAppContext();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      const res = await axios.post("/api/admin/login", {
        email,
        password,
      });

      const { token, admin } = res.data;

      // Store token if needed (optional: axios.defaults.headers.common)
      localStorage.setItem("adminToken", token);

      login({
        token,
        userId: admin.user_id,
        userRole: "admin",
        societyId: admin.roles[0]?.society_id || "",
        houseId: "",
        userProfile: {
          name: admin.name,
          email: admin.email,
        },
      });

      toast.success("Admin login successful");
      navigate("/my-society");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    }
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

        <TextField
          label="Email"
          name="email"
          fullWidth
          value={formData.email}
          onChange={handleChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ style: { color: colors.text } }}
          InputProps={{ style: { color: colors.text } }}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          value={formData.password}
          onChange={handleChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ style: { color: colors.text } }}
          InputProps={{ style: { color: colors.text } }}
        />

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
