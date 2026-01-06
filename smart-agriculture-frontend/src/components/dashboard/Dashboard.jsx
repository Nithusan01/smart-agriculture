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
  faCompress,
  faWater,
  faWind,
  faSun,
  faCloud
} from "@fortawesome/free-solid-svg-icons";
import { 
  Bell,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Droplets,
  Thermometer,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { usePlanWeather } from "../hooks/usePlanWeather";
import { useWeather } from "../../contexts/WeatherContext";
import { usePlanAlerts } from "../hooks/usePlanAlerts";
import Swal from 'sweetalert2';
import { usePlanStatistics } from "../hooks/usePlanStatistics";
import { useNavigate } from 'react-router-dom';
import useDeviceRealtime from "../hooks/useDeviceRealtime";
import { useDeviceAuth } from "../../contexts/DeviceAuthContext";

const Dashboard = () => {
  const { currentUser, fetchUser } = useAuth();
  const { plans } = useCultivationPlan();
  const { fetchWeatherForPlan } = useWeather();
  const planWeather = usePlanWeather(plans, fetchWeatherForPlan);
  const planAlerts = usePlanAlerts(plans, planWeather);
  const planStats = usePlanStatistics();
  const navigate = useNavigate();
  const { selectedDevice } = useDeviceAuth();
  const {latest} = useDeviceRealtime(selectedDevice);


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

  // Enhanced StatCard Component with perfect alignment
  const StatCard = ({ title, value, unit, icon, trend, gradient, onClick, variant = "primary" }) => (
    <div 
      className={`relative overflow-hidden rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${gradient} backdrop-blur-sm border border-gray-200/60 ${
        variant === "secondary" ? "h-full" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
              {title}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              variant === "secondary" ? "bg-gray-50" : "bg-green-50"
            } border ${
              variant === "secondary" ? "border-gray-200" : "border-green-200"
            }`}>
              <div className={`text-sm ${
                variant === "secondary" ? "text-gray-600" : "text-green-600"
              }`}>
                {icon}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main value - perfectly aligned */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-gray-900 leading-tight">
            {value}
          </p>
        </div>
        
        {/* Unit and trend - perfectly aligned */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium truncate pr-2">
              {unit}
            </p>
            {trend && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.color}`}>
                  {trend.text}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Subtle background accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 opacity-60"></div>
    </div>
  );

  // Weather Info Component
  const WeatherInfo = () => {
    const hasWeather = planWeather && planWeather.length > 0;
    const weather = hasWeather ? planWeather[0] : null;
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 shadow-lg border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <i className="fas fa-cloud-sun text-blue-600"></i>
              Weather Overview
            </h3>
            <p className="text-sm text-gray-500">Current farm conditions</p>
          </div>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>
        
        {hasWeather ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-gray-500">Temperature</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{weather.temperature}°C</div>
              </div>
              
              <div className="bg-white/80 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">Humidity</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{weather.humidity}%</div>
              </div>
              
              <div className="bg-white/80 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faWind} className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Wind</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{weather.windSpeed} km/h</div>
              </div>
              
              <div className="bg-white/80 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faCloudRain} className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-500">Rainfall</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{weather.rainfall} mm</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              {weather.condition} • {weather.description}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-cloud text-blue-400 text-xl"></i>
            </div>
            <p className="text-gray-600">Weather data loading...</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700">Loading Dashboard</h3>
          <p className="text-gray-500 mt-2">Preparing your farm analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 ">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-10 mt-14">
          <div className="text-start mb-8">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Farm Intelligence Dashboard
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl ">
              Real-time insights and management for your agricultural operations
            </p>
          </div>
          
          {/* Control Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-md p-5 mb-8 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live Updates Active</span>
              </div>
              {!userInteracted && (
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  👆 Click anywhere to enable sounds
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setExpandedView(!expandedView)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                <FontAwesomeIcon 
                  icon={soundEnabled ? faVolumeUp : faVolumeMute} 
                  className={soundEnabled ? "text-green-600" : "text-gray-400"} 
                />
                <span className="text-sm font-medium text-gray-700">
                  {soundEnabled ? 'Sound ON' : 'Sound OFF'}
                </span>
              </button>
              
              {planAlerts?.alerts?.length > 0 && (
                <button
                  onClick={clearPlayedAlerts}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <Bell className="text-blue-600" size={16} />
                  <span className="text-sm font-medium text-gray-700">
                    {planAlerts?.alerts?.filter(alert => !playedAlerts.has(alert.id)).length} new alerts
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Primary Stats Grid - Perfectly aligned */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Cultivation Area"
              value={`${planStats?.totalArea || 0}`}
              unit="Hectares in use"
              icon={<FontAwesomeIcon icon={faLeaf} />}
              gradient="bg-white"
              trend={{ 
                text: `${Math.round((planStats?.totalArea / (currentUser?.farmTotalArea || 2*planStats?.totalArea)) * 100)}% used`, 
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
            <h3 className="text-lg font-bold text-gray-800 mb-4 ml-1">Detailed Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Harvested Crops"
                value={planStats?.completed || 0}
                unit="Successfully completed"
                icon={<FontAwesomeIcon icon={faCheckCircle} />}
                gradient="bg-white"
                variant="secondary"
                trend={{ 
                  text: `${planStats?.completionRate || 0}% success`, 
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
                variant="secondary"
                trend={{ 
                  text: `${Math.round((planStats?.cancelled / (planStats?.total || 1)) * 100)}% rate`, 
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
                variant="secondary"
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
                variant="secondary"
                trend={{ 
                  text: "Performance metric", 
                  color: "bg-orange-100 text-orange-800",
                  direction: 'up'
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
  {/* Column 1: Alerts Section */}
  <div className="lg:col-span-1">
    <div id="alerts-section" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Urgent Alerts</h3>
            <p className="text-sm text-gray-500 mt-1">Requires immediate attention</p>
          </div>
        </div>
        {planAlerts.alerts.length > 0 && (
          <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1.5 rounded-full">
            {planAlerts.alerts.length}
          </span>
        )}
      </div>

      {planAlerts.alerts.length > 0 ? (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold text-sm truncate ${
                    alert.type === 'high-temp' ? 'text-orange-800' :
                    alert.type === 'rain' ? 'text-blue-800' :
                    'text-yellow-800'
                  }`}>
                    {alert.type === 'high-temp' ? '🌡️ Temperature Alert' :
                     alert.type === 'rain' ? '🌧️ Rain Alert' :
                     '💧 Humidity Alert'}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {new Date(alert.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm mb-2 ${
                  alert.type === 'high-temp' ? 'text-orange-700' :
                  alert.type === 'rain' ? 'text-blue-700' :
                  'text-yellow-700'
                }`}>
                  {alert.message}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-white rounded-full border border-gray-200">
                    Sector: {alert.plan.sectorName}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 bg-white rounded-full border border-gray-200">
                    {alert.plan.cropName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-600" />
          </div>
          <p className="text-gray-700 font-semibold">No urgent alerts</p>
          <p className="text-gray-500 text-sm mt-1">All systems are operating normally</p>
        </div>
      )}
    </div>
  </div>

  {/* Column 2: Weather Information */}
  <div className="lg:col-span-1">
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-blue-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-cloud-sun text-blue-600"></i>
            Weather Overview
          </h3>
          <p className="text-sm text-gray-500 mt-1">Current farm conditions via sensors</p>
        </div>
        <div className="text-xs text-gray-500">
          {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>
      
      {/* Weather data here - use your existing WeatherInfo component content */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">Temperature</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{latest?.temperature || 0} °C</div>
            {latest?.temperature < 20 ? (
              <div className="text-xs text-gray-500 mt-1">Cool</div>
            ) : ( latest?.temperature <= 30 ? ( 
              <div className="text-xs text-gray-500 mt-1">Ideal for crops</div>
            ) : ( latest?.temperature > 30 && (latest?.temperature <= 45) ) ? (
              <div className="text-xs text-gray-500 mt-1">Warm</div>  
            ) : (latest?.temperature > 45) ? (  
              <div className="text-xs text-gray-500 mt-1">Hot</div>
            ) : (
              <div className="text-xs text-gray-500 mt-1">N/A</div>
            ))}
          </div>
          
          <div className="bg-white/80 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Humidity</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{latest?.humidity || 0}%</div>
            {latest?.humidity < 50 ? (
              <div className="text-xs text-gray-500 mt-1">Low humidity</div>
            ) : ( latest?.humidity <= 80 ? (
              <div className="text-xs text-gray-500 mt-1">Ideal for crops</div>
            ) : ( latest?.humidity > 80 && (latest?.humidity <= 100) ) ? (
              <div className="text-xs text-gray-500 mt-1">High humidity</div>
            ) : (
              <div className="text-xs text-gray-500 mt-1">N/A</div>
            ))}
          </div>
          
          <div className="bg-white/80 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faWind} className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Wind</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">12 km/h</div>
            <div className="text-xs text-gray-500 mt-1">Gentle breeze</div>
          </div>
          
          <div className="bg-white/80 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faCloudRain} className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Rainfall</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">5 mm</div>
            <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Weather Condition</div>
              <div className="text-lg font-semibold text-gray-900">Partly Cloudy</div>
            </div>
            <div className="text-3xl">⛅</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Perfect conditions for outdoor farming activities
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Column 3: Upcoming Activities */}
  <div className="lg:col-span-1">
    <div id="activities-section" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Upcoming Activities</h3>
            <p className="text-sm text-gray-500 mt-1">Scheduled events and tasks</p>
          </div>
        </div>
        <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1.5 rounded-full">
          {planAlerts.activities.length}
        </span>
      </div>
      
      {planAlerts.activities.length > 0 ? (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold text-sm truncate ${
                    activity.type === 'harvest' ? 'text-amber-800' : 'text-green-800'
                  }`}>
                    {activity.type === 'harvest' ? '🌾 Harvest Alert' : '📅 Planting Reminder'}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                </div>
                <p className={`text-sm mb-2 ${
                  activity.type === 'harvest' ? 'text-amber-700' : 'text-green-700'
                }`}>
                  {activity.message}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-white rounded-full border border-gray-200">
                      Sector: {activity.plan.sectorName}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-white rounded-full border border-gray-200">
                      {activity.plan.cropName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {new Date(activity.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-2xl text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold">No upcoming activities</p>
          <p className="text-gray-500 text-sm mt-1">Check back later for scheduled events</p>
        </div>
      )}
    </div>
  </div>
</div>

        {/* Quick Actions Footer */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-md p-6 border border-green-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Ready to take action?</h4>
              <p className="text-gray-600">Manage your farm operations efficiently</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate('/planning')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faClipboardList} />
                View Planning
              </button>
              <button 
                onClick={() => navigate('/analytics')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faChartLine} />
                View Analytics
              </button>
              <button 
                onClick={() => navigate('/device-management')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
              >
                <i className="fas fa-microchip"></i>
                IoT Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;