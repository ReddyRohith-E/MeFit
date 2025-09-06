import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  refreshToken: () => api.post('/api/auth/refresh'),
};

// Users API - SRS API-03 compliant
export const usersAPI = {
  getMe: () => api.get('/user'), // SRS GET /user returns 303 to own profile
  getUser: (userId) => api.get(`/user/${userId}`), // SRS GET /user/:user_id
  updateUser: (userId, userData) => api.patch(`/user/${userId}`, userData), // SRS PATCH /user/:user_id
  updatePassword: (userId, passwordData) => api.post(`/user/${userId}/update_password`, passwordData), // SRS POST /user/:user_id/update_password
  requestContributor: (userId) => api.post(`/user/${userId}/request-contributor`),
  deleteUser: (userId) => api.delete(`/user/${userId}`), // SRS DELETE /user/:user_id
};

// Profiles API - SRS API-04 compliant
export const profilesAPI = {
  createProfile: (profileData) => api.post('/profile', profileData), // SRS POST /profile
  getProfile: (profileId) => api.get(`/profile/${profileId}`), // SRS GET /profile/profile_id
  getProfileByUser: (userId) => api.get(`/profile/user/${userId}`),
  updateProfile: (profileId, profileData) => api.patch(`/profile/${profileId}`, profileData), // SRS PATCH /profile/profile_id
  deleteProfile: (profileId) => api.delete(`/profile/${profileId}`), // SRS DELETE /profile/profile_id
  getFitnessEvaluation: () => api.get('/profile/me/evaluation'),
};

// Goals API - SRS API-05 compliant
export const goalsAPI = {
  getGoals: (params) => api.get('/goal', { params }),
  getCurrentGoal: () => api.get('/goal/current'),
  getGoal: (goalId) => api.get(`/goal/${goalId}`), // SRS GET /goal/goal_id
  createGoal: (goalData) => api.post('/goal', goalData), // SRS POST /goal
  updateGoal: (goalId, goalData) => api.patch(`/goal/${goalId}`, goalData), // SRS PATCH /goal/goal_id
  deleteGoal: (goalId) => api.delete(`/goal/${goalId}`), // SRS DELETE /goal/goal_id
  completeWorkout: (goalId, workoutData) => api.post(`/goal/${goalId}/complete-workout`, workoutData),
  getDashboardStats: () => api.get('/goal/dashboard/stats'),
};

// Programs API
export const programsAPI = {
  getPrograms: (params) => api.get('/program', { params }),
  getProgram: (programId) => api.get(`/program/${programId}`),
  createProgram: (programData) => api.post('/program', programData),
  updateProgram: (programId, programData) => api.patch(`/program/${programId}`, programData),
  deleteProgram: (programId) => api.delete(`/program/${programId}`),
  getMyPrograms: () => api.get('/program/my/created'),
  getSuggestions: (userId) => api.get(`/program/suggestions/${userId}`),
  rateProgram: (programId, rating) => api.post(`/program/${programId}/rate`, { rating }),
  getCategories: () => api.get('/program/categories/list'),
};

// Workouts API - SRS API-06 compliant
export const workoutsAPI = {
  getWorkouts: (params) => api.get('/workout', { params }),
  getWorkout: (workoutId) => api.get(`/workout/${workoutId}`), // SRS GET /workout/:workout_id
  createWorkout: (workoutData) => api.post('/workout', workoutData), // SRS POST /workout
  updateWorkout: (workoutId, workoutData) => api.patch(`/workout/${workoutId}`, workoutData), // SRS PATCH /workout/:workout_id
  deleteWorkout: (workoutId) => api.delete(`/workout/${workoutId}`), // SRS DELETE /workout/:workout_id
  getMyWorkouts: () => api.get('/workout/my/created'),
  getSuggestions: (userId) => api.get(`/workout/suggestions/${userId}`),
  getTypes: () => api.get('/workout/types/list'),
};

// Exercises API - SRS API-07 compliant
export const exercisesAPI = {
  getExercises: (params) => api.get('/exercises', { params }), // SRS GET /exercises
  getExercise: (exerciseId) => api.get(`/exercises/${exerciseId}`), // SRS GET /exercises/exercise_id
  createExercise: (exerciseData) => api.post('/exercise', exerciseData), // SRS POST /exercise
  updateExercise: (exerciseId, exerciseData) => api.patch(`/exercise/${exerciseId}`, exerciseData), // SRS PATCH /exercise/:exercise_id
  deleteExercise: (exerciseId) => api.delete(`/exercise/${exerciseId}`), // SRS DELETE /exercise/:exercise_id
  getMyExercises: () => api.get('/exercise/my/created'),
  getMuscleGroups: () => api.get('/exercise/muscle-groups/list'),
  getEquipment: () => api.get('/exercise/equipment/list'),
};

export default api;
