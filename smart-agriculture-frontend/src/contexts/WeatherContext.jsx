import { createContext, useState, useContext } from "react";


const WeatherContext = createContext();

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

export const WeatherProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = 'https://api.openweathermap.org/data/2.5';
  const REACT_APP_OPENWEATHER_API_KEY= '0098a027ee63d14e4d98fe1a4fb738d0';

  // Modified fetchWeather to return data instead of just setting state
  const fetchWeather = async (lat, lng) => {
    if (!lat || !lng) {
      return null;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${REACT_APP_OPENWEATHER_API_KEY}&units=metric`
      );
      
      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${REACT_APP_OPENWEATHER_API_KEY}&units=metric`
      );

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Weather data fetch failed');
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      // Set the global state (optional - for single location use)
      setWeatherData(currentData);
      setForecastData(forecastData);

      // Return the data so it can be used for individual plans
      return {
        current: currentData,
        forecast: forecastData
      };

    } catch (err) {
      setError(err.message);
      console.error('Weather fetch error:', err);
      throw err; // Re-throw to handle in components
    } finally {
      setLoading(false);
    }
  };

  // Separate function to fetch weather without setting global state
  const fetchWeatherForPlan = async (lat, lng) => {
    if (!lat || !lng) {
      return null;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${REACT_APP_OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }

      const data = await response.json();
      return data;

    } catch (err) {
      console.error('Weather fetch error for plan:', err);
      throw err;
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // const getWeatherRecommendations = (weatherData) => {
  //   if (!weatherData) return [];

  //   const recommendations = [];
  //   const { main, weather } = weatherData;

  //   // Temperature-based recommendations
  //   if (main.temp < 10) {
  //     recommendations.push('Consider delaying planting due to cold temperatures');
  //   } else if (main.temp > 25) {
  //     recommendations.push('High temperatures detected - ensure adequate irrigation');
  //   }

  //   // Rain-based recommendations
  //   if (weather[0].main === 'Rain') {
  //     recommendations.push('Rain expected - adjust irrigation schedule');
  //   }

  //   // Humidity-based recommendations
  //   if (main.humidity > 80) {
  //     recommendations.push('High humidity - watch for fungal diseases');
  //   } else if (main.humidity < 30) {
  //     recommendations.push('Low humidity - increase irrigation frequency');
  //   }

  //   return recommendations;
  // };

  return (
    <WeatherContext.Provider value={{
      weatherData,
      forecastData,
      loading,
      error,
      fetchWeather,
      fetchWeatherForPlan, // Add the new function
      getWeatherIcon,
      
    }}>
      {children}
    </WeatherContext.Provider>
  );
};