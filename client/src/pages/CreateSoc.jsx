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

const CreateSociety = () => {
  const { colors, login } = useAppContext();

  const [formData, setFormData] = useState({
    name: '',
    house: '',
    contact: '',
    email: '',
    password: '',
  });

  const [createdDetails, setCreatedDetails] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    const { name, house, contact, password } = formData;

    if (!name || !house || !contact || !password) {
      alert('Please fill all required fields.');
      return;
    }

    const generatedUserId = uuidv4().split('-')[0];
    const generatedSocietyId = uuidv4().split('-')[0];

    const newAdmin = {
      userId: generatedUserId,
      societyId: generatedSocietyId,
      userRole: 'admin',
      houseId: house,
      userProfile: {
        name: formData.name,
        contact: formData.contact,
        email: formData.email,
      },
    };

    // Save in global context
    login(newAdmin);

    // Simulate sending SMS
    console.log(`📲 SMS sent to admin:
User ID: ${generatedUserId}
Password: ${password}
Society ID: ${generatedSocietyId}`);

    setCreatedDetails({
      societyId: generatedSocietyId,
      userId: generatedUserId,
      password,
    });
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
          🏢 Create New Society
        </Typography>

        {!createdDetails ? (
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
                value={formData[field.name]}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: colors.text } }}
                InputProps={{ style: { color: colors.text } }}
              />
            ))}

            <Button variant="contained" fullWidth onClick={handleSubmit}>
              Create Society
            </Button>
          </>
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              ✅ Society Created Successfully!
            </Typography>
            <Typography>
              <strong>Society ID:</strong> {createdDetails.societyId}
            </Typography>
            <Typography>
              <strong>Admin User ID:</strong> {createdDetails.userId}
            </Typography>
            <Typography>
              <strong>Password:</strong> {createdDetails.password}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CreateSociety;
