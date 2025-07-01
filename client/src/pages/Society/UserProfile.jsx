import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Stack,
} from "@mui/material";
import {
  FaUserCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaBolt,
  FaIdBadge,
  FaHome,
} from "react-icons/fa";

export default function UserProfileCard() {
  const theme = useTheme();

  // Make user stateful
  const [user, setUser] = useState({
    user_img: "https://i.pravatar.cc/150?img=32",
    user_name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone_no: "9545623478",
    electricity_bill_no: "EB-10293847",
    soc_id: "SOCIETY-9812",
    user_id: "USER-5698XTY",
    home_id: "D1/403_8359",
  });

  // Update user_img in state
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setUser((prev) => ({
        ...prev,
        user_img: imgURL,
      }));
    }
  };

  const handlePush = () => {
    console.log("Pushed User ID:", user.user_id);
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: "100vw", width: "100%", boxShadow: 6, height: "100vh" }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mt: 5,
          }}
        >
          {/* Avatar */}
          <Avatar
            src={user.user_img}
            alt="User Avatar"
            sx={{
              width: 96,
              height: 96,
              border: "3px solid",
              borderColor: theme.palette.primary.main,
            }}
          />

          {/* Upload Link */}
          <Typography
            variant="body2"
            sx={{
              color: "primary.main",
              textDecoration: "underline",
              cursor: "pointer",
              mt: -1,
              mb: 1,
            }}
            onClick={() => document.getElementById("avatar-upload").click()}
          >
            Upload Profile Image
          </Typography>

          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />

          {/* Profile Info */}
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaUserCircle /> {user.user_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaEnvelope /> {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaPhoneAlt /> {user.phone_no.replace(/(\d{5})(\d{4})/, "$1xxxx")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaBolt /> EB No: {user.electricity_bill_no}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaHome /> Society ID: {user.soc_id}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaIdBadge /> User ID: {user.user_id}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaIdBadge /> Home ID: {user.home_id}
          </Typography>

          <Button variant="contained" color="primary" onClick={handlePush} sx={{ mt: 2 }}>
            Push User ID
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
}
