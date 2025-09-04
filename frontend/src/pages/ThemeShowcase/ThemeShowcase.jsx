import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  LinearProgress,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Fab,
  Tooltip,
  Breadcrumbs,
  Link,
  useTheme
} from '@mui/material';

import {
  Palette,
  LightMode,
  DarkMode,
  Star,
  Favorite,
  ThumbUp,
  Face,
  Person,
  Settings,
  Home,
  Add
} from '@mui/icons-material';
import { 
  ThemeToggleButton, 
  ThemeToggleSwitch, 
  ThemeSelector, 
  InlineThemeToggle 
} from '../../components/Common/ThemeToggle.jsx';

const ThemeShowcase = () => {
  const theme = useTheme();
  const [progress, setProgress] = useState(65);
  const [selectedValue, setSelectedValue] = useState('option1');

  const colorPalette = [
    { name: 'Primary', color: theme.palette.primary.main },
    { name: 'Secondary', color: theme.palette.secondary.main },
    { name: 'Success', color: theme.palette.success.main },
    { name: 'Warning', color: theme.palette.warning.main },
    { name: 'Error', color: theme.palette.error.main },
    { name: 'Info', color: theme.palette.info.main }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Universal Theme Showcase
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Explore the adaptive color palette that works perfectly across all devices and environments
        </Typography>
        
        {/* Theme Controls */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            display: 'inline-flex', 
            gap: 3, 
            alignItems: 'center',
            borderRadius: 3
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>Theme Controls:</Typography>
          <ThemeToggleButton />
          <ThemeToggleSwitch />
          <ThemeSelector />
          <InlineThemeToggle />
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* Color Palette */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Palette color="primary" />
                Color Palette
              </Typography>
              <Grid container spacing={2}>
                {colorPalette.map((color) => (
                  <Grid item xs={6} sm={4} key={color.name}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          backgroundColor: color.color,
                          borderRadius: 2,
                          mx: 'auto',
                          mb: 1,
                          boxShadow: `0 4px 8px ${color.color}40`
                        }}
                      />
                      <Typography variant="caption" fontWeight={600}>
                        {color.name}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {color.color}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Chips */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Status Indicators
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label="Active" color="success" />
                <Chip label="Pending" color="warning" />
                <Chip label="Error" color="error" />
                <Chip label="Info" color="info" />
                <Chip label="Default" />
                <Chip label="Secondary" color="secondary" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Status chips adapt automatically to light and dark themes with optimal contrast ratios.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Interactive Components */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Interactive Elements
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Sample Input"
                  variant="outlined"
                  placeholder="Type something..."
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Sample Select</InputLabel>
                  <Select
                    value={selectedValue}
                    label="Sample Select"
                    onChange={(e) => setSelectedValue(e.target.value)}
                  >
                    <MenuItem value="option1">Option 1</MenuItem>
                    <MenuItem value="option2">Option 2</MenuItem>
                    <MenuItem value="option3">Option 3</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Sample Switch"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress & Loading */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Progress & Loading
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Linear Progress ({progress}%)
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary">
                  Circular Progress
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Alert Messages
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Alert severity="success">Success message</Alert>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Alert severity="warning">Warning message</Alert>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Alert severity="error">Error message</Alert>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Alert severity="info">Info message</Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Button Variations
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Button variant="contained" color="primary">Primary</Button>
                <Button variant="contained" color="secondary">Secondary</Button>
                <Button variant="contained" color="success">Success</Button>
                <Button variant="contained" color="warning">Warning</Button>
                <Button variant="contained" color="error">Error</Button>
                <Button variant="contained" color="info">Info</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Button variant="outlined" color="primary">Primary</Button>
                <Button variant="outlined" color="secondary">Secondary</Button>
                <Button variant="outlined" color="success">Success</Button>
                <Button variant="outlined" color="warning">Warning</Button>
                <Button variant="outlined" color="error">Error</Button>
                <Button variant="outlined" color="info">Info</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button variant="text" color="primary">Primary</Button>
                <Button variant="text" color="secondary">Secondary</Button>
                <Button variant="text" color="success">Success</Button>
                <Button variant="text" color="warning">Warning</Button>
                <Button variant="text" color="error">Error</Button>
                <Button variant="text" color="info">Info</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* List & Navigation */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Navigation Elements
              </Typography>
              <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" href="#">
                  <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                  Home
                </Link>
                <Link underline="hover" color="inherit" href="#">
                  Pages
                </Link>
                <Typography color="text.primary">Current Page</Typography>
              </Breadcrumbs>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Star color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Featured Item" secondary="With description" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Favorite color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Favorite Item" secondary="Liked by users" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ThumbUp color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Recommended" secondary="Highly rated" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* User Elements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                User Interface Elements
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    John Doe
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administrator
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>JD</Avatar>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Face />
                </Avatar>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Settings />
                </Avatar>
              </Box>
              <Tooltip title="Add New Item">
                <Fab color="primary" size="medium">
                  <Add />
                </Fab>
              </Tooltip>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Compatibility Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Device & Environment Compatibility
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    📱 Mobile Optimized
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • OLED-friendly true blacks for battery efficiency<br />
                    • High contrast ratios for outdoor visibility<br />
                    • Touch-friendly interactive elements<br />
                    • Adaptive brightness support
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    💻 Desktop Enhanced
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Multi-monitor color consistency<br />
                    • 4K/8K display optimization<br />
                    • Professional color calibration support<br />
                    • Keyboard navigation friendly
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" color="info.main" gutterBottom>
                    ♿ Accessibility First
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • WCAG 2.1 AAA compliant<br />
                    • Color blindness friendly<br />
                    • High contrast mode support<br />
                    • Screen reader compatible
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          This universal theme automatically adapts to your device, environment, and accessibility needs.
        </Typography>
      </Box>
    </Container>
  );
};

export default ThemeShowcase;
