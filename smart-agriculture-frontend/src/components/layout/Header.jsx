import React, { useState,useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import UserMenu from './UserMenu';

const Header = () => {
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false);


  const handleLogout = () => {
    logout()
    navigate('/')
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
      
      let current = "Home";
      navItems.forEach((id) => {
        const element = document.getElementById(id);
        if (element && window.scrollY >= element.offsetTop - 100) {
          current = id;
        }
      });
      setActiveSection(current);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);




  return (
    // <header className="bg-gradient-to-r from-green-700 to-lime-600 text-white shadow-lg z-50 py-4">
      <header className={`fixed top-0 left-0 w-full z-50 py-4 transition-all text-green-700 duration-500 ease-out ${
  isScrolled 
    ? 'bg-white/50  backdrop-blur-3xl shadow-2xl shadow-black/5 border-b border-gray-100/80   ' 
    : 'bg-transparent  '
} ${isScrolled ? 'animate-fade-in-down' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center relative">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white z-10">
            <i className="fas fa-leaf text-yellow-400 text-5xl"></i>
            <span className='text-3xl text-green-700 '>AgriSmart</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden  md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            {currentUser ? (
              <div className="flex  gap-6 font-bold text-xl">
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
                  to="/disease" 
                  className={`px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-green-700/40 rounded ${isActive('/disease')}`}
                >
                  Disease Mgmt
                </Link>
                <Link 
                  to="/" 
                  className={`px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-green-700/40 rounded ${isActive('/')}`}
                >
                  About Us
                </Link>
              </div>
            ) : (
              <div className="flex gap-6 font-bold">
                <Link 
                  to="/" 
                  className={`px-4 py-2 rounded-xl transition-colors duration-300 hover:bg-green-700/40 rounded ${isActive('/')}`}
                >
                  About Us
                </Link>
              </div>
            )}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center z-10">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <UserMenu />
                {/* <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-white hover:bg-green-700/40 px-4 py-2 rounded transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Logout</span>
                </button> */}
              </div>
            ) : (
              <div className="flex gap-3">
                <Link 
                  to="/login" 
                  className="bg-green-700 border rounded-xl border-white font-bold text-white hover:bg-green-500/40 px-6 py-2 rounded transition-colors duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-yellow-400 rounded-xl font-bold hover:bg-yellow-600 text-white px-6 py-2 rounded transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white text-2xl z-10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white border-opacity-20 pt-4">
            {currentUser ? (
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-3 font-bold">
                  <Link to="/dashboard" className={`px-3 py-2 hover:bg-green-700/40 rounded ${isActive('/dashboard')}`} onClick={closeMobileMenu}>Dashboard</Link>
                  <Link to="/planning" className={`px-3 py-2 hover:bg-green-700/40 rounded ${isActive('/planning')}`} onClick={closeMobileMenu}>Planning</Link>
                  <Link to="/disease" className={`px-3 py-2 hover:bg-green-700/40 rounded ${isActive('/disease')}`} onClick={closeMobileMenu}>Disease Mgmt</Link>
                </div>
                <div className="flex flex-col space-y-3 border-t border-white border-opacity-20 pt-4">
                  <button onClick={handleLogout} className="flex items-center gap-2 hover:bg-green-700/40 px-3 py-2 rounded">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link to="/login" className="border border-white text-white hover:bg-green-700/40 px-4 py-3 rounded text-center" onClick={closeMobileMenu}>Login</Link>
                <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded text-center" onClick={closeMobileMenu}>Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
