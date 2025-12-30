// src/hooks/usePlanWeather.js
import { useEffect, useState } from "react";

export const usePlanWeather = (plans, fetchWeatherForPlan) => {
  const [planWeather, setPlanWeather] = useState({});

  useEffect(() => {
    const fetchWeatherForPlans = async () => {
      const weatherPromises = plans.map(async (plan) => {
        if (plan.farmLat && plan.farmLng) {
          try {
            const weather = await fetchWeatherForPlan(plan.farmLat, plan.farmLng);
            return { planId: plan.id, weather };
          } catch (error) {
            console.error(`Failed to fetch weather for plan ${plan.id}:`, error);
            return { planId: plan.id, weather: null };
          }
        }
        return { planId: plan.id, weather: null };
      });

      try {
        const results = await Promise.all(weatherPromises);
        const weatherMap = {};
        results.forEach((result) => {
          if (result.weather) {
            weatherMap[result.planId] = result.weather;
          }
        });
        setPlanWeather(weatherMap);
      } catch (error) {
        console.error("Error fetching weather for plans:", error);
      }
    };

    if (plans.length > 0) {
      fetchWeatherForPlans();
    }
  }, [plans, fetchWeatherForPlan]);

  return planWeather;
};
