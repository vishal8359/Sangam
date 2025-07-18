import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import sangamLogo from '/appLogo.png';
import { useAppContext } from '../context/AppContext';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Slide,
} from '@mui/material';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

export default function HomePage() {
  const { navigate } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={700}>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(to bottom right, #1a202c, #2d3748)'
            : 'linear-gradient(to bottom right, #e3f2fd, #f5f5f5)',
        }}
      >
        <Box
          className="absolute top-0 left-0 w-72 h-72 rounded-full filter blur-3xl animate-pulse"
          sx={{
            bgcolor: theme.palette.secondary.light,
            opacity: 0.3,
            zIndex: 0,
            animation: 'pulse 4s infinite alternate',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '100%': { transform: 'scale(1.1)' },
            },
          }}
        />
        <Box
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full filter blur-3xl animate-ping"
          sx={{
            bgcolor: theme.palette.primary.light,
            opacity: 0.3,
            zIndex: 0,
            animation: 'ping 5s infinite alternate',
            '@keyframes ping': {
              '0%': { transform: 'scale(1)' },
              '100%': { transform: 'scale(1.2)' },
            },
          }}
        />

        <MotionPaper
          elevation={isMobile ? 0 : 10}
          variants={itemVariants}
          sx={{
            position: 'relative',
            zIndex: 10,
            p: isMobile ? 4 : 6,
            borderRadius: theme.shape.borderRadius * 3,
            boxShadow: theme.shadows[10],
            width: '100%',
            maxWidth: 450,
            textAlign: 'center',
            bgcolor: isDark ? theme.palette.background.paper : theme.palette.common.white,
            color: theme.palette.text.primary,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: theme.shadows[12],
            },
          }}
        >
          <MotionBox variants={itemVariants}>
            <Box
              component="img"
              src={sangamLogo}
              alt="Sangam Logo"
              sx={{
                mx: 'auto',
                mb: 4,
                height: 100,
                width: 100,
                objectFit: 'contain',
                filter: isDark ? 'invert(1)' : 'none',
              }}
            />
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              fontWeight={700}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: isDark ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
              }}
              mb={2}
            >
              Welcome to Sangam App
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={isMobile ? 4 : 6} fontStyle="italic">
              Your gateway to efficient community management
            </Typography>
          </MotionBox>

          <Box sx={{ spaceY: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MotionButton
              onClick={() => navigate('/resident-login')}
              variant="contained"
              color="primary"
              sx={{
                width: '100%',
                py: 1.5,
                px: 4,
                borderRadius: theme.shape.borderRadius * 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: theme.shadows[6],
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                },
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
            >
              Residents Login
            </MotionButton>
            <MotionButton
              onClick={() => navigate('/admin-login')}
              variant="contained"
              color="secondary"
              sx={{
                width: '100%',
                py: 1.5,
                px: 4,
                borderRadius: theme.shape.borderRadius * 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: theme.shadows[6],
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                },
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
            >
              Admin Login
            </MotionButton>
            <MotionButton
              onClick={() => navigate('/create-society')}
              variant="outlined"
              color="primary"
              sx={{
                width: '100%',
                py: 1.5,
                px: 4,
                borderRadius: theme.shape.borderRadius * 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: theme.shadows[3],
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[6],
                },
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
            >
              Create New Society
            </MotionButton>
          </Box>
        </MotionPaper>
      </MotionBox>
    </Slide>
  );
}
