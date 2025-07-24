import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import AddressImage from "../../assets/add_adress.svg";

const AddAddress = () => {
  const { axios, user, navigate, fetchCurrentUser } =
    useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.4, ease: "easeIn" } },
  };

  const formCardVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.5, ease: "easeOut" } },
  };

  const imageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { delay: 0.4, duration: 0.6, ease: "easeOut" } },
  };

  const textFieldVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95 },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !address[field]);

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data } = await axios.post("/api/users/me/address/add", address);

      if (data.success) {
        toast.success(data.message);
        if (fetchCurrentUser) {
          await fetchCurrentUser();
        }
        navigate("/my-society/ads/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error(error.response?.data?.message || "Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: isMobile ? "center" : "center",
        alignItems: "center",
        padding: isMobile ? theme.spacing(4, 2) : theme.spacing(10, 5),
        gap: isMobile ? theme.spacing(4) : theme.spacing(8),
        backgroundColor: theme.palette.background.default,
        boxSizing: "border-box",
      }}
    >
      <motion.div variants={formCardVariants} style={{ width: isMobile ? "100%" : "auto" }}>
        <Paper
          elevation={8}
          sx={{
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            width: isMobile ? "100%" : 650,
            maxWidth: '100%',
            backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.background.paper,
            boxShadow: isDark
              ? "0px 10px 30px rgba(0,0,0,0.5)"
              : "0px 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant={isMobile ? "h5" : "h4"} mb={4} fontWeight={700} sx={{ textAlign: 'center' }}>
            Add Shipping{" "}
            <Typography component="span" variant="inherit" color={theme.palette.primary.main}>
              Address
            </Typography>
          </Typography>
          <form onSubmit={onSubmitHandler}>
            <Grid container spacing={isMobile ? 1.5 : 3}>
              <Grid item xs={12} sm={6}>
                <motion.div variants={textFieldVariants}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={address.firstName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& label": { color: isDark ? "#bbb" : "#666" },
                      "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                      "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                      width: isMobile ? 350 : "100%",
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={textFieldVariants}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={address.lastName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& label": { color: isDark ? "#bbb" : "#666" },
                      "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                      "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                      width: isMobile ? 350 : "100%",
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div variants={textFieldVariants}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={address.email}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& label": { color: isDark ? "#bbb" : "#666" },
                      "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                      "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                      width: isMobile ? 350 : "100%",
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div variants={textFieldVariants}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="street"
                    value={address.street}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& label": { color: isDark ? "#bbb" : "#666" },
                      "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                      "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                      width: isMobile ? 350 : "100%",
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={textFieldVariants}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& label": { color: isDark ? "#bbb" : "#666" },
                      "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                      "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                      width: isMobile ? 350 : "100%",
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={textFieldVariants}>
                  <TextField
                    fullWidth
                    label="State / Province"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& label": { color: isDark ? "#bbb" : "#666" },
                      "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                      "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                      width: isMobile ? 350 : "100%",
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={textFieldVariants}>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    name="zipcode"
                    type="number"
                    value={address.zipcode}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& label": { color: isDark ? "#bbb" : "#666" },
                      "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                      "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                      width: isMobile ? 350 : "100%",
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={textFieldVariants}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={address.country}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& label": { color: isDark ? "#bbb" : "#666" },
                      "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                      "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                      width: isMobile ? 350 : "100%",
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div variants={textFieldVariants}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={address.phone}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& label": { color: isDark ? "#bbb" : "#666" },
                      "& .MuiInputBase-input": { color: isDark ? "#fff" : "#000" },
                      "& fieldset": { borderColor: isDark ? "#555" : "#ddd" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                      width: isMobile ? 350 : "100%",
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                      px: 5,
                      py: 1.5,
                      borderRadius: 3,
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      fontWeight: 'bold',
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[4],
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                      transition: "all 0.2s ease-in-out",
                      "&.Mui-disabled": {
                        backgroundColor: isDark ? theme.palette.grey[700] : theme.palette.grey[300],
                        color: isDark ? theme.palette.grey[500] : theme.palette.grey[600],
                      }
                    }}
                  >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Save Address"}
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>

      <motion.div variants={imageVariants} style={{ flexShrink: 0 }}>
        <Box
          component="img"
          src={AddressImage}
          alt="Add Address"
          sx={{
            width: isMobile ? "80%" : 400,
            maxWidth: "100%",
            height: "auto",
            display: "block",
            mx: "auto",
            mt: { xs: 4, md: 0 },
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default AddAddress;
