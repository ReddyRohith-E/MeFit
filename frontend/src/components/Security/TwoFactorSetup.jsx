import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton,
  Divider
} from '@mui/material';
import {
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
  Smartphone as SmartphoneIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ContentCopy as ContentCopyIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const TwoFactorSetup = ({ user, onComplete, onCancel }) => {
  const { updateUserData } = useAuth();
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/2fa/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setTwoFactorStatus(data);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const setupTwoFactor = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.data.qrCode);
        setSecret(data.data.secret);
        setStep(2);
      } else {
        setError(data.message || 'Failed to setup 2FA');
      }
    } catch (error) {
      setError('Failed to setup 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ token: verificationCode })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Two-factor authentication enabled successfully!');
        setStep(3);
        updateUserData({ twoFactorEnabled: true });
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Secret key copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setError('');
  };

  if (twoFactorStatus?.enabled) {
    return <TwoFactorDisable onComplete={onComplete} loading={loading} error={error} />;
  }

  const steps = [
    {
      label: 'Get Started',
      content: (
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <SecurityIcon color="primary" sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Enable Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add an extra layer of security to your account
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            Two-factor authentication adds an extra layer of security to your account. 
            You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Protects your account even if your password is compromised" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Works offline with your authenticator app" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Industry-standard security practice" />
            </ListItem>
          </List>

          <Box display="flex" gap={2} mt={3}>
            <Button
              variant="contained"
              onClick={setupTwoFactor}
              disabled={loading}
              startIcon={<SecurityIcon />}
            >
              {loading ? 'Setting up...' : 'Start Setup'}
            </Button>
            <Button variant="outlined" onClick={onCancel}>
              Maybe Later
            </Button>
          </Box>
        </Box>
      )
    },
    {
      label: 'Scan QR Code',
      content: (
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <SmartphoneIcon color="primary" sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Scan QR Code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use your authenticator app to scan the code below
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            Open your authenticator app and scan this QR code, or enter the code manually.
          </Typography>

          {qrCode && (
            <Box display="flex" justifyContent="center" mb={3}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <img 
                  src={qrCode} 
                  alt="2FA QR Code" 
                  style={{ maxWidth: '200px', width: '100%' }}
                />
              </Paper>
            </Box>
          )}
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Can't scan? Enter this code manually:</strong>
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace', 
                  bgcolor: 'grey.100', 
                  p: 1, 
                  borderRadius: 1,
                  wordBreak: 'break-all',
                  flex: 1
                }}
              >
                {secret}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => copyToClipboard(secret)}
                title="Copy to clipboard"
              >
                <ContentCopyIcon />
              </IconButton>
            </Box>
          </Alert>

          <Typography variant="h6" gutterBottom>
            Enter the 6-digit code from your app:
          </Typography>
          <TextField
            fullWidth
            value={verificationCode}
            onChange={handleCodeChange}
            placeholder="123456"
            inputProps={{ 
              maxLength: 6,
              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
            }}
            sx={{ mb: 3 }}
          />
          
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={verifyAndEnable}
              disabled={loading || verificationCode.length !== 6}
              startIcon={<CheckCircleIcon />}
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
            <Button variant="outlined" onClick={() => setStep(1)}>
              Back
            </Button>
          </Box>
        </Box>
      )
    },
    {
      label: 'Complete',
      content: (
        <Box textAlign="center">
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="success.main">
            Two-Factor Authentication Enabled!
          </Typography>
          <Typography variant="body1" paragraph>
            Your account is now protected with two-factor authentication. 
            You'll need to enter a code from your authenticator app when logging in.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Important:</strong> Save your backup codes in a secure location 
              in case you lose access to your authenticator app.
            </Typography>
          </Alert>

          <Button variant="contained" onClick={onComplete} size="large">
            Done
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Card>
      <CardContent>
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

        <Stepper activeStep={step - 1} orientation="vertical">
          {steps.map((stepData, index) => (
            <Step key={stepData.label}>
              <StepLabel>{stepData.label}</StepLabel>
              <StepContent>
                {stepData.content}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

const TwoFactorDisable = ({ onComplete, loading, error }) => {
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const disableTwoFactor = async () => {
    setLocalLoading(true);
    setLocalError('');

    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          password, 
          token: twoFactorCode 
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (onComplete) onComplete();
      } else {
        setLocalError(data.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      setLocalError('Failed to disable 2FA. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setTwoFactorCode(value);
    setLocalError('');
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <WarningIcon color="warning" sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Disable Two-Factor Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will make your account less secure
            </Typography>
          </Box>
        </Box>

        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || localError}
          </Alert>
        )}

        {!showConfirm ? (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Warning:</strong> Disabling 2FA will make your account less secure.
              </Typography>
            </Alert>

            <List>
              <ListItem>
                <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                <ListItemText primary="Your account will be protected only by your password" />
              </ListItem>
              <ListItem>
                <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                <ListItemText primary="Increased risk if your password is compromised" />
              </ListItem>
              <ListItem>
                <ListItemIcon><SecurityIcon color="info" /></ListItemIcon>
                <ListItemText primary="You can re-enable 2FA at any time in your settings" />
              </ListItem>
            </List>

            <Button 
              variant="outlined"
              color="error"
              onClick={() => setShowConfirm(true)}
              sx={{ mt: 2 }}
            >
              Continue with Disable
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Disable
            </Typography>
            <Typography variant="body2" paragraph>
              Enter your password and current 2FA code to disable two-factor authentication.
            </Typography>

            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="2FA Code"
              value={twoFactorCode}
              onChange={handleCodeChange}
              placeholder="123456"
              inputProps={{ 
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.3rem' }
              }}
              sx={{ mb: 3 }}
            />

            <Box display="flex" gap={2}>
              <Button 
                variant="contained"
                color="error"
                onClick={disableTwoFactor}
                disabled={localLoading || loading || !password || twoFactorCode.length !== 6}
              >
                {(localLoading || loading) ? 'Disabling...' : 'Disable 2FA'}
              </Button>
              <Button 
                variant="outlined"
                onClick={() => setShowConfirm(false)}
                disabled={localLoading || loading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorSetup;
