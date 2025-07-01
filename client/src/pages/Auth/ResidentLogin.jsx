import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  useTheme,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function ResidentLogin() {
  const [formData, setFormData] = useState({
    society_id: "",
    user_id: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { axios, setUserRole } = useAppContext();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔁 Submitting login form...");
    const { society_id, user_id, password } = formData;

    if (!society_id.trim() || !user_id.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/users/login", {
        society_id: society_id.trim(),
        user_id: user_id.trim(),
        password: password.trim(),
      });

      console.log("✅ Response:", response);

      const data = response.data;

      if (data.success) {
        toast.success(data.message || "Login successful");
        setUserRole("resident");
        localStorage.setItem("userToken", data.token);
        navigate("/my-society");
        return; // Important to stop execution here
      } else {
        console.log("⚠️ Unexpected success:false:", data);
      }
    } catch (err) {
      console.log("❌ Error caught:", err);
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Login failed";

      if (status === 403) {
        toast.success(message); // for join request
        setError(null);
      } else {
        toast.error(message);
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor={
        theme.palette.mode === "dark"
          ? "linear-gradient(to bottom, #0f172a, #1e293b)"
          : "#f4f6f8"
      }
      px={2}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          maxWidth: 500,
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
          color={theme.palette.mode === "dark" ? "#f5f5ff" : "#1a237e"}
        >
          Resident Login
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Society ID"
            name="society_id"
            value={formData.society_id}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="User ID"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            required
          />

          {error && (
            <Typography color="error" mt={1} mb={2}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2, py: 1.2, fontWeight: "bold", borderRadius: 2 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Typography variant="body2" textAlign="center" mt={2}>
            New User?{" "}
            <Link
              component="button"
              onClick={() => navigate("/register")}
              color="primary"
              underline="hover"
            >
              Register here
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
