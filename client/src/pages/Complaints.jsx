import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Slide,
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";

const complaintTypes = [
  "Water Leakage",
  "Electricity Issue",
  "Noise Complaint",
  "Security Concern",
  "Other",
];

const ComplaintForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [form, setForm] = useState({
    name: "",
    flat: "",
    type: "",
    description: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", form);
    alert("Complaint Submitted Successfully!");
  };

  // Define colors dynamically
  const isDark = theme.palette.mode === "dark";
  const backgroundColor = isDark ? "#1e1e1e" : "#fff";
  const textColor = isDark ? "#e0e0e0" : "#222";
  const inputBg = isDark ? "#2c2c2c" : "#fafafa";

  return (
    <Slide direction="up" in mountOnEnter unmountOnExit>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: isDark ? "#121212" : "#f5f5f5",
          px: isMobile ? 2 : 0,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: isMobile ? "100%" : 500,
            p: 4,
            borderRadius: 3,
            bgcolor: backgroundColor,
            color: textColor,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            mb={3}
            color={isDark ? "White" : "#555"}
          >
            📝 Sangam Society Complaint Form
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                sx: {
                  backgroundColor: inputBg,
                  color: textColor,
                  "& .MuiInputBase-input": {
                    color: textColor,
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: isDark ? "white" : "#555",
                },
              }}
            />
            <TextField
              fullWidth
              label="Flat Number"
              name="flat"
              value={form.flat}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                sx: {
                  backgroundColor: inputBg,
                  color: textColor,
                  "& .MuiInputBase-input": {
                    color: textColor,
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: isDark ? "white" : "#555",
                },
              }}
            />
            <TextField
              select
              fullWidth
              label="Complaint Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                sx: {
                  backgroundColor: inputBg,
                  color: textColor,
                },
              }}
              InputLabelProps={{
                sx: {
                  color: isDark ? "white" : "#555",
                },
              }}
            >
              {complaintTypes.map((type, i) => (
                <MenuItem key={i} value={type} sx={{ color: textColor }}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
              margin="normal"
              InputProps={{
                sx: {
                  backgroundColor: inputBg,
                  color: textColor,
                  "& .MuiInputBase-input": {
                    color: textColor,
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: isDark ? "white" : "#555",
                },
              }}
            />
            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{
                my: 2,
                color: textColor,
                borderColor: isDark ? "#777" : undefined,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: isDark ? "rgba(139,92,246,0.1)" : undefined,
                },
              }}
              startIcon={<UploadFile />}
            >
              {form.file ? form.file.name : "Upload File (Optional)"}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              sx={{
                py: 1.2,
                fontWeight: "bold",
                backgroundColor: theme.palette.primary.main,
              }}
            >
              Submit Complaint
            </Button>
          </form>
        </Paper>
      </Box>
    </Slide>
  );
};

export default ComplaintForm;
