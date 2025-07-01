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
import { Link as RouterLink } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    phone_no: "",
    address: "",
    electricity_bill_no: "",
    password: "",
    confirm_password: "",
    avatar: "",
  });

  const [error, setError] = useState(null);
  const { axios, navigate } = useAppContext();
  const theme = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "user_name",
      "email",
      "phone_no",
      "address",
      "electricity_bill_no",
      "password",
      "confirm_password",
    ];

    const anyEmpty = requiredFields.some(
      (key) => !formData[key] || formData[key].trim() === ""
    );

    if (anyEmpty) {
      setError("All fields except avatar are required.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const { data } = await axios.post("/api/users/register", {
        user_name: formData.user_name.trim(),
        email: formData.email.trim(),
        phone_no: formData.phone_no.trim(),
        address: formData.address.trim(),
        electricity_bill_no: formData.electricity_bill_no.trim(),
        password: formData.password.trim(),
        confirm_password: formData.confirm_password.trim(),
        avatar: formData.avatar?.trim() || "",
      });

      localStorage.setItem("otp_phone", formData.phone_no.trim());
      toast.success(data.message || "Registration submitted. Awaiting OTP.");
      setError(null);

      setFormData({
        user_name: "",
        email: "",
        phone_no: "",
        address: "",
        electricity_bill_no: "",
        password: "",
        confirm_password: "",
        avatar: "",
      });

      navigate("/verify-otp");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Registration failed.";
      toast.error(message);
      setError(message);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(to bottom, #0f172a, #1e293b)"
            : "linear-gradient(to bottom right, #e3f2fd, #f5f5f5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 600,
          borderRadius: 4,
          maxHeight: "95vh",
          overflowY: "auto",
          boxShadow: theme.shadows[10],
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
          color={theme.palette.mode === "dark" ? "#f0f0f0" : "#1a237e"}
        >
          New User Registration
        </Typography>

        <form onSubmit={handleSubmit}>
          {[
            { label: "Full Name", name: "user_name" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone Number", name: "phone_no", type: "tel" },
            { label: "Address", name: "address", multiline: true, rows: 2 },
            { label: "Electricity Bill Number", name: "electricity_bill_no" },
            { label: "Avatar (optional)", name: "avatar" },
            { label: "Password", name: "password", type: "password" },
            {
              label: "Confirm Password",
              name: "confirm_password",
              type: "password",
            },
          ].map((field) => (
            <TextField
              key={field.name}
              fullWidth
              margin="normal"
              required={field.name !== "avatar"}
              variant="outlined"
              label={field.label}
              name={field.name}
              type={field.type || "text"}
              multiline={field.multiline || false}
              rows={field.rows || 1}
              value={formData[field.name]}
              onChange={handleChange}
            />
          ))}

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
            sx={{ mt: 2, py: 1.2, fontWeight: "bold", borderRadius: 2 }}
          >
            Register
          </Button>

          <Typography variant="body2" textAlign="center" mt={2}>
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/resident-login"
              color="primary"
              underline="hover"
            >
              Login here
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
