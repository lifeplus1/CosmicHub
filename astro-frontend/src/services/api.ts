import axios from 'axios';

const API_URL = 'https://astrology-app-0emh.onrender.com';

export const fetchChart = async (data: any) => {
  return axios.post(`${API_URL}/api/chart`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
};

export const fetchPersonalityAnalysis = async (userId: string) => {
  return axios.get(`${API_URL}/api/analyze/personality/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
};