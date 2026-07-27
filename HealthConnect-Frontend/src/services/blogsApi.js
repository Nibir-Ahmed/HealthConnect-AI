import api from './api';

export const getBlogs = async () => {
  try {
    const response = await api.get('/blogs');
    return response.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
};

export const getSavedBlogs = async () => {
  try {
    const response = await api.get('/blogs/saved');
    return response.data;
  } catch (error) {
    console.error('Error fetching saved blogs:', error);
    return [];
  }
};

export const getBlogById = async (id) => {
  try {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
};

export const toggleSaveBlog = async (id) => {
  try {
    const response = await api.post(`/blogs/${id}/save`);
    return response.data; // should return { saved: true/false }
  } catch (error) {
    console.error('Error saving blog:', error);
    return { saved: false };
  }
};
