import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Users API
export const usersAPI = {
  getMe: () => api.get('/users'),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, userData) => api.patch(`/users/${userId}`, userData),
  updatePassword: (userId, passwordData) => api.post(`/users/${userId}/update-password`, passwordData),
  requestContributor: (userId) => api.post(`/users/${userId}/request-contributor`),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

// Profiles API
export const profilesAPI = {
  createProfile: (profileData) => api.post('/profiles', profileData),
  getProfile: (profileId) => api.get(`/profiles/${profileId}`),
  getProfileByUser: (userId) => api.get(`/profiles/user/${userId}`),
  updateProfile: (profileId, profileData) => api.patch(`/profiles/${profileId}`, profileData),
  deleteProfile: (profileId) => api.delete(`/profiles/${profileId}`),
  getFitnessEvaluation: () => api.get('/profiles/me/evaluation'),
};

// Goals API
export const goalsAPI = {
  getGoals: (params) => api.get('/goals', { params }),
  getCurrentGoal: () => api.get('/goals/current'),
  getGoal: (goalId) => api.get(`/goals/${goalId}`),
  createGoal: (goalData) => api.post('/goals', goalData),
  updateGoal: (goalId, goalData) => api.patch(`/goals/${goalId}`, goalData),
  deleteGoal: (goalId) => api.delete(`/goals/${goalId}`),
  completeWorkout: (goalId, workoutData) => api.post(`/goals/${goalId}/complete-workout`, workoutData),
  getDashboardStats: () => api.get('/goals/dashboard/stats'),
};

// Programs API
export const programsAPI = {
  getPrograms: (params) => api.get('/programs', { params }),
  getProgram: (programId) => api.get(`/programs/${programId}`),
  createProgram: (programData) => api.post('/programs', programData),
  updateProgram: (programId, programData) => api.patch(`/programs/${programId}`, programData),
  deleteProgram: (programId) => api.delete(`/programs/${programId}`),
  getMyPrograms: () => api.get('/programs/my/created'),
  getSuggestions: (userId) => api.get(`/programs/suggestions/${userId}`),
  rateProgram: (programId, rating) => api.post(`/programs/${programId}/rate`, { rating }),
  getCategories: () => api.get('/programs/categories/list'),
};

// Workouts API
export const workoutsAPI = {
  getWorkouts: (params) => api.get('/workouts', { params }),
  getWorkout: (workoutId) => api.get(`/workouts/${workoutId}`),
  createWorkout: (workoutData) => api.post('/workouts', workoutData),
  updateWorkout: (workoutId, workoutData) => api.patch(`/workouts/${workoutId}`, workoutData),
  deleteWorkout: (workoutId) => api.delete(`/workouts/${workoutId}`),
  getMyWorkouts: () => api.get('/workouts/my/created'),
  getSuggestions: (userId) => api.get(`/workouts/suggestions/${userId}`),
  getTypes: () => api.get('/workouts/types/list'),
};

// Exercises API
export const exercisesAPI = {
  getExercises: (params) => api.get('/exercises', { params }),
  getExercise: (exerciseId) => api.get(`/exercises/${exerciseId}`),
  createExercise: (exerciseData) => api.post('/exercises', exerciseData),
  updateExercise: (exerciseId, exerciseData) => api.patch(`/exercises/${exerciseId}`, exerciseData),
  deleteExercise: (exerciseId) => api.delete(`/exercises/${exerciseId}`),
  getMyExercises: () => api.get('/exercises/my/created'),
  getMuscleGroups: () => api.get('/exercises/muscle-groups/list'),
  getEquipment: () => api.get('/exercises/equipment/list'),
};

export default api;
