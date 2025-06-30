import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const UploadNoticePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { addNotice } = useAppContext();

  // Notice type options
  const noticeTypes = ["Maintenance", "Event", "Emergency", "Meeting", "Other"];

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    postedBy: "Admin",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, type, description } = form;

    if (!title.trim() || !type.trim() || !description.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    const newNotice = {
      id: Date.now(),
      ...form,
      date: new Date().toISOString().split("T")[0],
    };

    addNotice(newNotice);
    navigate("/my-society/notices");
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, m: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          📝 Post a New Notice
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          {/* Title */}
          <TextField
            label="Notice Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            fullWidth
          />

          {/* Posted By */}
          <TextField
            label="Posted By"
            name="postedBy"
            value={form.postedBy}
            disabled
            fullWidth
          />

          {/* Notice Type */}
          <TextField
            select
            label="Notice Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            fullWidth
          >
            {noticeTypes.map((type, idx) => (
              <MenuItem key={idx} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          {/* Description */}
          <TextField
            label="Notice Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            multiline
            rows={5}
            fullWidth
          />

          {/* Submit */}
          <Button variant="contained" type="submit" size="large">
            Upload Notice
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UploadNoticePage;
