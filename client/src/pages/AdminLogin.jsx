// AdminLogin.jsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const AdminLogin = () => {
  const theme = useTheme();
  const [adminData, setAdminData] = useState({
    name: '',
    house: '',
    contact: '',
    email: '',
    password: '',
    societyId: '',
    adminId: '',
  });
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const newSocietyId = uuidv4().split('-')[0];
    const newAdminId = uuidv4().split('-')[0];

    const updatedAdmin = {
      ...adminData,
      societyId: newSocietyId,
      adminId: newAdminId,
    };

    setAdminData(updatedAdmin);
    setRegistered(true);

    // Here you can send the updatedAdmin to the backend
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor={theme.palette.background.default}
      p={3}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 500 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          color={theme.palette.primary.main}
          textAlign="center"
          gutterBottom
        >
          🏢 Admin Society Registration
        </Typography>

        {!registered ? (
          <>
            <TextField
              label="Full Name"
              name="name"
              fullWidth
              value={adminData.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="House Number"
              name="house"
              fullWidth
              value={adminData.house}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Contact Number"
              name="contact"
              fullWidth
              value={adminData.contact}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email (Optional)"
              name="email"
              fullWidth
              value={adminData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              fullWidth
              value={adminData.password}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <Button variant="contained" fullWidth onClick={handleSubmit}>
              Generate Society
            </Button>
          </>
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              ✅ Society Created Successfully!
            </Typography>
            <Typography>
              <strong>Society ID:</strong> {adminData.societyId}
            </Typography>
            <Typography>
              <strong>Admin ID:</strong> {adminData.adminId}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminLogin;