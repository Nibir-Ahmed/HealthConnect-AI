import api from './api';

export const getDoctors = async () => {
  try {
    const response = await api.get('/doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

export const getDoctorById = async (id) => {
  try {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return null;
  }
};
