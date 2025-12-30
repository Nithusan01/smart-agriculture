// src/utils/geocoding.js
export const getLocationName = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    
    const data = await response.json();
    
    // Get the display name (full address)
    return data.display_name || 'Location not found';
    
  } catch (error) {
    console.error('Error getting location:', error);
    return 'Location unavailable';
  }
};