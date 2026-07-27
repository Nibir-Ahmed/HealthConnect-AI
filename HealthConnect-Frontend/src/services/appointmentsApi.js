import api from './api';

export const getDoctorAppointments = async () => {
  try {
    const response = await api.get('/appointments/doctor');
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return [];
  }
};

export const getPatientAppointments = async () => {
  try {
    const response = await api.get('/appointments/patient');
    return response.data;
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    return [];
  }
};

export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await api.put(`/appointments/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};
