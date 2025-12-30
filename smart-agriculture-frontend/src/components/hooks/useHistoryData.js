// Calculate temperature trend (last 5 readings vs first 5)
export const getTemperatureTrend = (history) => {
  if (history.length < 10) return 0;
  const recentAvg = history.slice(-5).reduce((sum, h) => sum + h.temperature, 0) / 5;
  const earlierAvg = history.slice(0, 5).reduce((sum, h) => sum + h.temperature, 0) / 5;
  return recentAvg - earlierAvg;
};

// Get humidity status label
export const getHumidityStatus = (humidity) => {
  if (humidity < 30) return 'bg-yellow-100 text-yellow-800';
  if (humidity < 60) return 'bg-green-100 text-green-800';
  return 'bg-blue-100 text-blue-800';
};

export const getHumidityLabel = (humidity) => {
  if (humidity < 30) return 'Low';
  if (humidity < 60) return 'Comfortable';
  return 'High';
};