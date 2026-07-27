export const formatDate = (dateString) => {
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateString;
  }
};

export const formatTime = (timeString) => {
  return timeString; // Placeholder if already formatted, otherwise parse and format
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};
