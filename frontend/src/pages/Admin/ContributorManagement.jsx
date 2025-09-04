import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Tabs,
  Tab,
  LinearProgress,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  People,
  PersonAdd,
  Check,
  Close,
  Search,
  FilterList,
  MoreVert,
  Visibility,
  Block,
  Star,
  AdminPanelSettings,
  TrendingUp,
  Assignment,
  FitnessCenter,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Notifications,
  NotificationsActive
} from '@mui/icons-material';
import { adminApiService, handleApiError } from '../../services/adminAPI';
import ContributorRequestsManager from '../../components/Admin/ContributorRequestsManager';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="between">
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="body2" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight={700} color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" mt={1}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp color="success" fontSize="small" />
                <Typography variant="caption" color="success.main" ml={0.5}>
                  {trend}% this month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56 }}>
            <Icon sx={{ fontSize: 28 }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// User Details Dialog Component
const UserDetailsDialog = ({ open, onClose, user, onApprove, onReject, onToggleRole }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action, ...args) => {
    setLoading(true);
    try {
      await action(...args);
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {user.firstName} {user.lastName}
            </Typography>
            <Box display="flex" gap={1} mt={0.5}>
              {user.isAdmin && <Chip label="Admin" size="small" color="error" />}
              {user.isContributor && <Chip label="Contributor" size="small" color="secondary" />}
              {user.contributorRequestPending && <Chip label="Pending Request" size="small" color="warning" />}
              {!user.isActive && <Chip label="Inactive" size="small" color="default" />}
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Contact Information
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              {user.lastLogin && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="textSecondary">
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Activity Statistics
              </Typography>
              {user.stats && (
                <>
                  <Box display="flex" justifyContent="between" mb={1}>
                    <Typography variant="body2">Total Goals:</Typography>
                    <Typography variant="body2" fontWeight={500}>{user.stats.totalGoals}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="between" mb={1}>
                    <Typography variant="body2">Completed Goals:</Typography>
                    <Typography variant="body2" fontWeight={500}>{user.stats.completedGoals}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="between">
                    <Typography variant="body2">Completion Rate:</Typography>
                    <Typography variant="body2" fontWeight={500}>{user.stats.completionRate}%</Typography>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
        
        {user.contributorRequestPending && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This user has requested contributor access. Review their activity before approving.
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
        
        {user.contributorRequestPending && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleAction(onReject, user._id)}
              disabled={loading}
              startIcon={<Close />}
            >
              Reject Request
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleAction(onApprove, user._id)}
              disabled={loading}
              startIcon={<Check />}
            >
              Approve as Contributor
            </Button>
          </>
        )}
        
        {user.isContributor && !user.isAdmin && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleAction(onToggleRole, user._id, { isAdmin: true, isContributor: true })}
            disabled={loading}
            startIcon={<AdminPanelSettings />}
          >
            Promote to Admin
          </Button>
        )}
        
        {loading && <CircularProgress size={24} />}
      </DialogActions>
    </Dialog>
  );
};

