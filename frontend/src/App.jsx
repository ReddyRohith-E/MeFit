import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UniversalThemeProvider } from './contexts/UniversalThemeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing/Landing.jsx';
import Layout from './components/Layout/Layout.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import ResetPassword from './pages/Auth/ResetPassword.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Profile from './pages/Profile/Profile.jsx';
import CreateProfile from './pages/Profile/CreateProfile.jsx';
import Goals from './pages/Goals/Goals.jsx';
import CreateGoal from './pages/Goals/CreateGoal.jsx';
import GoalDetail from './pages/Goals/GoalDetail.jsx';
import Workouts from './pages/Workouts/Workouts.jsx';
import WorkoutDetail from './pages/Workouts/WorkoutDetail.jsx';
import WorkoutManagement from './pages/Workouts/WorkoutManagement.jsx';
import Exercises from './pages/Exercises/Exercises.jsx';
import ExerciseDetail from './pages/Exercises/ExerciseDetail.jsx';
import ExerciseManagement from './pages/Exercises/ExerciseManagement.jsx';
import Programs from './pages/Programs/Programs.jsx';
import ProgramDetail from './pages/Programs/ProgramDetail.jsx';
import ContributorArea from './pages/Contributor/ContributorArea.jsx';
import ContributorExercises from './pages/Contributor/ContributorExercises.jsx';
import ContributorWorkouts from './pages/Contributor/ContributorWorkouts.jsx';
import ContributorPrograms from './pages/Contributor/ContributorPrograms.jsx';

// Admin components
import AdminLogin from './pages/Admin/AdminLogin.jsx';
import AdminTokenLogin from './pages/Admin/AdminTokenLogin.jsx';
import AdminTokenSetter from './components/Admin/AdminTokenSetter.jsx';
import AdminLayout from './components/Admin/AdminLayout.jsx';
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import UserManagement from './pages/Admin/UserManagement.jsx';
import ContributorManagement from './pages/Admin/ContributorManagement.jsx';
import ContentManagement from './pages/Admin/ContentManagement.jsx';
import AnalyticsPage from './pages/Admin/AnalyticsPage.jsx';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage.jsx';
import AdminNotifications from './pages/Admin/AdminNotifications.jsx';
import ProfileSettingsPage from './pages/Profile/ProfileSettingsPage.jsx';
import ThemeShowcase from './pages/ThemeShowcase/ThemeShowcase.jsx';

// Notification Provider
import { NotificationProvider } from './components/Common/NotificationSystem.jsx';

import './App.css';

function App() {
  return (
    <UniversalThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <div className="app">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/theme-showcase" element={<ThemeShowcase />} />
                
                {/* Main App Routes */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/create" element={<CreateProfile />} />
                <Route path="profile/settings" element={<ProfileSettingsPage />} />
                <Route path="goals" element={<Goals />} />
                <Route path="goals/create" element={<CreateGoal />} />
                <Route path="goals/:id" element={<GoalDetail />} />
                <Route path="workouts" element={<Workouts />} />
                <Route path="workouts/manage" element={<WorkoutManagement />} />
                <Route path="workouts/:id" element={<WorkoutDetail />} />
                <Route path="exercises" element={<Exercises />} />
                <Route path="exercises/manage" element={<ExerciseManagement />} />
                <Route path="exercises/:id" element={<ExerciseDetail />} />
                <Route path="programs" element={<Programs />} />
                <Route path="programs/:id" element={<ProgramDetail />} />
                <Route path="contributor" element={<ContributorArea />} />
                <Route path="contributor/exercises" element={<ContributorExercises />} />
                <Route path="contributor/workouts" element={<ContributorWorkouts />} />
                <Route path="contributor/programs" element={<ContributorPrograms />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/token-login" element={<AdminTokenLogin />} />
              <Route path="/admin/debug" element={<AdminTokenSetter />} />
              
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="contributors" element={<ContributorManagement />} />
                <Route path="content" element={<ContentManagement />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>

              {/* Fallback Routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
        </AuthProvider>
      </NotificationProvider>
    </UniversalThemeProvider>
  );
}

export default App;
