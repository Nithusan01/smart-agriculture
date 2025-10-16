// src/components/UserMenu.jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { usePlanStatistics } from "../hooks/usePlanStatistics";


const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
   const planStats = usePlanStatistics();

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
    const index = str?.length % farmColors.length || 0;
    return farmColors[index];
  };

  const getFarmIcon = (str) => {
    const farmIcons = ['🌱', '🚜', '🌾', '👨‍🌾', '👩‍🌾', '🏞️', '🌻', '🌽'];
    const index = str?.length % farmIcons.length || 0;
    return farmIcons[index];
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Farm-Themed Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-full 
          ${getFarmColor(currentUser?.name)} text-white font-semibold
          shadow-lg hover:shadow-xl transform transition-all duration-200 
          hover:scale-105 active:scale-95 border-2 border-white/30
          focus:outline-none focus:ring-4 focus:ring-green-200
          ring-2 ring-green-100
        `}
      >
        <span className="text-sm drop-shadow-md">
          {getInitials(currentUser?.firstName)}
        </span>
        
        {/* Online Status Indicator */}
        <div className="absolute -bottom-1 -right-1">
          <div className="w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
        </div>
      </button>

      {/* Floating Farm Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-green-50/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-200/50 z-50 animate-fade-in">
          {/* Header with Farm-themed Background */}
          <div className="relative p-6 border-b border-green-200/50 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-t-2xl">
            {/* Decorative farm elements */}
            <div className="absolute top-2 right-2 text-2xl opacity-20">
              {getFarmIcon(currentUser?.firstName)}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`
                flex items-center justify-center w-14 h-14 rounded-full 
                ${getFarmColor(currentUser?.firstName)} text-white font-bold text-lg
                shadow-lg border-2 border-white/40
              `}>
                {getInitials(currentUser?.firstName)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {currentUser?.firstName || 'Farmer'}
                </h3>
                <p className="text-sm text-green-700 truncate">
                  {currentUser?.email || 'farmer@example.com'}
                </p>
      
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-sm"></div>
                  <span className="text-xs text-green-600 font-medium"> {currentUser.role}</span>
                </div>
              </div>
            </div>
          </div>
          { currentUser.role === "farmer" ? (<div> 
          {/* Menu Items with Farm Icons */}
          <div className="p-2">
            <FarmMenuItem 
              icon="👨‍🌾" 
              label="My Farm Profile" 
              description="View and edit your farm details"
              onClick={() => {navigate('/dashboard');
                setIsOpen(false);
              
                // Navigate to profile
              }}
            />
            <FarmMenuItem 
              icon="🌾" 
              label="Crop Plans" 
              description="Manage your cultivation plans"
              onClick={() => {navigate('/planning');
                setIsOpen(false);
                // Navigate to planning
                
              }}
            />
            {/* <FarmMenuItem 
              icon="🏞️" 
              label="My Fields" 
              description="View all your farming sectors"
              onClick={() => {
                setIsOpen(false);
                // Navigate to fields
              }}
            />
            <FarmMenuItem 
              icon="📊" 
              label="Farm Analytics" 
              description="Crop performance & insights"
              onClick={() => {
                setIsOpen(false);
                // Navigate to analytics
              }}
            />

            <FarmMenuItem 
              icon="⚙️" 
              label="Farm Settings" 
              description="Configure your farm preferences"
              onClick={() => {
                setIsOpen(false);
                // Navigate to settings
              }}
            /> */}

          </div>
          </div>
): null }
          {/* Footer with Logout */}
          <div className="p-4 border-t border-green-200/50 bg-white/50 rounded-b-2xl">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                       bg-gradient-to-r from-amber-500 to-orange-500 text-white 
                       rounded-xl font-semibold shadow-lg hover:shadow-xl 
                       transform transition-all duration-200 hover:scale-105 
                       active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-200
                       border border-amber-400"
            >
              <span>🚜</span>
              <span>Leave Farm</span>
            </button>
            
            {/* Farm Stats */}
            <div className="flex justify-between mt-3 text-xs text-green-600">
              <span>🌱 Season: Spring 2025</span>
              <span>✅ Active Plans: {planStats.planted} </span>
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