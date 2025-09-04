import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse
} from '@mui/material';
import {
  PersonAdd,
  CheckCircle,
  Schedule,
  FitnessCenter,
  Create,
  Groups,
  ExpandMore,
  ExpandLess,
  Star
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../utils/api';

const ContributorRequestCard = () => {
  const { user } = useAuth();
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applicationText, setApplicationText] = useState('');
  const [showBenefits, setShowBenefits] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkRequestStatus();
  }, [user]);

  const checkRequestStatus = () => {
    if (user?.isContributor) {
      setRequestStatus('approved');
    } else if (user?.contributorRequestPending) {
      setRequestStatus('pending');
    } else {
      setRequestStatus('none');
    }
  };

  const handleRequestContributor = async () => {
    if (!applicationText.trim()) {
      setError('Please provide a reason for your contributor request');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/${user._id}/request-contributor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          applicationText: applicationText.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contributor request submitted successfully! You will be notified once reviewed.');
        setRequestStatus('pending');
        setDialogOpen(false);
        setApplicationText('');
        // Update user context if needed
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Failed to submit contributor request');
      }
    } catch (error) {
      console.error('Error submitting contributor request:', error);
      setError('An error occurred while submitting your request');
    } finally {
      setLoading(false);
    }
  };

  const contributorBenefits = [
    { icon: <Create />, text: 'Create and edit workout exercises' },
    { icon: <FitnessCenter />, text: 'Design custom workout programs' },
    { icon: <Groups />, text: 'Help the MeFit community grow' },
    { icon: <Star />, text: 'Get recognized as a fitness expert' }
  ];

  if (requestStatus === 'approved') {
    return (
      <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircle sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                You're a Contributor!
              </Typography>
              <Typography variant="body2">
                You have contributor privileges and can create content for the MeFit community.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (requestStatus === 'pending') {
    return (
      <Card sx={{ mb: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Schedule sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Request Pending
              </Typography>
              <Typography variant="body2">
                Your contributor request is being reviewed by our admin team. You'll be notified once a decision is made.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <PersonAdd color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Become a Contributor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share your fitness expertise with the MeFit community
              </Typography>
            </Box>
          </Box>

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

          <Box mb={2}>
            <Button
              variant="text"
              onClick={() => setShowBenefits(!showBenefits)}
              endIcon={showBenefits ? <ExpandLess /> : <ExpandMore />}
              sx={{ mb: 1 }}
            >
              What can contributors do?
            </Button>
            <Collapse in={showBenefits}>
              <List dense>
                {contributorBenefits.map((benefit, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {benefit.icon}
                    </ListItemIcon>
                    <ListItemText primary={benefit.text} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
            startIcon={<PersonAdd />}
            disabled={loading}
            fullWidth
          >
            Request Contributor Access
          </Button>
        </CardContent>
      </Card>

      {/* Application Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => !loading && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <PersonAdd color="primary" />
            <Typography variant="h6">
              Request Contributor Access
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Tell us why you'd like to become a contributor. Share your fitness background, 
            experience, and how you plan to help the MeFit community.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Why do you want to become a contributor?"
            placeholder="Share your fitness expertise, experience, and how you plan to contribute to the MeFit community..."
            value={applicationText}
            onChange={(e) => setApplicationText(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Minimum 50 characters required. Our team will review your application within 2-3 business days.
          </Typography>

          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRequestContributor}
            variant="contained"
            disabled={loading || applicationText.trim().length < 50}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContributorRequestCard;
