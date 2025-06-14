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
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Register() {
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    phone_no: "",
    address: "",
    electricity_bill_no: "",
    password: "",
    confirm_password: "",
    society_id: "",
  });

  const [error, setError] = useState(null);
  const { navigate } = useAppContext();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateRandomId = (prefix = "ID") => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      user_name,
      email,
      phone_no,
      address,
      electricity_bill_no,
      password,
      confirm_password,
      society_id,
    } = formData;

    if (
      !user_name ||
      !email ||
      !phone_no ||
      !address ||
      !electricity_bill_no ||
      !password ||
      !confirm_password ||
      !society_id
    ) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);

    const user_id = generateRandomId("USER");
    const home_id = generateRandomId("HOME");

    const registrationPayload = {
      ...formData,
      user_id,
      home_id,
    };

    console.log("New Registration:", registrationPayload);

    alert(
      "Registration request submitted. Your user ID will be created once approved."
    );

    setFormData({
      user_name: "",
      email: "",
      phone_no: "",
      address: "",
      electricity_bill_no: "",
      password: "",
      confirm_password: "",
      society_id: "",
    });

    navigate("/");
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
        overflow: "auto",
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
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            display: "none",
          },
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
            {
              label: "Phone Number",
              name: "phone_no",
              type: "tel",
              placeholder: "10-digit number",
            },
            { label: "Address", name: "address", multiline: true, rows: 2 },
            {
              label: "Electricity Bill Number",
              name: "electricity_bill_no",
              helperText: "Used to verify the house",
            },
            { label: "Society ID", name: "society_id" },
            { label: "Password", name: "password", type: "password" },
            {
              label: "Confirm Password",
              name: "confirm_password",
              type: "password",
            },
          ].map((field, index) => (
            <TextField
              key={index}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              {...field}
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
