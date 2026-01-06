// src/components/UserMenu.jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { usePlanStatistics } from "../hooks/usePlanStatistics";
import { ChevronDown } from 'lucide-react';
import { usePlanWeather } from "../hooks/usePlanWeather";
import { useWeather } from "../../contexts/WeatherContext";
import { usePlanAlerts } from "../hooks/usePlanAlerts";
import { useCultivationPlan } from '../../contexts/CultivationPlanContext';
import { FaMicrochip, FaSatelliteDish, FaWifi } from 'react-icons/fa';



const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const planStats = usePlanStatistics();

  const { plans } = useCultivationPlan();
  const { fetchWeatherForPlan } = useWeather();
  const planWeather = usePlanWeather(plans, fetchWeatherForPlan);
  const planAlerts = usePlanAlerts(plans, planWeather);

  const alertBounce = () => {
    if (planAlerts.alerts.length !== 0) return true;
    else return false;

  }
  const currentYear = new Date().getFullYear();


  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: 'Leaving so soon?',
        html: `
        <div class="text-center">
          <p>Are you sure you want to logout?</p>
          <small class="text-gray-500">You'll need to login again to access your farm data.</small>
        </div>
      `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#059669',
        confirmButtonText: '<i class="fas fa-sign-out-alt"></i> Logout',
        cancelButtonText: '<i class="fas fa-times"></i> Cancel',
        background: '#f8f9fa',
        customClass: {
          confirmButton: 'px-4 py-2 rounded-lg',
          cancelButton: 'px-4 py-2 rounded-lg'
        }
      });

      if (result.isConfirmed) {
        // Show loading
        const loadingToast = Swal.fire({
          title: 'Signing out...',
          text: 'Please wait while we secure your session',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        // Perform logout
        await logout();

        // Close dropdown/modal
        setIsOpen(false);

        // Close loading
        await loadingToast.close();

        // Show success and redirect
        await Swal.fire({
          title: '👋 Goodbye!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: '#f0fdf4',
          iconColor: '#10b981'
        });

        // Redirect to home
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);

      await Swal.fire({
        title: '😕 Something went wrong',
        text: 'Failed to logout. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
        background: '#fef2f2',
        iconColor: '#ef4444'
      });
    }
  };
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '🌱';
  };

  const getFarmColor = (str) => {
    const farmColors = [
      'bg-gradient-to-r from-green-500 to-emerald-600',      // Fresh green
      'bg-gradient-to-r from-amber-500 to-orange-500',       // Harvest orange
      'bg-gradient-to-r from-emerald-500 to-teal-600',       // Deep green
      'bg-gradient-to-r from-lime-400 to-green-600',         // Bright green
      'bg-gradient-to-r from-yellow-500 to-amber-600',       // Sunflower
      'bg-gradient-to-r from-brown-500 to-amber-700',        // Earth tones
      'bg-gradient-to-r from-green-600 to-emerald-700',      // Forest green
      'bg-gradient-to-r from-amber-400 to-orange-500',       // Autumn
    ];
    const index = str?.length % farmColors?.length || 0;
    return farmColors[index];
  };

  const getFarmIcon = (str) => {
    const farmIcons = ['🌱', '🚜', '🌾', '👨‍🌾', '👩‍🌾', '🌻', '🌽'];
    const index = str?.length % farmIcons.length || 0;
    return farmIcons[index];
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Farm-Themed Avatar Button - Updated Design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
    flex items-center gap-4
    px-3 py-2 rounded-xl
    transition-all duration-400
    hover:shadow-xl hover:scale-[1.02]
    focus:outline-none focus:ring-4 focus:ring-emerald-100
    cursor-pointer
    group
    overflow-visible
    relative 
    z-0
  "
      >
        {/* User icon section */}
        <div className="relative">
          <div className="
      relative w-12 h-12 rounded-full
      bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700
      flex items-center justify-center
      shadow-inner
      transition-all duration-500
      group-hover:scale-105
    ">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              className="drop-shadow-lg"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>

            {/* Status/Notification Dot */}

            <div className={`
    absolute -top-0.5 -right-0.5
    w-6 h-6
    ${alertBounce() ? "bg-red-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm animate-bounce " : ""} `}>
              {planAlerts.alerts.length > 0 && (<span className="text-[8px] font-bold text-white">{planAlerts.alerts.length}</span>)}
            </div>
          </div>

          {/* Medium pulse ring */}
          <div className="
      absolute -inset-3
      rounded-full
      border-3 border-emerald-400/40
      opacity-0
      group-hover:opacity-100
      group-hover:animate-pulse
      transition-opacity duration-600
      pointer-events-none
      animation-duration-1800ms
    "></div>
        </div>

        {/* Background pulse effect */}
        <div className="
    absolute inset-0
    rounded-xl
    bg-gradient-to-r from-emerald-200/30 to-green-200/30
    opacity-0
    group-hover:opacity-100
    group-hover:animate-pulse
    transition-opacity duration-700
    pointer-events-none
    -z-10
    animation-duration-2200ms
  "></div>
      </button>

      {/* Floating Farm Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-green-50/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-200/50 z-50 animate-fade-in">
          {/* Header with Farm-themed Background */}
          <div className="relative p-6 border-b border-green-400/50 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-t-2xl">
            {/* Decorative farm elements */}
            <div className="absolute top-6 right-4 text-5xl opacity-70">
              {getFarmIcon(currentUser?.firstName)}
            </div>

            <div className="flex items-center space-x-4">
              <div className={`
            flex items-center justify-center w-14 h-14 rounded-full 
            ${getFarmColor(currentUser?.firstName)} text-white font-bold text-lg
            shadow-md border-2 border-white/90
          `}>
                {getInitials(currentUser?.firstName)}{getInitials(currentUser?.lastName)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-green-700 truncate">
                  {currentUser?.firstName || 'Farmer'}
                </h3>
                <p className="text-sm text-gray-700 truncate">
                  {currentUser?.email || 'farmer@example.com'}
                </p>
              </div>
            </div>
          </div>

          {currentUser?.role === "farmer" ? (
            <div>
              {/* Menu Items with Farm Icons */}
              <div className="p-2">
                <FarmMenuItem
                  icon="👨‍🌾"
                  label="My Farm Dashboard"
                  description="View and edit your farm details"
                  onClick={() => {
                    navigate('/dashboard');
                    setIsOpen(false);
                  }}
                />
                <FarmMenuItem
                  icon="🌾"
                  label="Crop Plans"
                  description="Manage your cultivation plans"
                  onClick={() => {
                    navigate('/planning');
                    setIsOpen(false);
                  }}
                />


                <FarmMenuItem
                  icon={<FaWifi size={20} color="#9C27B0" />}
                  label="IoT Devices"
                  description="Manage your devices"
                  onClick={() => {
                    navigate('/device-management')
                    setIsOpen(false);
                  }}
                />
                {/* Additional menu items can be added here */}
              </div>
            </div>
          ) : null}

          {/* Footer with Logout */}
          <div className="p-4 border-t border-green-200/50 bg-white/50 rounded-b-2xl">
            <button
  onClick={handleLogout}
  className="w-full flex items-center justify-center space-x-2 px-2 py-3 
           bg-yellow-500 text-white 
           rounded-xl font-semibold shadow-lg hover:shadow-xl 
           transform transition-all duration-200 hover:scale-105"
>
  {currentUser?.role === 'admin' ? (
    <>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span>Admin Logout</span>
    </>
  ) : (
    <>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      <span>Leave Farm</span>
    </>
  )}
</button>

            {/* Farm Stats */}
            <div className="flex justify-between mt-3 text-xs text-green-600">
              <span>🌱 Season: {currentYear}</span>
              <span>✅ Active Plans: {plans.length || 0} </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Farm-themed Menu Item
const FarmMenuItem = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-start space-x-3 p-4 rounded-xl text-left transition-all duration-200 group hover:bg-white/80 border border-transparent hover:border-green-200/50 mb-1 last:mb-0"
  >
    <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200 mt-1">
      {icon}
    </span>
    <div className="flex-1">
      <span className="font-semibold text-green-800 group-hover:text-green-900 block">
        {label}
      </span>
      <span className="text-xs text-green-600 group-hover:text-green-700 block mt-1">
        {description}
      </span>
    </div>
    <span className="text-green-400 group-hover:text-green-600 transform group-hover:translate-x-1 transition-all duration-200 mt-1">
      →
    </span>
  </button>
);

export default UserMenu;