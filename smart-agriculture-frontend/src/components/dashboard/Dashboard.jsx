import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCultivationPlan } from "../../contexts/CultivationPlanContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLeaf,
  faExclamationTriangle,
  faCalendarCheck,
  faSeedling,
  faCheckCircle,
  faTimesCircle,
  faChartLine,
  faTachometerAlt,
  faVolumeUp,
  faVolumeMute,
  faTemperatureHigh,
  faCloudRain,
  faTint,
  faCalendarPlus,
  faCalendarAlt,
  faClipboardList,
  faWind,
  faExpand,
  faCompress
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
  const { latest } = useDeviceRealtime(selectedDevice);

  const [isLoading, setIsLoading] = useState(true);
  const [playedAlerts, setPlayedAlerts] = useState(new Set());
  const [userInteracted, setUserInteracted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [expandedView, setExpandedView] = useState(false);

  const alertAudioRef = useRef(null);

  // User interaction detection
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
    return () => window.removeEventListener("click", enableSound);
  }, []);

  // Initialize played alerts
  useEffect(() => {
    const stored = localStorage.getItem('playedAlerts');
    if (stored) setPlayedAlerts(new Set(JSON.parse(stored)));
  }, []);

  // Save played alerts
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
      alertAudioRef.current.play().catch(err => console.warn("Audio play prevented:", err));
    } catch (error) {
      console.warn("Audio play error:", error);
    }
  }, [userInteracted, soundEnabled]);

  // Alert handling
  useEffect(() => {
    if (planAlerts?.alerts?.length === 0 || !userInteracted) return;

    const newAlerts = planAlerts?.alerts?.filter(alert => !playedAlerts.has(alert.id));
    
    if (newAlerts.length > 0) {
      const latestNewAlert = newAlerts[newAlerts.length - 1];
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: latestNewAlert.type === 'high-temp' ? 'warning' : 'info',
        title: latestNewAlert.type === 'high-temp' ? 'High Temperature!' : 'Rain Alert!',
        text: latestNewAlert.message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });

      handlePlayAlert();
      
      setPlayedAlerts(prev => {
        const newSet = new Set(prev);
        newAlerts.forEach(alert => newSet.add(alert.id));
        return newSet;
      });
    }
  }, [planAlerts?.alerts, userInteracted, playedAlerts, handlePlayAlert]);

  useEffect(() => {
    fetchUser();
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const clearPlayedAlerts = () => {
    setPlayedAlerts(new Set());
    localStorage.removeItem('playedAlerts');
  };

  // Compact StatCard Component
  const StatCard = ({ title, value, unit, icon, trend, onClick }) => (
    <div 
      className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase">{title}</p>
        <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
          <div className="text-sm text-green-600">{icon}</div>
        </div>
      </div>
      
      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{unit}</p>
        {trend && (
          <div className="flex items-center gap-1">
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.color}`}>
              {trend.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-3"></div>
          <h3 className="text-base font-semibold text-gray-700">Loading Dashboard</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Compact Header */}
        <div className="mb-6 mt-14">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Farm Dashboard</h1>
          <p className="text-gray-600">Real-time insights for your agricultural operations</p>
        </div>
        
        {/* Control Bar */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Live</span>
            </div>
            {!userInteracted && (
              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                Click to enable sounds
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setExpandedView(!expandedView)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm"
            >
              <FontAwesomeIcon icon={expandedView ? faCompress : faExpand} className="text-green-600" />
              <span>{expandedView ? 'Compact' : 'Expand'}</span>
            </button>

            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm"
            >
              <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} className={soundEnabled ? "text-green-600" : "text-gray-400"} />
            </button>
            
            {planAlerts?.alerts?.length > 0 && (
              <button
                onClick={clearPlayedAlerts}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-sm"
              >
                <Bell className="text-blue-600" size={14} />
                <span>{planAlerts?.alerts?.filter(alert => !playedAlerts.has(alert.id)).length} new</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Active Area"
            value={`${planStats?.totalArea || 0}`}
            unit="Hectares"
            icon={<FontAwesomeIcon icon={faLeaf} />}
            trend={{ 
              text: `${Math.round((planStats?.totalArea / (currentUser?.farmTotalArea || 2*planStats?.totalArea)) * 100)}%`, 
              color: "bg-yellow-100 text-yellow-800",
              direction: 'up'
            }}
            onClick={() => navigate('/planning')}
          />
          
          <StatCard
            title="Alerts"
            value={planAlerts?.alerts?.length || 0}
            unit="Requires attention"
            icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
            trend={{ 
              text: planAlerts?.alerts?.length > 0 ? "Action needed" : "Clear", 
              color: planAlerts?.alerts?.length > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800",
              direction: planAlerts?.alerts?.length > 0 ? 'up' : 'down'
            }}
            onClick={() => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' })}
          />
          
          <StatCard
            title="Activities"
            value={planAlerts.activities.length}
            unit="Scheduled"
            icon={<FontAwesomeIcon icon={faCalendarCheck} />}
            trend={{ 
              text: `${planAlerts.activities.length} events`, 
              color: "bg-blue-100 text-blue-800",
              direction: 'up'
            }}
            onClick={() => document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' })}
          />

          <StatCard
            title="Growing"
            value={planStats?.planted || 0}
            unit="Active crops"
            icon={<FontAwesomeIcon icon={faSeedling} />}
            trend={{ 
              text: `${planStats?.plantedPercentage || 0}%`, 
              color: "bg-green-100 text-green-800",
              direction: 'up'
            }}
            onClick={() => navigate('/planning')}
          />
        </div>

        {/* Secondary Stats - Expanded View */}
        {expandedView && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Harvested"
              value={planStats?.completed || 0}
              unit="Completed"
              icon={<FontAwesomeIcon icon={faCheckCircle} />}
              trend={{ 
                text: `${planStats?.completionRate || 0}%`, 
                color: "bg-emerald-100 text-emerald-800",
                direction: 'up'
              }}
            />

            <StatCard
              title="Cancelled"
              value={planStats?.cancelled || 0}
              unit="Plans"
              icon={<FontAwesomeIcon icon={faTimesCircle} />}
              trend={{ 
                text: `${Math.round((planStats?.cancelled / (planStats?.total || 1)) * 100)}%`, 
                color: "bg-red-100 text-red-800",
                direction: 'down'
              }}
            />

            <StatCard
              title="Progress"
              value={`${planStats?.plantedPercentage || 0}%`}
              unit="Capacity"
              icon={<FontAwesomeIcon icon={faChartLine} />}
              trend={{ 
                text: "Planted", 
                color: "bg-purple-100 text-purple-800",
                direction: 'up'
              }}
            />

            <StatCard
              title="Success Rate"
              value={`${planStats?.completionRate || 0}%`}
              unit="Overall"
              icon={<FontAwesomeIcon icon={faTachometerAlt} />}
              trend={{ 
                text: "Performance", 
                color: "bg-orange-100 text-orange-800",
                direction: 'up'
              }}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Alerts */}
          <div id="alerts-section" className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-gray-900">Urgent Alerts</h3>
              </div>
              {planAlerts.alerts.length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                  {planAlerts.alerts.length}
                </span>
              )}
            </div>

            {planAlerts.alerts.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {planAlerts.alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'high-temp' ? 'border-l-orange-500 bg-orange-50' : 
                      alert.type === 'rain' ? 'border-l-blue-500 bg-blue-50' :
                      'border-l-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        alert.type === 'high-temp' ? 'bg-orange-100' : 
                        alert.type === 'rain' ? 'bg-blue-100' : 
                        'bg-yellow-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={
                            alert.type === 'high-temp' ? faTemperatureHigh :
                            alert.type === 'rain' ? faCloudRain : faTint
                          }
                          className={`text-sm ${
                            alert.type === 'high-temp' ? 'text-orange-600' :
                            alert.type === 'rain' ? 'text-blue-600' : 'text-yellow-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {alert.type === 'high-temp' ? 'Temperature Alert' :
                           alert.type === 'rain' ? 'Rain Alert' : 'Humidity Alert'}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            {alert.plan.sectorName}
                          </span>
                          <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            {alert.plan.cropName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600 mb-2" />
                <p className="text-sm text-gray-700 font-semibold">No urgent alerts</p>
                <p className="text-xs text-gray-500">All systems normal</p>
              </div>
            )}
          </div>

          {/* Weather */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Weather</h3>
              <span className="text-xs text-gray-500">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-gray-500">Temp</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{latest?.temperature || 0}°C</div>
                <div className="text-xs text-gray-500">
                  {latest?.temperature < 20 ? 'Cool' : latest?.temperature <= 30 ? 'Ideal' : latest?.temperature <= 45 ? 'Warm' : 'Hot'}
                </div>
              </div>
              
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">Humidity</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{latest?.humidity || 0}%</div>
                <div className="text-xs text-gray-500">
                  {latest?.humidity < 50 ? 'Low' : latest?.humidity <= 80 ? 'Ideal' : 'High'}
                </div>
              </div>
              
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faWind} className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Wind</span>
                </div>
                <div className="text-xl font-bold text-gray-900">12 km/h</div>
                <div className="text-xs text-gray-500">Gentle</div>
              </div>
              
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faCloudRain} className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-500">Rain</span>
                </div>
                <div className="text-xl font-bold text-gray-900">5 mm</div>
                <div className="text-xs text-gray-500">24h</div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Partly Cloudy</div>
                  <div className="text-xs text-gray-500">Good conditions</div>
                </div>
                <div className="text-2xl">⛅</div>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div id="activities-section" className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <h3 className="text-base font-bold text-gray-900">Activities</h3>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                {planAlerts.activities.length}
              </span>
            </div>
            
            {planAlerts.activities.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {planAlerts.activities.map(activity => (
                  <div
                    key={activity.id}
                    onClick={() => navigate('/planning')}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-all ${
                      activity.type === 'harvest' 
                        ? 'border-l-amber-500 bg-amber-50 hover:bg-amber-100' 
                        : 'border-l-green-500 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'harvest' ? 'bg-amber-100' : 'bg-green-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={activity.type === 'harvest' ? faSeedling : faCalendarPlus}
                          className={`text-sm ${activity.type === 'harvest' ? 'text-amber-600' : 'text-green-600'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {activity.type === 'harvest' ? 'Harvest' : 'Planting'}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">{activity.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                              {activity.plan.sectorName}
                            </span>
                            <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                              {activity.plan.cropName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-700 font-semibold">No activities</p>
                <p className="text-xs text-gray-500">Check back later</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Quick Actions</h4>
              <p className="text-sm text-gray-600">Manage your farm operations</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/planning')}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faClipboardList} />
                Planning
              </button>
              <button 
                onClick={() => navigate('/analytics')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faChartLine} />
                Analytics
              </button>
              <button 
                onClick={() => navigate('/device-management')}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <i className="fas fa-microchip"></i>
                Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;