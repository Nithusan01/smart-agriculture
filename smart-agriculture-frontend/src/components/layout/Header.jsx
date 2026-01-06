import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import UserMenu from './UserMenu';

const Header = () => {
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout()
    navigate("/login")
    setIsMobileMenuOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path ? 'border-b-2 border-yellow-400' : ''
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Track scroll position for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest('.mobile-menu-container') && !e.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMobileMenuOpen]);

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (currentUser?.role === "admin") {
      // Admin only sees Admin and About Us
      return (
        <div className="flex gap-3 lg:gap-6 font-bold text-lg lg:text-xl">
          <Link 
            to="/admin" 
            className={`px-3 lg:px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-green-700/40 ${isActive('/admin')}`}
          >
          </Link>
          
        </div>
      )
    } else if (currentUser) {
      // Regular user navigation
      return (
        <div className="flex flex-wrap justify-center gap-2 lg:gap-6 font-bold text-sm sm:text-base lg:text-2xl">
          <Link 
            to="/dashboard" 
            className={`px-2 sm:px-3 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl transition-colors duration-300 hover:bg-green-700/40 ${isActive('/dashboard')}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/planning" 
            className={`px-2 sm:px-3 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl transition-colors duration-300 hover:bg-green-700/40 ${isActive('/planning')}`}
          >
            Planning
          </Link>
          <Link 
            to="/device-management" 
            className={`px-2 sm:px-3 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl transition-colors duration-300 hover:bg-green-700/40 ${isActive('/device-management')}`}
          >
            Iot Devices
          </Link> 
          <Link 
            to="/chatbot" 
            className={`px-2 sm:px-3 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl transition-colors duration-300 hover:bg-green-700/40 ${isActive('/chatbot')}`}
          >
            Diseases
          </Link>
          
        </div>
      )
    } else {
      // Not logged in
      return (
        <div className="flex gap-3 lg:gap-6 font-bold text-base lg:text-xl">
          <Link 
            to="/" 
           
          >
          </Link>
        </div>
      )
    }
  }

  // Check if user is on auth pages
  const isOnAuthPage = () => {
    return location.pathname === '/login' || location.pathname === '/register';
  }

  // Mobile navigation items based on user role
  const getMobileNavigationItems = () => {
    if (currentUser?.role === "admin") {
      return (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-3 font-bold text-lg">
            <Link to="/admin" className={`px-4 py-3 hover:bg-green-700/20 rounded-lg ${isActive('/admin')}`} onClick={closeMobileMenu}>
              Admin Dashboard
            </Link>
            <Link to="/" className={`px-4 py-3 hover:bg-green-700/20 rounded-lg ${isActive('/')}`} onClick={closeMobileMenu}>
              About Us
            </Link>
          </div>
          <div className="flex flex-col space-y-3 border-t border-green-600 border-opacity-20 pt-4">
            <button onClick={handleLogout} className="flex items-center justify-center gap-3 hover:bg-green-700/20 px-4 py-3 rounded-lg text-lg">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )
    } else if (currentUser) {
      return (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-3 font-bold text-lg">
            <Link to="/dashboard" className={`px-4 py-3 hover:bg-green-700/20 rounded-lg ${isActive('/dashboard')}`} onClick={closeMobileMenu}>
              Dashboard
            </Link>
            <Link to="/planning" className={`px-4 py-3 hover:bg-green-700/20 rounded-lg ${isActive('/planning')}`} onClick={closeMobileMenu}>
              Planning
            </Link>
            <Link to="/device-management" className={`px-4 py-3 hover:bg-green-700/20 rounded-lg ${isActive('/device-management')}`} onClick={closeMobileMenu}>
              IoT Devices
            </Link>
            <Link to="/chatbot" className={`px-4 py-3 hover:bg-green-700/20 rounded-lg ${isActive('/chatbot')}`} onClick={closeMobileMenu}>
              Disease Management
            </Link>
          </div>
          <div className="flex flex-col space-y-3 border-t border-green-600 border-opacity-20 pt-4">
            <button onClick={handleLogout} className="flex items-center justify-center gap-3 hover:bg-green-700/20 px-4 py-3 rounded-lg text-lg">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="flex flex-col space-y-4">
          {(location.pathname === "/register" || location.pathname === "/") && (
            <Link to="/login" className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-4 py-3 rounded-lg text-center font-bold transition-colors duration-300" onClick={closeMobileMenu}>
              Login
            </Link>
          )}
          {(location.pathname === "/login" || location.pathname === "/") && (
            <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg text-center font-bold transition-colors duration-300" onClick={closeMobileMenu}>
              Sign Up
            </Link>
          )}
        </div>
      )
    }
  }

  return (
    <header className={`fixed top-0 left-0 w-full z-50 py-2 transition-all text-green-600 duration-500 ease-out ${
      isScrolled || isMobileMenuOpen  || isOnAuthPage() || location.pathname == "/"
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
    } ${isScrolled ? 'animate-fade-in-down' : ''}`}>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-white z-10">
            <i className="fas fa-leaf text-yellow-400 text-3xl sm:text-4xl md:text-5xl"></i>
            <span className='text-xl sm:text-2xl md:text-3xl text-green-600 hidden xs:inline'>AgriSmart</span>
          </Link>
          
          {/* Desktop Navigation - Responsive positioning */}
          <nav className="hidden lg:flex items-center mx-4 flex-1 justify-end">
            {getNavigationItems()}
          </nav>

          {/* Right Side - Responsive buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-4  ">
                <UserMenu />
              </div> 
            ) : ( 
              <div className="flex gap-3">
                {(location.pathname === "/register" || location.pathname === "/") && (  
                  <Link 
                    to="/login" 
                    className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-4 md:px-5 py-2 rounded-lg font-bold text-sm md:text-base transition-colors duration-300"
                  >
                    Login
                  </Link>
                )}
                {(location.pathname === "/login" || location.pathname === "/") && (
                  <Link 
                    to="/register" 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 md:px-5 py-2 rounded-lg font-bold text-sm md:text-base transition-colors duration-300"
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-green-700 text-2xl p-2 mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Tablet Navigation (hidden on mobile, shown on tablet, hidden on desktop) */}
        <nav className="hidden md:flex lg:hidden justify-center mt-3 mb-2">
          {getNavigationItems()}
        </nav>

        {/* Mobile Menu - Responsive overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mobile-menu-container animate-slide-down">
            <div className="md:hidden mt-4 pb-4 border-t border-green-600 border-opacity-20 pt-4">
              {getMobileNavigationItems()}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header