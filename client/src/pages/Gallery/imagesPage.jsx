import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Stack,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";

const ImagesGalleryPage = () => {
  const { galleryImages, societyId } = useAppContext();
  const filteredImages = galleryImages.filter(
    (img) => img.societyId === societyId
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Society Images
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Only visible to residents of your society.
      </Typography>

      {filteredImages.length === 0 ? (
        <Typography>No images uploaded yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredImages.map((img) => (
            <Grid item xs={6} sm={6} md={4} key={img.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={img.src}
                  alt="Uploaded"
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  {/* Uploader Info */}
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Avatar
                      src={img.uploadedBy?.avatar}
                      alt={img.uploadedBy?.name}
                      sx={{ width: 30, height: 30 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">
                        {img.uploadedBy?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(img.uploadedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Description */}
                  {img.description && (
                    <Typography variant="body2" color="text.secondary">
                      {img.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImagesGalleryPage;
