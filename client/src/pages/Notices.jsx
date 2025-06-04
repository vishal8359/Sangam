import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  useTheme,
  Stack,
} from '@mui/material';

const notices = [
  {
    id: 1,
    title: 'Water Supply Interruption',
    date: 'June 5, 2025',
    content: 'Due to maintenance work, water supply will be disrupted from 10 AM to 4 PM.',
  },
  {
    id: 2,
    title: 'Fire Drill Announcement',
    date: 'June 6, 2025',
    content: 'A mandatory fire drill will be conducted at 11 AM. All residents must participate.',
  },
  {
    id: 3,
    title: 'Maintenance Bill Due',
    date: 'June 10, 2025',
    content: 'Please clear your maintenance dues for Q2 before June 10 to avoid late fees.',
  },
];

const NoticePage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box px={{ xs: 2, md: 5 }} py={4}>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={4}
        color={isDark ? '#ccc' : '#333'}
        textAlign="center"
      >
        📢 Society Notices
      </Typography>

      <Stack spacing={3}>
        {notices.map((notice) => (
          <Card
            key={notice.id}
            sx={{
              backgroundColor: '#fff',
              color: '#000',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              px: 2,
              py: 2,
              '&:hover': {
                transform: 'scale(1.01)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {notice.title}
              </Typography>
              <Typography
                variant="body2"
                color={isDark ? 'text.secondary' : 'text.primary'}
                gutterBottom
              >
                {notice.content}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                🗓 {notice.date}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default NoticePage;
