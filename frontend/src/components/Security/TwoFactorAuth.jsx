import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import {
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';

const TwoFactorAuth = () => {
  const [twoFactorStatus, setTwoFactorStatus] = useState({
    enabled: false,
    setupInProgress: false
  });
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Setup states
  const [activeStep, setActiveStep] = useState(0);
  const [setupData, setSetupData] = useState({
    secret: '',
    qrCode: '',
    manualEntryKey: ''
  });
  const [verificationToken, setVerificationToken] = useState('');
  
  // Disable states
  const [disableData, setDisableData] = useState({
    password: '',
    token: ''
  });

  const steps = ['Generate Secret', 'Scan QR Code', 'Verify Token'];

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/2fa/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTwoFactorStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  const handleSetupStart = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSetupData(data.data);
        setSetupOpen(true);
        setActiveStep(0);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to setup 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      setError('Please enter a valid 6-digit token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationToken })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('2FA has been successfully enabled!');
        setSetupOpen(false);
        setActiveStep(0);
        setVerificationToken('');
        fetchTwoFactorStatus();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to verify token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disableData.password || !disableData.token) {
      setError('Please provide both password and 2FA token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(disableData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('2FA has been successfully disabled!');
        setDisableOpen(false);
        setDisableData({ password: '', token: '' });
        fetchTwoFactorStatus();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to disable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box textAlign="center" py={2}>
            <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Two-Factor Authentication Setup
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={3}>
              We'll generate a unique secret key for your account
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Make sure you have an authenticator app installed on your phone (Google Authenticator, Authy, etc.)
            </Alert>
          </Box>
        );
      
      case 1:
        return (
          <Box textAlign="center" py={2}>
            <QrCodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Scan QR Code
            </Typography>
            {setupData.qrCode && (
              <Box mb={2}>
                <img 
                  src={setupData.qrCode} 
                  alt="2FA QR Code"
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              </Box>
            )}
            <Alert severity="info" sx={{ mb: 2 }}>
              Scan this QR code with your authenticator app
            </Alert>
            <Typography variant="body2" color="textSecondary" mb={1}>
              Can't scan? Enter this key manually:
            </Typography>
            <Chip 
              label={setupData.manualEntryKey} 
              variant="outlined" 
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        );
      
      case 2:
        return (
          <Box py={2}>
            <Typography variant="h6" gutterBottom textAlign="center">
              Verify Setup
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={3} textAlign="center">
              Enter the 6-digit code from your authenticator app
            </Typography>
            <TextField
              fullWidth
              label="2FA Token"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputProps={{ 
                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' },
                maxLength: 6
              }}
              helperText="Enter the 6-digit code from your authenticator app"
            />
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Two-Factor Authentication
          </Typography>
          {twoFactorStatus.enabled && (
            <Chip 
              icon={<CheckCircleIcon />}
              label="Enabled" 
              color="success" 
              size="small" 
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Typography variant="body2" color="textSecondary" mb={3}>
          Add an extra layer of security to your account with two-factor authentication.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box display="flex" gap={2}>
          {!twoFactorStatus.enabled ? (
            <Button
              variant="contained"
              startIcon={<SecurityIcon />}
              onClick={handleSetupStart}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Enable 2FA'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              startIcon={<WarningIcon />}
              onClick={() => setDisableOpen(true)}
              disabled={loading}
            >
              Disable 2FA
            </Button>
          )}
        </Box>

        {/* Setup Dialog */}
        <Dialog 
          open={setupOpen} 
          onClose={() => setSetupOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Enable Two-Factor Authentication
          </DialogTitle>
          <DialogContent>
            <Box mb={3}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {renderStepContent(activeStep)}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSetupOpen(false)} disabled={loading}>
              Cancel
            </Button>
            {activeStep > 0 && (
              <Button onClick={handleBack} disabled={loading}>
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button onClick={handleNext} variant="contained">
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleVerifyToken} 
                variant="contained"
                disabled={loading || verificationToken.length !== 6}
              >
                {loading ? <CircularProgress size={20} /> : 'Enable 2FA'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Disable Dialog */}
        <Dialog 
          open={disableOpen} 
          onClose={() => setDisableOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Disable Two-Factor Authentication
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Disabling 2FA will make your account less secure. Please confirm by entering your password and current 2FA token.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  value={disableData.password}
                  onChange={(e) => setDisableData(prev => ({ ...prev, password: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="2FA Token"
                  value={disableData.token}
                  onChange={(e) => setDisableData(prev => ({ ...prev, token: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  placeholder="000000"
                  inputProps={{ maxLength: 6 }}
                  helperText="Enter the current 6-digit code from your authenticator app"
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDisableOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleDisable2FA} 
              color="error"
              variant="contained"
              disabled={loading || !disableData.password || disableData.token.length !== 6}
            >
              {loading ? <CircularProgress size={20} /> : 'Disable 2FA'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
