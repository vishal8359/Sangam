import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

export default function ResidentLogin() {
  const [societyId, setSocietyId] = useState("");
  const [houseId, setHouseId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { setUserRole } = useAppContext(); // access context
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!societyId.trim() || !houseId.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    setError(null);

    const loginData = {
      societyId: societyId.trim(),
      houseId: houseId.trim(),
      email: email.trim(),
      password: password.trim(),
    };

    console.log("Logging in with:", loginData);

    // Simulate successful login
    setUserRole("resident");
    toast.success("User login successfully");

    navigate("/my-society");
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f4f6f8"
      px={2}
    >
      <Paper
        elevation={6}
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
          color={theme.palette.mode === "dark" ? "#f5f5ff" : ""}
        >
          Resident Login
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="User ID"
            value={societyId}
            onChange={(e) => setSocietyId(e.target.value)}
            variant="outlined"
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="House ID"
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            variant="outlined"
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            sx={{ mt: 2, py: 1.2 }}
          >
            Login
          </Button>

          <Typography variant="body2" textAlign="center" mt={2}>
            New User?{" "}
            <Link
              href="#"
              onClick={handleRegisterClick}
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
