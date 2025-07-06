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
  const { addNotice, societyId, token, axios } = useAppContext();

  const noticeTypes = ["Maintenance", "Event", "Emergency", "Meeting", "Other"];

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, type, description } = form;

    if (!title.trim() || !type.trim() || !description.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/admin/notices/create",
        {
          title,
          type,
          description,
          society_id: societyId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.notice) {
        addNotice(data.notice);
        navigate("/my-society/notices");
      } else {
        alert("Failed to upload notice.");
      }
    } catch (err) {
      console.error("❌ Error posting notice:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Server error while posting notice.");
    } finally {
      setLoading(false);
    }
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
          <TextField
            label="Notice Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            fullWidth
          />

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

          <Button variant="contained" type="submit" size="large" disabled={loading}>
            {loading ? "Uploading..." : "Upload Notice"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UploadNoticePage;
