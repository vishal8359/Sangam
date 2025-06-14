import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';

const AdminLogin = () => {
  const { colors } = useAppContext();

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
    if (!adminData.name || !adminData.house || !adminData.contact || !adminData.password) {
      alert('Please fill all required fields.');
      return;
    }

    const newSocietyId = uuidv4().split('-')[0];
    const newAdminId = uuidv4().split('-')[0];

    const updatedAdmin = {
      ...adminData,
      societyId: newSocietyId,
      adminId: newAdminId,
    };

    setAdminData(updatedAdmin);
    setRegistered(true);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor={colors.background}
      p={3}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          width: '100%',
          maxWidth: 500,
          backgroundColor: colors.background,
          color: colors.text,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ color: colors.primary }}
          textAlign="center"
          gutterBottom
        >
          🏢 Admin Society Registration
        </Typography>

        {!registered ? (
          <>
            {[
              { label: 'Full Name', name: 'name' },
              { label: 'House Number', name: 'house' },
              { label: 'Contact Number', name: 'contact' },
              { label: 'Email (Optional)', name: 'email' },
              { label: 'Password', name: 'password', type: 'password' },
            ].map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type || 'text'}
                fullWidth
                value={adminData[field.name]}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: colors.text } }}
                InputProps={{ style: { color: colors.text } }}
              />
            ))}

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
