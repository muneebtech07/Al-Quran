import { calculateQiblaDirection } from '../qiblaCalculator';

describe('Qibla calculator', () => {
  test('should calculate correct direction for New York', () => {
    // New York coordinates
    const lat = 40.7128;
    const lng = -74.0060;
    
    // Expected Qibla direction from New York is approximately 58.5 degrees
    const direction = calculateQiblaDirection(lat, lng);
    expect(Math.round(direction)).toBeCloseTo(58.5, 0);
  });
  
  test('should calculate correct direction for London', () => {
    // London coordinates
    const lat = 51.5074;
    const lng = -0.1278;
    
    // Expected Qibla direction from London is approximately 119 degrees
    const direction = calculateQiblaDirection(lat, lng);
    expect(Math.round(direction)).toBeCloseTo(119, 0);
  });
  
  test('should handle edge case when at the Kaaba', () => {
    // Kaaba coordinates
    const lat = 21.422487;
    const lng = 39.826206;
    
    // When at the Kaaba, any direction is correct
    const direction = calculateQiblaDirection(lat, lng);
    expect(direction).not.toBeNaN();
  });
});