import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
} from "@mui/material";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

export default function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const { axios, navigate } = useAppContext();
  const inputRefs = useRef([]);

  const phone_no = localStorage.getItem("otp_phone"); 

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    if (!phone_no) {
      toast.error("Phone number not found. Please register again.");
      return;
    }

    try {
      const { data } = await axios.post("/api/users/verify-otp", {
        phone_no,
        otp: fullOtp,
      });

      toast.success(data.message || "OTP verified");
      localStorage.removeItem("otp_phone");
      navigate("/resident-login");
    } catch (err) {
      const message = err?.response?.data?.message || "Verification failed";
      toast.error(message);
    }
  };

  const handleResend = async () => {
    if (!phone_no) {
      toast.error("Phone number missing. Please register again.");
      return;
    }

    try {
      const { data } = await axios.post("/api/users/resend-otp", { phone_no });
      toast.success(data.message || "OTP resent");
      setOtp(["", "", "", "", "", ""]);
      setTimer(60);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    }
  };

  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(to bottom, #0f172a, #1e293b)"
            : "linear-gradient(to right, #e3f2fd, #f5f5f5)",
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 500,
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Enter OTP
        </Typography>

        <Typography mb={2}>Enter the 6-digit OTP sent to your phone</Typography>
        <div className="mb-2">
          <strong>Type anything, as OTP service is unavialable due to limited money 😢</strong>
        </div>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          {otp.map((digit, index) => (
            <TextField
              key={index}
              inputRef={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              inputProps={{ maxLength: 1, style: { textAlign: "center" } }}
              sx={{ width: 40 }}
            />
          ))}
        </Box>

        <Typography mt={2} color="text.secondary">
          {timer > 0 ? `Resend OTP in ${timer}s` : "Didn't receive it?"}
        </Typography>

        {timer === 0 && (
          <Button onClick={handleResend} sx={{ mt: 1 }}>
            Resend OTP
          </Button>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, py: 1.3, borderRadius: 2, fontWeight: "bold" }}
          onClick={handleSubmit}
        >
          Verify OTP
        </Button>
      </Paper>
    </Box>
  );
}
