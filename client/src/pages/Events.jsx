import React from 'react';
import {
  Box,
  Grid,
  Typography,
  useTheme,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button
} from '@mui/material';

const events = [
  {
    id: 1,
    title: 'Diwali Celebration',
    description: 'Join us for lights, sweets, and fun on the central lawn.',
    image: '/images/diwali.jpg',
    date: 'November 10, 2025',
  },
  {
    id: 2,
    title: 'Yoga Workshop',
    description: 'Free yoga workshop with certified instructors.',
    image: '/images/yoga.jpg',
    date: 'October 2, 2025',
  },
  {
    id: 3,
    title: 'Annual Cultural Fest',
    description: 'Dance, drama, music, food and much more!',
    image: '/images/cultural.jpg',
    date: 'December 18, 2025',
  },
];

const EventPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box px={{ xs: 2, md: 5 }} py={4}>
      <Typography
        variant="h4"
        fontWeight="bold"
        color={isDark ? '#ccc' : '#333'}
        mb={4}
        textAlign="center"
      >
        📅 Upcoming Sangam Society Events
      </Typography>

      <Grid container spacing={4}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: '#fff',
                color: '#000',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={event.image}
                alt={event.title}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {event.title}
                </Typography>
                <Typography variant="body2" mb={1}>
                  {event.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  📆 {event.date}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">Know More</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EventPage;
