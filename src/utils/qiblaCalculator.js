/**
 * Calculate the direction to the Kaaba (Qibla) from any point on Earth
 * 
 * @param {number} latitude - User's latitude in decimal degrees
 * @param {number} longitude - User's longitude in decimal degrees
 * @returns {number} - Direction to Mecca in degrees from North (clockwise)
 */
export const calculateQiblaDirection = (latitude, longitude) => {
  // Kaaba coordinates in Mecca
  const kaabaLatitude = 21.422487;
  const kaabaLongitude = 39.826206;
  
  // Convert to radians
  const lat1 = toRadians(latitude);
  const lon1 = toRadians(longitude);
  const lat2 = toRadians(kaabaLatitude);
  const lon2 = toRadians(kaabaLongitude);
  
  // Calculate the Qibla direction using the formula
  const y = Math.sin(lon2 - lon1);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lon2 - lon1);
  
  // Calculate the angle in degrees and normalize to 0-360
  let qiblaAngle = toDegrees(Math.atan2(y, x));
  qiblaAngle = (qiblaAngle + 360) % 360;
  
  return qiblaAngle;
};

// Helper function to convert degrees to radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Helper function to convert radians to degrees
const toDegrees = (radians) => {
  return radians * (180 / Math.PI);
};