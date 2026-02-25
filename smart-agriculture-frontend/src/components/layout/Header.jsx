import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import UserMenu from './UserMenu';
import Swal from 'sweetalert2'

const Header = () => {
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // const handleLogout = () => {
  //   logout()
  //   navigate("/login")
  //   setIsMobileMenuOpen(false)
  // }


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





 const isActive = (path) => {
  return location.pathname === path
    ? 'text-green-600 after:scale-x-100'
    : 'text-gray-700 after:scale-x-0 hover:text-green-600 hover:after:scale-x-100';
};
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-btn')) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isOnAuthPage = () => {
    return location.pathname === '/login' || location.pathname === '/register';
  }

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (currentUser?.role === "admin") {
      return (
        <div className="flex gap-3">
          <Link 
            to="/admin" 
            className={`px-5 py-2.5 rounded-lg font-semibold text-xl transition-colors hover:bg-gray-100 ${isActive('/admin')}`}
          >
            Admin
          </Link>
        </div>
      )
    } else if (currentUser) {
      return (
       <div className="flex gap-3">
  {[
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/planning', label: 'Planning' },
    { to: '/device-management', label: 'Devices' },
    { to: '/chatbot', label: 'Diseases' },
  ].map(({ to, label }) => (
    <Link
      key={to}
      to={to}
      className={`relative pb-1 px-2.5 py-2.5 font-semibold text-xl transition-colors duration-200
        after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-green-500
        after:transition-transform after:duration-300 after:ease-in-out after:origin-center
        ${isActive(to)}`}
    >
      {label}
    </Link>
  ))}
</div>
      )
    }
    return null;
  }

  // Mobile navigation items
  const getMobileNavigationItems = () => {
    if (currentUser?.role === "admin") {
      return (
        <>
          <Link 
            to="/admin" 
            className={`px-5 py-3.5 rounded-lg font-semibold text-base ${isActive('/admin')}`} 
            onClick={closeMobileMenu}
          >
            Admin
          </Link>
          <button 
            onClick={handleLogout} 
            className="px-5 py-3.5 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-base flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </>
      )
    } else if (currentUser) {
      return (
        <>
          <Link 
            to="/dashboard" 
            className={`px-5 py-3.5 rounded-lg font-semibold text-base ${isActive('/dashboard')}`} 
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>
          <Link 
            to="/planning" 
            className={`px-5 py-3.5 rounded-lg font-semibold text-base ${isActive('/planning')}`} 
            onClick={closeMobileMenu}
          >
            Planning
          </Link>
          <Link 
            to="/device-management" 
            className={`px-5 py-3.5 rounded-lg font-semibold text-base ${isActive('/device-management')}`} 
            onClick={closeMobileMenu}
          >
            Devices
          </Link>
          <Link 
            to="/chatbot" 
            className={`px-5 py-3.5 rounded-lg font-semibold text-base ${isActive('/chatbot')}`} 
            onClick={closeMobileMenu}
          >
            Diseases
          </Link>
          <button 
            onClick={handleLogout} 
            className="px-5 py-3.5 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-base flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </>
      )
    } else {
      return (
        <>
          {(location.pathname === "/register" || location.pathname === "/") && (
            <Link 
              to="/login" 
              className="px-5 py-3.5 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg font-semibold text-base text-center" 
              onClick={closeMobileMenu}
            >
              Login
            </Link>
          )}
          {(location.pathname === "/login" || location.pathname === "/") && (
            <Link 
              to="/register" 
              className="px-5 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-base text-center" 
              onClick={closeMobileMenu}
            >
              Sign Up
            </Link>
          )}
        </>
      )
    }
  }

  return (
   <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
  isScrolled
    ? 'bg-transparent pointer-events-none'
    : isOnAuthPage() || ["/", "/planning", "/chatbot", "/dashboard", "/device-management"].includes(location.pathname)
      ? 'bg-white shadow-md border-b border-gray-200'
      : 'bg-gray-100 backdrop-blur-sm'
}`}>
  <div className={`transition-all duration-300 ${
    isScrolled
      ? 'mx-auto mt-3 max-w-fit px-2 py-0 rounded-3xl bg-white shadow-lg border border-gray-200 pointer-events-auto'
      : ''
  }`}>
    {/* your nav content here */}
    <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 pr-3">
            <i className="fas fa-leaf text-green-600 text-5xl"></i>
            {!isScrolled && (
            <span className="text-4xl font-bold text-gray-900">AgriSmart</span>
            )}
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            {getNavigationItems()}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
              {!isScrolled &&(
              <button 
            onClick={handleLogout} 
            className="px-5 py-3.5 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-base flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
              ) }
              
              <UserMenu />
              </>
            
            ) : (
              <div className="flex gap-3">
                {(location.pathname === "/register" || location.pathname === "/") && (
                  <Link 
                    to="/login" 
                    className="px-5 py-2.5 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg font-semibold text-base transition-colors"
                  >
                    Login
                  </Link>
                )}
                {(location.pathname === "/login" || location.pathname === "/") && (
                  <Link 
                    to="/register" 
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-base transition-colors"
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 text-2xl p-2 menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </div>

       {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mobile-menu bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            {getMobileNavigationItems()}
          </div>
        </div>
      )}

  </div>
     
    </header>
  )
}

export default Header