// Notification Component
const NotificationSnackbar = ({ open, message, severity, onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={6000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);

// Main Component
const ContributorManagement = () => {
  const [contributors, setContributors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalContributors: 0,
    pendingRequests: 0,
    activeContributors: 0,
    contributedContent: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersResponse, requestsResponse, statsResponse] = await Promise.all([
        adminApiService.users.getAll({ role: 'contributor' }),
        adminApiService.contributors.getRequests(),
        adminApiService.dashboard.getStats()
      ]);
      
      setContributors(usersResponse.data.users || []);
      setPendingRequests(requestsResponse.data || []);
      
      // Calculate stats
      const contributorCount = usersResponse.data.users?.filter(u => u.isContributor).length || 0;
      const pendingCount = requestsResponse.data?.length || 0;
      const activeCount = usersResponse.data.users?.filter(u => u.isContributor && u.isActive).length || 0;
      
      setStats({
        totalContributors: contributorCount,
        pendingRequests: pendingCount,
        activeContributors: activeCount,
        contributedContent: statsResponse.data?.data?.overview?.totalExercises || 0
      });
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleApproveRequest = async (userId) => {
    try {
      await adminApiService.contributors.approveRequest(userId, 'approve');
      showNotification('Contributor request approved successfully!');
      fetchData();
    } catch (err) {
      showNotification(handleApiError(err), 'error');
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await adminApiService.contributors.approveRequest(userId, 'deny');
      showNotification('Contributor request rejected');
      fetchData();
    } catch (err) {
      showNotification(handleApiError(err), 'error');
    }
  };

  const handleToggleUserRole = async (userId, roleData) => {
    try {
      await adminApiService.users.updateRole(userId, roleData);
      showNotification('User role updated successfully!');
      fetchData();
    } catch (err) {
      showNotification(handleApiError(err), 'error');
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const filteredData = () => {
    const data = tabValue === 0 ? contributors : pendingRequests;
    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];
    return safeData.filter(user => {
      const matchesSearch = 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || 
        (filterRole === 'admin' && user.isAdmin) ||
        (filterRole === 'contributor' && user.isContributor && !user.isAdmin);
      
      return matchesSearch && matchesRole;
    });
  };

  const UserTable = ({ users, showActions = true, emptyMessage = "No users found" }) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell>Status</TableCell>
            {showActions && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length > 0 ? users.map((user) => (
            <TableRow key={user._id} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    {user.stats && (
                      <Typography variant="caption" color="textSecondary">
                        {user.stats.totalGoals} goals • {user.stats.completionRate}% completion
                      </Typography>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  {user.isAdmin && <Chip label="Admin" size="small" color="error" />}
                  {user.isContributor && <Chip label="Contributor" size="small" color="secondary" />}
                  {user.contributorRequestPending && <Chip label="Pending" size="small" color="warning" />}
                </Box>
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Chip
                  label={user.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={user.isActive ? 'success' : 'default'}
                />
              </TableCell>
              {showActions && (
                <TableCell align="center">
                  <Box display="flex" gap={1} justifyContent="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(user)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    
                    {user.contributorRequestPending && (
                      <>
                        <Tooltip title="Approve Request">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveRequest(user._id)}
                          >
                            <Check />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject Request">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectRequest(user._id)}
                          >
                            <Close />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={showActions ? 6 : 5} align="center" sx={{ py: 4 }}>
                <Typography color="textSecondary">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Star color="secondary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Contributors & Requests
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Manage contributor access and review pending requests
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Contributors"
            value={stats.totalContributors}
            icon={People}
            color="primary"
            subtitle="Active content creators"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={PersonAdd}
            color="warning"
            subtitle="Awaiting review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Contributors"
            value={stats.activeContributors}
            icon={NotificationsActive}
            color="success"
            subtitle="Currently active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Content Created"
            value={stats.contributedContent}
            icon={FitnessCenter}
            color="info"
            subtitle="Total exercises"
          />
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            
            <TextField
              select
              size="small"
              label="Filter by Role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="contributor">Contributors</MenuItem>
              <MenuItem value="admin">Admins</MenuItem>
            </TextField>
            
            <Button
              variant="outlined"
              startIcon={<Notifications />}
              onClick={() => showNotification('Feature coming soon!', 'info')}
            >
              Send Notification
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab
              icon={<People />}
              label={`Contributors (${contributors.length})`}
              iconPosition="start"
            />
            <Tab
              icon={<PersonAdd />}
              label={`Pending Requests (${pendingRequests.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {tabValue === 0 && (
            <UserTable
              users={filteredData()}
              emptyMessage="No contributors found"
            />
          )}
          
          {tabValue === 1 && (
            <ContributorRequestsManager />
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <UserDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        user={selectedUser}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        onToggleRole={handleToggleUserRole}
      />

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ContributorManagement;
