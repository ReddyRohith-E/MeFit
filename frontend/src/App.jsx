import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing/Landing.jsx';
import Layout from './components/Layout/Layout.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Profile from './pages/Profile/Profile.jsx';
import CreateProfile from './pages/Profile/CreateProfile.jsx';
import Goals from './pages/Goals/Goals.jsx';
import CreateGoal from './pages/Goals/CreateGoal.jsx';
import GoalDetail from './pages/Goals/GoalDetail.jsx';
import Workouts from './pages/Workouts/Workouts.jsx';
import WorkoutDetail from './pages/Workouts/WorkoutDetail.jsx';
import Exercises from './pages/Exercises/Exercises.jsx';
import ExerciseDetail from './pages/Exercises/ExerciseDetail.jsx';
import Programs from './pages/Programs/Programs.jsx';
import ProgramDetail from './pages/Programs/ProgramDetail.jsx';
import ContributorArea from './pages/Contributor/ContributorArea.jsx';

// Admin components
import AdminLogin from './pages/Admin/AdminLogin.jsx';
import AdminLayout from './components/Admin/AdminLayout.jsx';
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import UserManagement from './pages/Admin/UserManagement.jsx';
import adminTheme from './themes/adminTheme.js';

import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main App Routes */}
          <Route path="/app" element={
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AuthProvider>
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              </AuthProvider>
            </ThemeProvider>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/create" element={<CreateProfile />} />
            <Route path="goals" element={<Goals />} />
            <Route path="goals/create" element={<CreateGoal />} />
            <Route path="goals/:id" element={<GoalDetail />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="workouts/:id" element={<WorkoutDetail />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="exercises/:id" element={<ExerciseDetail />} />
            <Route path="programs" element={<Programs />} />
            <Route path="programs/:id" element={<ProgramDetail />} />
            <Route path="contributor" element={<ContributorArea />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={
            <ThemeProvider theme={adminTheme}>
              <CssBaseline />
              <AdminLogin />
            </ThemeProvider>
          } />
          
          <Route path="/admin" element={
            <ThemeProvider theme={adminTheme}>
              <CssBaseline />
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            </ThemeProvider>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="contributors" element={<div>Contributor Management Coming Soon</div>} />
            <Route path="content" element={<div>Content Management Coming Soon</div>} />
            <Route path="analytics" element={<div>Analytics Coming Soon</div>} />
            <Route path="settings" element={<div>Settings Coming Soon</div>} />
          </Route>

          {/* Fallback Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
