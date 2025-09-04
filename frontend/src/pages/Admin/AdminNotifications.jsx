import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import AdminNotificationsManager from '../../components/Admin/AdminNotificationsManager';

const AdminNotifications = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notifications
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage system notifications and alerts
        </Typography>
      </Box>
      
      <AdminNotificationsManager />
    </Container>
  );
};

export default AdminNotifications;
