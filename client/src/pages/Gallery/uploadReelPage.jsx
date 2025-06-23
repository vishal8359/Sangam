import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Stack, Avatar, Chip, useTheme
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";

const UploadReelPage = () => {
  const theme = useTheme();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleSubmit = () => {
    // TODO: Upload to server
    setTimeout(() => navigate("/gallery"), 300);
    console.log("Uploading Reel", file, tags);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3, bgcolor: theme.palette.background.paper, borderRadius: 2 }}>
      <Typography variant="h5" mb={3} fontWeight="bold">Upload a Reel</Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Avatar src="/user_photo.jpg" />
        <Box>
          <Typography variant="subtitle1">Vishal Gupta</Typography>
          <Typography variant="body2" color="text.secondary">Sangam Society, Ghaziabad</Typography>
        </Box>
      </Stack>

      <TextField fullWidth label="Description" multiline rows={3} margin="normal" />
      <Stack direction="row" spacing={1} mb={2}>
        <TextField
          size="small"
          label="Tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTagAdd()}
        />
        <Button onClick={handleTagAdd}>Add</Button>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
        {tags.map((tag, i) => <Chip key={i} label={tag} onDelete={() => setTags(tags.filter(t => t !== tag))} />)}
      </Stack>

      <Button
        variant="contained"
        startIcon={<UploadFileIcon />}
        component="label"
        fullWidth
      >
        Select Reel
        <input hidden type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
      </Button>

      <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        disabled={!file}
      >
        Upload Reel
      </Button>
    </Box>
  );
};

export default UploadReelPage;
