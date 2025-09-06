import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Divider,
  Alert,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const AdminContributorRequestCard = ({ request, onApprove, onReject }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleAction = (actionType) => {
    setAction(actionType);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (action === 'approve') {
        await onApprove(request._id);
      } else {
        await onReject(request._id);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setLoading(false);
    }
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

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <>
      <Card sx={{ mb: 2, position: 'relative', overflow: 'visible' }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* User Info Section */}
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  {getInitials(request.firstName, request.lastName)}
                </Avatar>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="h6">
                      {request.firstName} {request.lastName}
                    </Typography>
                    <Tooltip title="View full details">
                      <IconButton 
                        size="small" 
                        onClick={() => setDetailsOpen(true)}
                        sx={{ ml: 1 }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {request.email}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="textSecondary">
                      {getTimeAgo(request.contributorRequestDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Status and Actions Section */}
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                <Chip 
                  label="Pending Review" 
                  color="warning" 
                  variant="outlined"
                  size="small"
                />
                
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleAction('reject')}
                    size="small"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAction('approve')}
                    size="small"
                  >
                    Approve
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Application Preview */}
          <Box>
            <Typography variant="subtitle2" gutterBottom color="primary">
              Application Message:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                bgcolor: 'grey.50', 
                p: 2, 
                borderRadius: 1,
                fontStyle: 'italic',
                border: '1px solid',
                borderColor: 'grey.200',
                maxHeight: '4em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}
            >
              "{request.contributorApplicationText}"
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {action === 'approve' ? 'Approve Contributor Request' : 'Reject Contributor Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {action === 'approve' ? (
              <>
                Are you sure you want to approve <strong>{request.firstName} {request.lastName}</strong> as a contributor?
                <br /><br />
                This will give them permission to:
                <ul>
                  <li>Create and edit exercises</li>
                  <li>Create and edit workouts</li>
                  <li>Create and edit fitness programs</li>
                  <li>Access contributor dashboard features</li>
                </ul>
              </>
            ) : (
              <>
                Are you sure you want to reject the contributor request from <strong>{request.firstName} {request.lastName}</strong>?
                <br /><br />
                This action will remove their pending status. They can submit a new request in the future.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            variant="contained"
            color={action === 'approve' ? 'success' : 'error'}
            disabled={loading}
            autoFocus
          >
            {loading ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {getInitials(request.firstName, request.lastName)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {request.firstName} {request.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Contributor Request Details
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Contact Information:
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Email:</strong> {request.email}
            </Typography>
            <Typography variant="body2">
              <strong>Submitted:</strong> {formatDate(request.contributorRequestDate)}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Full Application Message:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                bgcolor: 'grey.50', 
                p: 3, 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}
            >
              {request.contributorApplicationText}
            </Typography>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Review Guidelines:</strong> Look for fitness expertise, clear communication, 
              and genuine interest in helping the community. Contributors should demonstrate knowledge 
              and commitment to quality content creation.
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          <Button 
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => {
              setDetailsOpen(false);
              handleAction('reject');
            }}
          >
            Reject
          </Button>
          <Button 
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => {
              setDetailsOpen(false);
              handleAction('approve');
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminContributorRequestCard;
