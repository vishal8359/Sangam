// Box.jsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const WhiteBox = ({ name, materialIcon, children }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        backgroundColor: isDark ? '#fff' : '#f9f9f9',
        color: isDark ? '#000' : '#111',
        borderRadius: 2,
        p: 2,
        boxShadow: isDark ? 4 : 1,
        minWidth: 250,
        maxWidth: 400,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {materialIcon}
        <Typography variant="h6" component="span" sx={{ ml: 1 }}>
          {name}
        </Typography>
      </Box>
      {children && (
        <Box sx={{ mt: 1 }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default WhiteBox;
