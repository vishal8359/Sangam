import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function SocietyGalleryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fileInputRef = useRef(null);

  // Store uploaded media as array of objects { id, type: "image"|"video", url }
  const [mediaFiles, setMediaFiles] = useState([]);

  // Handle file upload
  const handleFilesUpload = (event) => {
    const files = event.target.files;
    if (!files) return;

    const newMedia = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith("video") ? "video" : "image";
      const url = URL.createObjectURL(file);
      newMedia.push({
        id: Date.now() + i,
        type,
        url,
        name: file.name,
      });
    }

    setMediaFiles((prev) => [...prev, ...newMedia]);
    // Reset input so same file can be uploaded again if needed
    event.target.value = null;
  };

  // Delete media by id
  const handleDelete = (id) => {
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 4,
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={3} align="center">
        Society Gallery
      </Typography>

      <Box textAlign="center" mb={3}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFilesUpload}
          style={{ display: "none" }}
        />
        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current.click()}
          size={isMobile ? "medium" : "large"}
        >
          Upload Images/Videos
        </Button>
      </Box>

      {mediaFiles.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          No media uploaded yet. Use the button above to add images or videos.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {mediaFiles.map((media) => (
            <Grid
              item
              key={media.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                elevation={3}
              >
                {media.type === "image" ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={media.url}
                    alt={media.name}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <CardMedia
                    component="video"
                    height="180"
                    controls
                    src={media.url}
                    title={media.name}
                    sx={{ backgroundColor: "black" }}
                  />
                )}
                <CardActions
                  sx={{
                    justifyContent: "space-between",
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ maxWidth: "80%" }}
                    title={media.name}
                  >
                    {media.name}
                  </Typography>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDelete(media.id)}
                    aria-label="delete media"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
