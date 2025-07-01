import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const CreateSociety = () => {
  const { colors, login, axios } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    house: "",
    contact: "",
    email: "",
    password: "",
    location: "", // JSON string input
  });
  const navigate = useNavigate();

  const [createdDetails, setCreatedDetails] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    const { name, house, contact, password, location } = formData;

    if (!name || !house || !contact || !password || !location) {
      alert("Please fill all required fields.");
      return;
    }

    let parsedLocation;
    try {
      parsedLocation = JSON.parse(location);
      if (
        !parsedLocation.type ||
        parsedLocation.type !== "Polygon" ||
        !Array.isArray(parsedLocation.coordinates)
      ) {
        throw new Error("Invalid GeoJSON");
      }
    } catch (err) {
      alert("Invalid GeoJSON format for location.");
      return;
    }

    try {
      const { data } = await axios.post("/api/users/society/create", {
        ...formData,
        location: parsedLocation,
      });

      login({
        userId: data.user_id,
        houseId: data.home_id,
        societyId: data.society_id,
        userRole: "admin",
        userProfile: {
          name: formData.name,
          contact: formData.contact,
          email: formData.email,
        },
      });

      setCreatedDetails({
        societyId: data.society_id,
        userId: data.user_id,
        password: formData.password,
      });
    } catch (err) {
      console.error("❌ Error:", err?.response?.data || err.message);
      alert("Failed to create society.");
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
          🏢 Create New Society
        </Typography>

        {!createdDetails ? (
          <>
            {[
              { label: "Full Name", name: "name" },
              { label: "House Number", name: "house" },
              { label: "Contact Number", name: "contact" },
              { label: "Email (Optional)", name: "email" },
              { label: "Password", name: "password", type: "password" },
              {
                label: "Location (GeoJSON Polygon)",
                name: "location",
                multiline: true,
                minRows: 4,
              },
            ].map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type || "text"}
                fullWidth
                value={formData[field.name]}
                onChange={handleChange}
                sx={{ mb: 2 }}
                multiline={field.multiline || false}
                minRows={field.minRows || 1}
                InputLabelProps={{ style: { color: colors.text } }}
                InputProps={{ style: { color: colors.text } }}
              />
            ))}

            <Button variant="contained" fullWidth onClick={handleSubmit}>
              Create Society
            </Button>
          </>
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              ✅ Society Created Successfully!
            </Typography>
            <Typography>
              <strong>Society ID:</strong> {createdDetails.societyId}
            </Typography>
            <Typography>
              <strong>Admin User ID:</strong> {createdDetails.userId}
            </Typography>
            <Typography>
              <strong>Password:</strong> {createdDetails.password}
            </Typography>
            <button className="rounded-xl bg-blue-400 p-2 mt-3" onClick={() => navigate('/')}>
              Go back
            </button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CreateSociety;
