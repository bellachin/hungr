import axios from 'axios';

const API_URL = "http://localhost:5001/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// 🥗 API functions
export const getFeed = (userId) =>
  axios.get(`${API_URL}/feed/${userId}`, { headers: getAuthHeaders() });

export const addMeal = (mealData) =>
  axios.post(`${API_URL}/meals`, mealData, { headers: getAuthHeaders() });

export const addItem = (itemData) =>
  axios.post(`${API_URL}/items`, itemData, { headers: getAuthHeaders() });

// 💬 Add the missing ones
export const likeMeal = (mealId) =>
  axios.post(`${API_URL}/meals/${mealId}/like`, {}, { headers: getAuthHeaders() });

export const commentMeal = (mealId, comment) =>
  axios.post(`${API_URL}/meals/${mealId}/comment`, { comment }, { headers: getAuthHeaders() });
