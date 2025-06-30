import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  useTheme,
  Paper,
  useMediaQuery,
} from "@mui/material";
import AddressImage from "../../assets/add_adress.svg";

const AddAddress = () => {
  const { axios, user, navigate, setAddresses, setSelectedAddress } =
    useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const newAddress = {
        ...address,
        _id: Date.now().toString(),
      };

      // Update state
      setAddresses((prev) => {
        const updated = [...prev, newAddress];
        // Save to localStorage
        localStorage.setItem("mock-addresses", JSON.stringify(updated));
        return updated;
      });

      // Set selected address
      setSelectedAddress(newAddress);

      toast.success("Address saved successfully!");
      navigate("/my-society/ads/cart");
    } catch (error) {
      toast.error("Failed to save address.");
    }
  };

  return (
    <Box
      mt={10}
      mb={10}
      px={{ xs: 2, md: 10 }}
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: isMobile ? "center" : "space-between",
        alignItems: isMobile ? "center" : "flex-start",
        pt: 10,
        ml: 3,
        gap: 4,
        width: "100%",
        maxHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          width: isMobile ? "100vw" : "45vw",
          mr: 3,
        }}
      >
        <Typography variant="h4" mb={4} color="text.secondary">
          Add Shipping{" "}
          <span style={{ color: theme.palette.primary.main }}>Address</span>
        </Typography>
        <Grid container spacing={4}>
          {/* 📝 Form Section */}
          <Grid item xs={12} md={6}>
            <form onSubmit={onSubmitHandler}>
              <Grid container spacing={2}>
                <div className="flex gap-3">
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={address.firstName}
                      onChange={handleChange}
                      sx={{
                        width: isMobile ? 130 : 300,
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={address.lastName}
                      onChange={handleChange}
                      sx={{
                        width: isMobile ? 130 : 300,
                      }}
                      required
                    />
                  </Grid>
                </div>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={address.email}
                    onChange={handleChange}
                    sx={{
                      width: isMobile ? 270 : 612,
                    }}
                    required
                  />
                </Grid>
                <div className="flex gap-3">
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street"
                      name="street"
                      value={address.street}
                      onChange={handleChange}
                      sx={{
                        width: isMobile ? 130 : 300,
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                      sx={{
                        width: isMobile ? 130 : 300,
                      }}
                      required
                    />
                  </Grid>
                </div>
                <div className="flex gap-3">
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={address.state}
                      onChange={handleChange}
                      sx={{
                        width: isMobile ? 130 : 300,
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Zip Code"
                      name="zipcode"
                      type="number"
                      value={address.zipcode}
                      onChange={handleChange}
                      sx={{
                        width: isMobile ? 130 : 300,
                      }}
                      required
                    />
                  </Grid>
                </div>
                <div className="flex gap-3">
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={address.country}
                      onChange={handleChange}
                      sx={{
                        width: isMobile ? 130 : 300,
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={address.phone}
                      onChange={handleChange}
                      sx={{
                        width: isMobile ? 130 : 300,
                      }}
                      required
                    />
                  </Grid>
                </div>
                <Grid item xs={12} sx={{ ml: isMobile ? 5 : 27, mt: 1 }}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    sx={{ width: 200 }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        px: 5,
                        py: 1.5,
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                        "&:hover": {
                          bgcolor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      Save Address
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
      {/* 🖼️ Image Section */}
      <Grid item xs={12} md={5}>
        <Box
          component="img"
          src={AddressImage}
          alt="Add Address"
          width="100%"
          maxWidth={400}
          sx={{ mt: { xs: 4, md: 0 }, mx: "auto" }}
        />
      </Grid>
    </Box>
  );
};

export default AddAddress;
