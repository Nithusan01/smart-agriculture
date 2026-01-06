// src/hooks/useDateUtils.js
import { useMemo } from 'react';

export const useDateUtils = () => {
  const dateUtils = useMemo(() => {

    // Check if a date is within a specific number of days from today
    const isDateWithinDays = (targetDate, days = 1) => {
      if (!targetDate) return false;
      
      const today = new Date();
      const target = new Date(targetDate);
      
      // Reset times to compare only dates
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      
      // Calculate difference in days
      const diffTime = target - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Return true if date is within the specified days
      return diffDays >= 0 && diffDays <= days;
    };

    // Check if date is today
    const isDateToday = (targetDate) => {
      if (!targetDate) return false;
      
      const today = new Date();
      const target = new Date(targetDate);
      
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      
      return today.getTime() === target.getTime();
    };

    // Check if date is in the past
    const isDatePast = (targetDate) => {
      if (!targetDate) return false;
      
      const today = new Date();
      const target = new Date(targetDate);
      
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      
      return target < today;
    };

    // Check if date is in the future
    const isDateFuture = (targetDate) => {
      if (!targetDate) return false;
      
      const today = new Date();
      const target = new Date(targetDate);
      
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      
      return target > today;
    };

    // Get days difference between two dates
    const getDaysDifference = (date1, date2) => {
      if (!date1 || !date2) return null;
      
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(d2 - d1);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Format date to readable string
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    // NEW: Calculate growth progress percentage based on planting and harvest dates
    const calculateGrowthProgress = (plantingDate, harvestDate) => {
      if (!plantingDate || !harvestDate) return 0;
      
      const planting = new Date(plantingDate);
      const harvest = new Date(harvestDate);
      const today = new Date();
      
      // If harvest date has passed, return 100%
      if (today >= harvest) return 100;
      
      // If planting date is in future, return 0%
      if (today < planting) return 0;
      
      // Calculate percentage
      const totalDuration = harvest - planting;
      const elapsedDuration = today - planting;
      const progress = (elapsedDuration / totalDuration) * 100;
      
      // Ensure progress is between 0 and 100
      return Math.min(Math.max(progress, 0), 100);
    };

    // NEW: Calculate time remaining until harvest
    const calculateTimeRemaining = (harvestDate) => {
      if (!harvestDate) return '';
      
      const today = new Date();
      const harvest = new Date(harvestDate);
      
      // Reset times to compare only dates
      today.setHours(0, 0, 0, 0);
      harvest.setHours(0, 0, 0, 0);
      
      const timeDiff = harvest - today;
      
      if (timeDiff <= 0) return 'Harvest time!';
      
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysRemaining === 0) return 'Harvest today!';
      if (daysRemaining === 1) return '1 day remaining';
      if (daysRemaining < 7) return `${daysRemaining} days remaining`;
      if (daysRemaining < 30) {
        const weeks = Math.ceil(daysRemaining / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} remaining`;
      }
      
      const monthsRemaining = Math.ceil(daysRemaining / 30);
      return `${monthsRemaining} month${monthsRemaining > 1 ? 's' : ''} remaining`;
    };

    // NEW: Get progress color based on percentage
    const getProgressColor = (progress) => {
      if (progress < 25) return 'from-blue-500 to-cyan-500';
      if (progress < 50) return 'from-green-500 to-emerald-500';
      if (progress < 75) return 'from-amber-500 to-orange-500';
      return 'from-emerald-500 to-green-500';
    };

    // NEW: Get progress text color based on percentage
    const getProgressTextColor = (progress) => {
      if (progress < 25) return 'text-blue-600';
      if (progress < 50) return 'text-green-600';
      if (progress < 75) return 'text-amber-600';
      return 'text-emerald-600';
    };

    // NEW: Check if crop is ready for harvest (progress 100% or harvest date passed)
    const isReadyForHarvest = (plantingDate, harvestDate) => {
      const progress = calculateGrowthProgress(plantingDate, harvestDate);
      return progress >= 100;
    };

    // NEW: Get growth stage based on progress
    const getGrowthStage = (progress) => {
      if (progress === 0) return 'Not planted';
      if (progress < 25) return 'Early growth';
      if (progress < 50) return 'Vegetative stage';
      if (progress < 75) return 'Flowering stage';
      if (progress < 100) return 'Fruiting stage';
      return 'Ready for harvest';
    };

    return {
      isDateWithinDays,
      isDateToday,
      isDatePast,
      isDateFuture,
      getDaysDifference,
      formatDate,
      // New functions
      calculateGrowthProgress,
      calculateTimeRemaining,
      getProgressColor,
      getProgressTextColor,
      isReadyForHarvest,
      getGrowthStage
    };
  }, []);

  return dateUtils;
};

export default useDateUtils;