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
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { UploadFile, Send } from "@mui/icons-material";

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
  const isDark = theme.palette.mode === "dark";

  const backgroundColor = isDark ? "#1e1e1e" : "#fff";
  const textColor = isDark ? "#e0e0e0" : "#222";
  const inputBg = isDark ? "#2c2c2c" : "#fafafa";

  const [form, setForm] = useState({
    name: "",
    flat: "",
    type: "",
    description: "",
    file: null,
  });

  const [complaints, setComplaints] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newComplaint = {
      ...form,
      id: Date.now(),
      reply: "",
    };
    setComplaints([newComplaint, ...complaints]);
    setForm({
      name: "",
      flat: "",
      type: "",
      description: "",
      file: null,
    });
    alert("Complaint Submitted Successfully!");
  };

  const handleReplyChange = (id, value) => {
    setReplyInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendReply = (id) => {
    const replyText = replyInputs[id] || "";
    if (!replyText.trim()) return; // Prevent sending empty replies
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reply: replyText } : c))
    );
    setReplyInputs((prev) => ({ ...prev, [id]: "" })); // Clear reply input
    alert("Reply Sent!");
  };

  return (
    <Slide direction="up" in mountOnEnter unmountOnExit>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        minHeight="100vh"
        sx={{
          background: isDark ? "#121212" : "#f5f5f5",
          px: isMobile ? 2 : 0,
          py: 4,
        }}
      >
        {/* Registered Complaints Section */}
        {complaints.length > 0 && (
          <>
            <Typography
              variant="h5"
              fontWeight="bold"
              mb={3}
              ml={isMobile ? 1 : 4}
              color={isDark ? "white" : "#555"}
            >
              📋 Registered Complaints
            </Typography>
            <Box
              display="flex"
              flexDirection={isMobile ? "column" : "row"}
              gap={3}
              flexWrap="wrap"
              justifyContent="flex-start"
              width="100%"
              ml={isMobile ? 0 : 5}
              mb={4}
            >
              {complaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  sx={{
                    width: isMobile ? "100%" : 300,
                    bgcolor: backgroundColor,
                    color: textColor,
                  }}
                  elevation={4}
                >
                  <CardContent>
                    <Typography variant="h6">{complaint.type}</Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {complaint.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Flat:</strong> {complaint.flat}
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      {complaint.description}
                    </Typography>
                    {complaint.file && (
                      <Box mt={1}>
                        {complaint.file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(complaint.file)}
                            alt="Uploaded"
                            style={{
                              width: "100%",
                              maxHeight: 180,
                              borderRadius: 8,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="primary">
                            📎 {complaint.file.name}
                          </Typography>
                        )}
                      </Box>
                    )}
                    {complaint.reply && (
                      <Typography variant="body2" color="success.main" mt={1}>
                        <strong>Reply:</strong> {complaint.reply}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      gap={1}
                      width="100%"
                    >
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Reply"
                        size="small"
                        value={replyInputs[complaint.id] || ""}
                        onChange={(e) =>
                          handleReplyChange(complaint.id, e.target.value)
                        }
                        InputProps={{
                          sx: {
                            backgroundColor: inputBg,
                            color: textColor,
                            "& .MuiInputBase-input": {
                              color: textColor,
                            },
                          },
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handleSendReply(complaint.id)}
                                edge="end"
                                size="small"
                                disabled={!replyInputs[complaint.id]?.trim()}
                                aria-label="send reply"
                              >
                                <Send fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{
                          sx: {
                            color: isDark ? "white" : "#555",
                          },
                        }}
                      />
                    </Box>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </>
        )}

        {/* Complaint Form */}
        <Paper
          elevation={6}
          sx={{
            width: isMobile ? "100%" : "70vw",
            p: 4,
            borderRadius: 3,
            bgcolor: backgroundColor,
            color: textColor,
            mb: 5,
            ml: isMobile ? 0 : 5,
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
                  backgroundColor: isDark
                    ? "rgba(139,92,246,0.1)"
                    : undefined,
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
