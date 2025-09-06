import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Alert, Button, LinearProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import EnhancedDashboard from '../../components/Common/EnhancedDashboard.jsx';
import { Security, Person, EmojiEvents } from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserComplianceStatus();
  }, []);

  const checkUserComplianceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if user has profile - SRS FE-11 requirement
      const profileResponse = await fetch('/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Check 2FA status - SRS SEC-01 requirement
      const twoFactorResponse = await fetch('/user/2fa/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const profile = profileResponse.ok ? await profileResponse.json() : null;
      const twoFactorStatus = twoFactorResponse.ok ? await twoFactorResponse.json() : { enabled: false };
      
      setProfileStatus({
        hasProfile: !!profile,
        has2FA: twoFactorStatus.enabled,
        profile: profile
      });
    } catch (error) {
      console.error('Error checking compliance status:', error);
      setProfileStatus({
        hasProfile: false,
        has2FA: false,
        profile: null
      });
    } finally {
      setLoading(false);
    }
  };

  // SRS FE-11: User must have profile to use system
  const handleCreateProfile = () => {
    navigate('/app/profile/create');
  };

  // SRS SEC-01: 2FA should be enforced
  const handleSetup2FA = () => {
    navigate('/app/profile/settings');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Checking system requirements...</Typography>
      </Box>
    );
  }

  // SRS Compliance Check: Block dashboard access if requirements not met
  if (!profileStatus?.hasProfile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Profile Required - SRS Compliance
          </Typography>
          <Typography variant="body1" gutterBottom>
            According to SRS requirement FE-11, a user must have a profile to use the system. 
            Please create your profile to continue.
          </Typography>
        </Alert>
        
        <Card sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <Person sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Create Your Fitness Profile
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Set up your fitness profile with personal details and fitness evaluation to get started with MeFit.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleCreateProfile}
              startIcon={<Person />}
            >
              Create Profile Now
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!profileStatus?.has2FA) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Two-Factor Authentication Required - SRS Compliance
          </Typography>
          <Typography variant="body1" gutterBottom>
            According to SRS requirement SEC-01, 2FA should be enforced. 
            Please set up two-factor authentication to continue using the system.
          </Typography>
        </Alert>
        
        <Card sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <Security sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Security Setup Required
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              MeFit requires two-factor authentication for enhanced security. This helps protect your fitness data and personal information.
            </Typography>
            <Button 
              variant="contained" 
              color="error"
              size="large" 
              onClick={handleSetup2FA}
              startIcon={<Security />}
            >
              Set Up 2FA Now
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* SRS FE-03: Goal Dashboard with large progress component */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEvents sx={{ mr: 2, color: 'primary.main' }} />
          Welcome back, {user?.firstName || user?.username}!
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Track your weekly fitness goals and monitor your progress
        </Typography>
      </Box>
      
      {/* Enhanced Dashboard Component - SRS Compliant */}
      <EnhancedDashboard />
    </Box>
  );
};

export default Dashboard;
