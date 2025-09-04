import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  } from '@mui/material';

import {
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccessTime as AccessTimeIcon,
  FitnessCenter as FitnessCenterIcon
} from '@mui/icons-material';

const ContributorRequestsManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: null,
    action: null,
    userName: ''
  });

  useEffect(() => {
    fetchContributorRequests();
  }, []);

  const fetchContributorRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/contributor-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data);
      } else {
        setError('Failed to fetch contributor requests');
      }
    } catch (error) {
      setError('Error fetching contributor requests');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (userId, action) => {
    setProcessing(userId);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/contributor-requests/${userId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Contributor request ${action}d successfully`);
        // Remove the processed request from the list
        setRequests(prev => prev.filter(req => req._id !== userId));
        setConfirmDialog({ open: false, userId: null, action: null, userName: '' });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(`Failed to ${action} contributor request`);
      console.error('Error:', error);
    } finally {
      setProcessing(null);
    }
  };

  const openConfirmDialog = (userId, action, userName) => {
    setConfirmDialog({
      open: true,
      userId,
      action,
      userName
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      userId: null,
      action: null,
      userName: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityLevelColor = (level) => {
    if (level >= 5) return 'success';
    if (level >= 2) return 'warning';
    return 'default';
  };

  const getActivityLevelText = (level) => {
    if (level >= 5) return 'Very Active';
    if (level >= 2) return 'Moderately Active';
    if (level >= 1) return 'Low Activity';
    return 'No Activity';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Contributor Requests
          </Typography>
          <Chip 
            label={requests.length} 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }}
          />
        </Box>

        <Typography variant="body2" color="textSecondary" mb={3}>
          Review and approve user requests to become content contributors.
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

        {requests.length === 0 ? (
          <Box textAlign="center" py={4}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No Pending Requests
            </Typography>
            <Typography variant="body2" color="textSecondary">
              All contributor requests have been processed.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {request.firstName} {request.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2">
                          {request.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2">
                          {request.lastLogin ? formatDate(request.lastLogin) : 'Never'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<FitnessCenterIcon />}
                        label={getActivityLevelText(request.activityLevel)}
                        color={getActivityLevelColor(request.activityLevel)}
                        size="small"
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {request.activityLevel} goals created
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="Approve Request">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => openConfirmDialog(
                              request._id, 
                              'approve', 
                              `${request.firstName} ${request.lastName}`
                            )}
                            disabled={processing === request._id}
                          >
                            {processing === request._id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deny Request">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => openConfirmDialog(
                              request._id, 
                              'deny', 
                              `${request.firstName} ${request.lastName}`
                            )}
                            disabled={processing === request._id}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={closeConfirmDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {confirmDialog.action === 'approve' ? 'Approve' : 'Deny'} Contributor Request
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" mb={2}>
              Are you sure you want to {confirmDialog.action} the contributor request from{' '}
              <strong>{confirmDialog.userName}</strong>?
            </Typography>
            
            {confirmDialog.action === 'approve' ? (
              <Alert severity="info">
                This user will be granted contributor privileges and can create/edit exercises, 
                workouts, and programs.
              </Alert>
            ) : (
              <Alert severity="warning">
                This request will be denied and removed from the pending list. The user can 
                submit a new request later.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => handleRequestAction(confirmDialog.userId, confirmDialog.action)}
              color={confirmDialog.action === 'approve' ? 'success' : 'error'}
              variant="contained"
              disabled={processing === confirmDialog.userId}
            >
              {processing === confirmDialog.userId ? (
                <CircularProgress size={20} />
              ) : (
                confirmDialog.action === 'approve' ? 'Approve' : 'Deny'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ContributorRequestsManager;
