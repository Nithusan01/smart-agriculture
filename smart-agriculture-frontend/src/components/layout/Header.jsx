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

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (currentUser?.role === "admin") {
      // Admin only sees Admin and About Us
      return (
        <div className="flex gap-6 font-bold text-xl">
          <Link 
            to="/admin" 
          >
          </Link>
          
        </div>
      )
    } else if (currentUser) {
      // Regular user navigation
      return (
        <div className="flex gap-6 font-bold text-xl">
          <Link 
            to="/dashboard" 
            className={`px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-green-700/40 rounded ${isActive('/dashboard')}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/planning" 
            className={`px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-green-700/40 rounded ${isActive('/planning')}`}
          >
            Planning
          </Link>
          <Link 
            to="/chatbot" 
            className={`px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-green-700/40 rounded ${isActive('/chatbot')}`}
          >
            Diseases
          </Link>

          <Link 
            to="/device-management" 
            className={`px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-green-700/40 rounded ${isActive('/device-management')}`}
          >
           Iot devices
          </Link>

          {/* <Link 
            to="/" 
            className={`px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-green-700/40 rounded ${isActive('/')}`}
          >
            About 
          </Link> */}

        </div>
      )
    } else {
      // Not logged in
      return (
        <div className="flex gap-6 font-bold">
          <Link 
            to="/"           >
          </Link>
        </div>
      )
    }
  }

  // Mobile navigation items based on user role
  const getMobileNavigationItems = () => {
    if (currentUser?.role === "admin") {
      return (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-3 font-bold">
            <Link to="/admin" className={`px-3 py-2 hover:bg-green-700/40 rounded ${isActive('/admin')}`} onClick={closeMobileMenu}>
              Admin Dashboard
            </Link>
            <Link to="/" className={`px-3 py-2 hover:bg-green-700/40 rounded ${isActive('/')}`} onClick={closeMobileMenu}>
              About Us
            </Link>
          </div>
          <div className="flex flex-col space-y-3 border-t border-white border-opacity-20 pt-4">
            <button onClick={handleLogout} className="flex items-center gap-2 hover:bg-green-700/40 px-3 py-2 rounded">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )
    } else if (currentUser) {
      return (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-3 font-bold">
            <Link to="/dashboard" className={`px-3 py-2 hover:bg-green-700/40 rounded ${isActive('/dashboard')}`} onClick={closeMobileMenu}>
              Dashboard
            </Link>
            <Link to="/planning" className={`px-3 py-2 hover:bg-green-700/40 rounded ${isActive('/planning')}`} onClick={closeMobileMenu}>
              Planning
            </Link>
            <Link to="/chatbot" className={`px-3 py-2 hover:bg-green-700/40 rounded ${isActive('/chatbot')}`} onClick={closeMobileMenu}>
              Disease Mgmt
            </Link>
            <Link to="/" className={`px-3 py-2 hover:bg-green-700/40 rounded ${isActive('/')}`} onClick={closeMobileMenu}>
              About
            </Link>
          </div>
          <div className="flex flex-col space-y-3 border-t border-white border-opacity-20 pt-4">
            <button onClick={handleLogout} className="flex items-center gap-2 hover:bg-green-700/40 px-3 py-2 rounded">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="flex flex-col space-y-4">
          <Link to="/login" className="border border-white text-white hover:bg-green-700/40 px-4 py-3 rounded text-center" onClick={closeMobileMenu}>
            Login
          </Link>
          <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded text-center" onClick={closeMobileMenu}>
            Sign Up
          </Link>
        </div>
      )
    }
  }

  return (
    <header className={`fixed top-0 left-0 w-full z-50 py-2 transition-all text-green-600 duration-500 ease-out ${
      isScrolled || isMobileMenuOpen || isActive('/') || currentUser?.role === "admin"|| isActive('/login') || isActive('/register') || isActive('/dashboard') || isActive('/planning') || isActive('/chatbot') || isActive('/device-management')
        ? 'bg-white/80 backdrop-blur-3xl shadow-2xl shadow-black/5 border-b border-gray-100/80' 
        : 'bg-transparent'
    } ${isScrolled ? 'animate-fade-in-down' : ''}`}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center relative">
          {/* Logo */}
          
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white z-10">
            <i className="fas fa-leaf text-yellow-400 text-5xl"></i>
            <span className='text-3xl text-green-600'>AgriSmart</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            {getNavigationItems()}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center z-10 ">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <UserMenu />
              </div> 
            ) : ( 
              <div className="flex gap-3">
                {isActive('/register') ? (
                <Link 
                  to="/login" 
                  className="bg-green-600 border-2 border-transparent hover:border-green-600  rounded-lg  font-bold text-white hover:bg-white hover:text-green-600  px-6 py-2 rounded transition-colors duration-300"
                >
                  Login
                </Link>
                ):(
                <Link 
                  to="/register" 
                  className="bg-yellow-400  border-2 border-transparent hover:border-yellow-400 rounded-lg font-bold hover:bg-white hover:text-yellow-400 text-white px-6 py-2 rounded transition-colors duration-300"
                >
                  Sign Up
                </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-green-700 text-2xl z-10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-green-700 border-opacity-20 pt-4">
            {getMobileNavigationItems()}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header