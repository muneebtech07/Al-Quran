/**
 * Format a UTC date string into separate date and time parts
 * @param {string} dateTimeString - UTC date string in format YYYY-MM-DD HH:MM:SS
 * @returns {Object} - Object with formatted date and time strings
 */
export const formatDate = (dateTimeString) => {
  try {
    // Parse the date
    const date = new Date(dateTimeString);
    
    // Format date part (e.g., "March 2, 2025")
    const dateOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
    };
    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    
    // Format time part (e.g., "07:47 AM")
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const formattedTime = date.toLocaleTimeString(undefined, timeOptions);
    
    return {
      date: formattedDate,
      time: formattedTime
    };
  } catch (error) {
    console.error('Error formatting date:', error);
    return {
      date: 'Invalid Date',
      time: 'Invalid Time'
    };
  }
};