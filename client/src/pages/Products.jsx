import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const productsFromSociety = [
  {
    id: 1,
    name: 'Wooden Chair',
    price: '₹800',
    image: 'https://source.unsplash.com/random/200x200?chair',
    description: 'Solid teakwood chair in excellent condition.',
  },
  {
    id: 2,
    name: 'Microwave Oven',
    price: '₹1200',
    image: 'https://source.unsplash.com/random/200x200?microwave',
    description: 'Hardly used, 20L capacity.',
  },
];

const productsFromNeighbours = [
  {
    id: 3,
    name: 'Study Table',
    price: '₹1500',
    image: 'https://source.unsplash.com/random/200x200?table',
    description: 'Spacious and durable study table.',
  },
  {
    id: 4,
    name: 'Refrigerator',
    price: '₹5000',
    image: 'https://source.unsplash.com/random/200x200?refrigerator',
    description: 'Double door fridge, 260L.',
  },
];

function ProductCard({ product }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        backgroundColor:
          theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
        color: theme.palette.text.primary,
        borderRadius: 2,
        boxShadow: 3,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)' },
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={product.image}
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {product.name}
        </Typography>
        <Typography variant="body2" mb={1}>
          {product.description}
        </Typography>
        <Typography variant="subtitle1" color="primary">
          {product.price}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ProductsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box p={isMobile ? 2 : 4}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Products from My Society
      </Typography>
      <Grid container spacing={3} mb={4}>
        {productsFromSociety.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight={700} mb={2}>
        Products from Neighbours
      </Typography>
      <Grid container spacing={3}>
        {productsFromNeighbours.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
