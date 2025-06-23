import React from "react";
import { Box, Typography } from "@mui/material";

const ImagesGalleryPage = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Society Images
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Only visible to residents of the same society.
      </Typography>
      {/* TODO: Render uploaded images here */}
    </Box>
  );
};

export default ImagesGalleryPage;
