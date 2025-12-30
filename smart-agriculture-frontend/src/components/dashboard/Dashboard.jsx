import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCultivationPlan } from "../../contexts/CultivationPlanContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHeart, 
  faChartLine, 
  faExclamationTriangle,
  faClipboardList,
  faTimesCircle,
  faTachometerAlt,
  faLeaf,
  faVolumeUp,
  faVolumeMute,
  faCalendarCheck,
  faCheckCircle,
  faTemperatureHigh,
  faCloudRain,
  faTint,
  faSeedling,
  faCalendarPlus,
  faCalendarAlt,
  faArrowRight,
  faExpand,
  faCompress
} from "@fortawesome/free-solid-svg-icons";

import { 
  Bell,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { usePlanWeather } from "../hooks/usePlanWeather";
import { useWeather } from "../../contexts/WeatherContext";
import { usePlanAlerts } from "../hooks/usePlanAlerts";
import Swal from 'sweetalert2';
import { usePlanStatistics } from "../hooks/usePlanStatistics";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, fetchUser } = useAuth();
  const { plans } = useCultivationPlan();
  const { fetchWeatherForPlan } = useWeather();
  const planWeather = usePlanWeather(plans, fetchWeatherForPlan);
  const planAlerts = usePlanAlerts(plans, planWeather);
  const planStats = usePlanStatistics();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeSensors: 0,
    systemHealth: 0,
    alerts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [playedAlerts, setPlayedAlerts] = useState(new Set());
  const [userInteracted, setUserInteracted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [expandedView, setExpandedView] = useState(false);

  const handleActivityClick = (activity) => {
    navigate('/planning');
  };

  const alertAudioRef = useRef(null);

  // User interaction detection and audio preloading
  useEffect(() => {
    const enableSound = () => {
      setUserInteracted(true);
      if (!alertAudioRef.current) {
        try {
          alertAudioRef.current = new Audio("/alert.mp3");
          alertAudioRef.current.preload = 'auto';
          alertAudioRef.current.load();
        } catch (error) {
          console.error("Failed to initialize audio:", error);
        }
      }
    };

    window.addEventListener("click", enableSound, { once: true });
    window.addEventListener("keydown", enableSound, { once: true });

    return () => {
      window.removeEventListener("click", enableSound);
      window.removeEventListener("keydown", enableSound);
    };
  }, []);

  // Initialize played alerts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('playedAlerts');
    if (stored) {
      setPlayedAlerts(new Set(JSON.parse(stored)));
    }
  }, []);

  // Save played alerts to localStorage
  useEffect(() => {
    if (playedAlerts.size > 0) {
      localStorage.setItem('playedAlerts', JSON.stringify([...playedAlerts]));
    }
  }, [playedAlerts]);

  const handlePlayAlert = useCallback(() => {
    if (!userInteracted || !soundEnabled || !alertAudioRef.current) return;
    
    try {
      alertAudioRef.current.currentTime = 0;
      alertAudioRef.current.volume = 0.7;
      alertAudioRef.current.play().catch(err => {
        console.warn("Audio play prevented:", err);
      });
    } catch (error) {
      console.warn("Audio play error:", error);
    }
  }, [userInteracted, soundEnabled]);

  const stopAlertSound = useCallback(() => {
    if (alertAudioRef.current) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }
  }, []);

  // Improved alert handling with deduplication
  useEffect(() => {
    if (planAlerts?.alerts?.length === 0 || !userInteracted) return;

    const newAlerts = planAlerts?.alerts?.filter(alert => !playedAlerts.has(alert.id));
    
    if (newAlerts.length > 0) {
      const latestNewAlert = newAlerts[newAlerts.length - 1];
      
      // Show toast notification
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: latestNewAlert.type === 'high-temp' ? 'warning' : 'info',
        title: latestNewAlert.type === 'high-temp' ? 'High Temperature Detected!' : 'Rain Alert!',
        text: latestNewAlert.message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: latestNewAlert.type === 'high-temp' ? '#fef3f2' : '#f0f9ff',
        color: latestNewAlert.type === 'high-temp' ? '#b91c1c' : '#1e40af',
        iconColor: latestNewAlert.type === 'high-temp' ? '#dc2626' : '#2563eb',
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      // Play sound for new alerts only
      handlePlayAlert();
      
      // Mark alerts as played
      setPlayedAlerts(prev => {
        const newSet = new Set(prev);
        newAlerts.forEach(alert => newSet.add(alert.id));
        return newSet;
      });
    }
  }, [planAlerts?.alerts, userInteracted, playedAlerts, handlePlayAlert]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlertSound();
      Swal.close();
    };
  }, [stopAlertSound]);

  useEffect(() => {
    fetchUser();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const systemHealth = Math.floor(Math.random() * 40) + 60;
      setStats({
        systemHealth,
        activeSensors: 40,
        alerts: 6,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearPlayedAlerts = () => {
    setPlayedAlerts(new Set());
    localStorage.removeItem('playedAlerts');
  };

  // Enhanced StatCard Component
  const StatCard = ({ title, value, unit, icon, trend, gradient, onClick }) => (
    <div 
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${gradient} backdrop-blur-sm border border-gray-200/60`}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header with title and icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide truncate">
              {title}
            </p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 border border-green-200">
              <div className="text-lg text-green-600">
                {icon}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main value */}
        <div className="mb-2">
          <p className="text-3xl font-bold text-gray-900 truncate">
            {value}
          </p>
        </div>
        
        {/* Unit and trend */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium truncate">
              {unit}
            </p>
            {trend && (
              <div className="flex items-center gap-1">
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend.color} flex-shrink-0 ml-1`}>
                  {trend.text}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Subtle background accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 opacity-60"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[24rem] py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-[url('/agri.jpg')] bg-cover bg-center min-h-screen bg-fixed relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-green-600/50 to-green-600/50"></div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-lime-200/20 rounded-full blur-3xl"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      <div className="relative z-10 mt-12 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
                Farm Intelligence Dashboard
              </h1>
              {/* <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow">
                Welcome back,{" "}
                <span className="font-bold text-white bg-green-600/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  {currentUser?.farmName || "Your Farm"}
                </span>
              </p> */}
            </div>
            
            {/* Status Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg border border-white/50 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">Live Updates</span>
                </div>
                {!userInteracted && (
                  <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full animate-pulse">
                    👆 Click to enable sounds
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setExpandedView(!expandedView)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-green-300 transition-colors"
                >
                  <FontAwesomeIcon 
                    icon={expandedView ? faCompress : faExpand} 
                    className="text-green-600" 
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {expandedView ? 'Compact View' : 'Expanded View'}
                  </span>
                </button>

                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-green-300 transition-colors"
                >
                  <FontAwesomeIcon 
                    icon={soundEnabled ? faVolumeUp : faVolumeMute} 
                    className={soundEnabled ? "text-green-600" : "text-gray-400"} 
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {soundEnabled ? 'Sound ON' : 'Sound OFF'}
                  </span>
                </button>
                
                <button
                  onClick={clearPlayedAlerts}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  <Bell className="text-blue-600" size={18} />
                  <span className="text-sm font-medium text-gray-700">
                    {planAlerts?.alerts?.filter(alert => !playedAlerts.has(alert.id)).length} new
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Primary Stats Grid */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
              <StatCard
                title="Active Cultivation Area"
                value={`${planStats?.totalArea || 0}`}
                unit="Hectares in use"
                icon={<FontAwesomeIcon icon={faLeaf} />}
                gradient="bg-white"
                trend={{ 
                  text: `${Math.round((planStats?.totalArea / (currentUser?.farmTotalArea || 2*planStats?.totalArea)) * 100)}% utilized`, 
                  color: "bg-yellow-100 text-yellow-800",
                  direction: 'up'
                }}
                onClick={() => navigate('/planning')}
              />
              
              <StatCard
                title="Urgent Alerts"
                value={planAlerts?.alerts?.length || 0}
                unit="Requires attention"
                icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
                gradient="bg-white"
                trend={{ 
                  text: planAlerts?.alerts?.length > 0 ? "Needs action" : "All clear", 
                  color: planAlerts?.alerts?.length > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800",
                  direction: planAlerts?.alerts?.length > 0 ? 'up' : 'down'
                }}
                onClick={() => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' })}
              />
              
              <StatCard
                title="Upcoming Activities"
                value={planAlerts.activities.length}
                unit="Scheduled events"
                icon={<FontAwesomeIcon icon={faCalendarCheck} />}
                gradient="bg-white"
                trend={{ 
                  text: `${planAlerts.activities.length} scheduled`, 
                  color: "bg-blue-100 text-blue-800",
                  direction: 'up'
                }}
                onClick={() => document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' })}
              />

              <StatCard
                title="Growing Crops"
                value={planStats?.planted || 0}
                unit="Active plantations"
                icon={<FontAwesomeIcon icon={faSeedling} />}
                gradient="bg-white"
                trend={{ 
                  text: `${planStats?.plantedPercentage || 0}% planted`, 
                  color: "bg-green-100 text-green-800",
                  direction: 'up'
                }}
                onClick={() => navigate('/planning')}
              />
              
            </div>
          </div>

          {/* Secondary Stats Grid - Conditionally rendered */}
          {expandedView && (
            <div className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
                <StatCard
                  title="Harvested Crops"
                  value={planStats?.completed || 0}
                  unit="Successfully completed"
                  icon={<FontAwesomeIcon icon={faCheckCircle} />}
                  gradient="bg-white"
                  trend={{ 
                    text: `${planStats?.completionRate || 0}% success rate`, 
                    color: "bg-emerald-100 text-emerald-800",
                    direction: 'up'
                  }}
                />

                <StatCard
                  title="Cancelled Plans"
                  value={planStats?.cancelled || 0}
                  unit="Plans cancelled"
                  icon={<FontAwesomeIcon icon={faTimesCircle} />}
                  gradient="bg-white"
                  trend={{ 
                    text: `${Math.round((planStats?.cancelled / (planStats?.total || 1)) * 100)}% cancellation`, 
                    color: "bg-red-100 text-red-800",
                    direction: 'down'
                  }}
                />

                <StatCard
                  title="Growth Progress"
                  value={`${planStats?.plantedPercentage || 0}%`}
                  unit="Of total capacity"
                  icon={<FontAwesomeIcon icon={faChartLine} />}
                  gradient="bg-white"
                  trend={{ 
                    text: "Planted ratio", 
                    color: "bg-purple-100 text-purple-800",
                    direction: 'up'
                  }}
                />

                <StatCard
                  title="Completion Rate"
                  value={`${planStats?.completionRate || 0}%`}
                  unit="Overall success rate"
                  icon={<FontAwesomeIcon icon={faTachometerAlt} />}
                  gradient="bg-white"
                  trend={{ 
                    text: "Performance metric", 
                    color: "bg-orange-100 text-orange-800",
                    direction: 'up'
                  }}
                />
                
              </div>
            </div>
          )}


          {/* Alerts & Activities Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* Urgent Alerts */}
            <div id="alerts-section" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-lg" />
                  </div>
                  <div>
                    Urgent Alerts
                    {planAlerts.alerts.length > 0 && (
                      <span className="block text-sm font-normal text-gray-500 mt-1">
                        Requires immediate attention
                      </span>
                    )}
                  </div>
                </h3>
                {planAlerts.alerts.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                    {planAlerts.alerts.length}
                  </span>
                )}
              </div>

              {planAlerts.alerts.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {planAlerts.alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`flex items-start p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-sm ${
                        alert.type === 'high-temp' 
                          ? 'border-l-orange-500 bg-orange-50' 
                          : alert.type === 'rain'
                          ? 'border-l-blue-500 bg-blue-50'
                          : 'border-l-yellow-500 bg-yellow-50'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.type === 'high-temp' ? 'bg-orange-100' : 
                        alert.type === 'rain' ? 'bg-blue-100' : 
                        'bg-yellow-100'
                      } mr-4`}>
                        <FontAwesomeIcon 
                          icon={
                            alert.type === 'high-temp' ? faTemperatureHigh :
                            alert.type === 'rain' ? faCloudRain :
                            faTint
                          }
                          className={
                            alert.type === 'high-temp' ? 'text-orange-600' :
                            alert.type === 'rain' ? 'text-blue-600' :
                            'text-yellow-600'
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          alert.type === 'high-temp' ? 'text-orange-800' :
                          alert.type === 'rain' ? 'text-blue-800' :
                          'text-yellow-800'
                        }`}>
                          {alert.type === 'high-temp' ? '🌡️ Temperature Alert' :
                           alert.type === 'rain' ? '🌧️ Rain Alert' :
                           '💧 Humidity Alert'}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          alert.type === 'high-temp' ? 'text-orange-700' :
                          alert.type === 'rain' ? 'text-blue-700' :
                          'text-yellow-700'
                        }`}>
                          {alert.message}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 bg-white rounded-full border">
                            Sector: {alert.plan.sectorName}
                          </span>
                          <span className="text-xs font-medium px-2 py-1 bg-white rounded-full border">
                            {alert.plan.cropName}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-600" />
                  </div>
                  <p className="text-gray-700 font-semibold">No urgent alerts</p>
                  <p className="text-gray-500 text-sm mt-1">All systems are operating normally</p>
                </div>
              )}
            </div>

            {/* Upcoming Activities */}
            <div id="activities-section" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-green-600 text-lg" />
                  </div>
                  <div>
                    Upcoming Activities
                    <span className="block text-sm font-normal text-gray-500 mt-1">
                      Scheduled events and tasks
                    </span>
                  </div>
                </h3>
                <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                  {planAlerts.activities.length}
                </span>
              </div>
              
              {planAlerts.activities.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {planAlerts.activities.map(activity => (
                    <div
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className={`flex items-start p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-sm cursor-pointer group ${
                        activity.type === 'harvest' 
                          ? 'border-l-amber-500 bg-amber-50 hover:bg-amber-100' 
                          : 'border-l-green-500 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'harvest' ? 'bg-amber-100 group-hover:bg-amber-200' : 'bg-green-100 group-hover:bg-green-200'
                      } mr-4 transition-colors`}>
                        <FontAwesomeIcon 
                          icon={activity.type === 'harvest' ? faSeedling : faCalendarPlus}
                          className={activity.type === 'harvest' ? 'text-amber-600' : 'text-green-600'}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-semibold ${
                            activity.type === 'harvest' ? 'text-amber-800' : 'text-green-800'
                          }`}>
                            {activity.type === 'harvest' ? '🌾 Harvest Alert' : '📅 Planting Reminder'}
                            <ChevronRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity inline" />
                          </h4>
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          activity.type === 'harvest' ? 'text-amber-700' : 'text-green-700'
                        }`}>
                          {activity.message}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 bg-white rounded-full border">
                            Sector: {activity.plan.sectorName}
                          </span>
                          <span className="text-xs font-medium px-2 py-1 bg-white rounded-full border">
                            {activity.plan.cropName}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-2xl text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-semibold">No upcoming activities</p>
                  <p className="text-gray-500 text-sm mt-1">Check back later for scheduled events</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-8 bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Need to take action?</h4>
                <p className="text-gray-600 text-sm">Manage your farm operations efficiently</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/planning')}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faClipboardList} />
                  View Planning
                </button>
                <button 
                  onClick={() => navigate('/analytics')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faChartLine} />
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;