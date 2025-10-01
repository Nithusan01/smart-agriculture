import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'

const Header = () => {
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path ? 'bg-white bg-opacity-10' : ''
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-gradient-to-r from-[#2e7d32] to-[#4caf50] text-white shadow-md z-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center relative">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white z-10">
            <i className="fas fa-leaf text-2xl"></i>
            <span className="text-xl sm:text-2xl">AgriSmart IoT</span>
          </Link>
          
          {/* Desktop Navigation - Absolutely Centered */}
          <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            {currentUser ? (
              <>
                {/* Navigation Links */}
                <div className="flex gap-5 font-bold">
                  <Link 
                    to="/dashboard" 
                    className={`text-white px-4 py-2 rounded transition-colors duration-300 ${isActive('/dashboard')}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/planning" 
                    className={`text-white px-4 py-2 rounded transition-colors duration-300 ${isActive('/planning')}`}
                  >
                    Planning
                  </Link>
                  <Link 
                    to="/disease" 
                    className={`text-white px-4 py-2 rounded transition-colors duration-300 ${isActive('/disease')}`}
                  >
                    Disease Management
                  </Link>

                  <Link 
                  to="/" 
                  className={`text-white px-4 py-2 rounded transition-colors duration-300 ${isActive('/')}`}
                >
                  About Us
                </Link>

                </div>
              </>
            ) : (
              /* Navigation Links for non-logged in users */
              <div className="flex gap-5 font-bold">
               
                <Link 
                  to="/" 
                  className={`text-white px-4 py-2 rounded transition-colors duration-300 ${isActive('/')}`}
                >
                  About Us
                </Link>

              </div>
            )}
          </nav>

          {/* Right Side - User Menu or Auth Links */}
          <div className="hidden md:flex items-center z-10">
            {currentUser ? (
              /* User Menu */
              <div className="flex items-center gap-4">
                {/* User Info */}
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon 
                    icon={faUserCircle} 
                    className="text-white text-2xl" 
                  />
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-10 px-4 py-2 rounded transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              /* Auth Links for non-logged in users */
              <div className="flex gap-3">
                <Link 
                  to="/login" 
                  className="border border-white font-bold text-white hover:bg-white hover:bg-opacity-10 px-6 py-2 rounded transition-colors duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-[#ffa000] font-bold hover:bg-yellow-600 text-white px-6 py-2 rounded transition-colors duration-300"
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
                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-3 font-bold">
                  <Link 
                    to="/dashboard" 
                    className={`text-white px-3 py-2 rounded transition-colors duration-300 ${isActive('/dashboard')}`}
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/planning" 
                    className={`text-white px-3 py-2 rounded transition-colors duration-300 ${isActive('/planning')}`}
                    onClick={closeMobileMenu}
                  >
                    Planning
                  </Link>
                  <Link 
                    to="/disease" 
                    className={`text-white px-3 py-2 rounded transition-colors duration-300 ${isActive('/disease')}`}
                    onClick={closeMobileMenu}
                  >
                    Disease Management
                  </Link>
                </div>

                {/* Mobile User Menu */}
                <div className="flex flex-col space-y-3 border-t border-white border-opacity-20 pt-4">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <FontAwesomeIcon icon={faUserCircle} className="text-white text-2xl" />
                    <span>User Menu</span>
                  </div>
                  
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded transition-colors duration-300 text-left"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Mobile Auth Links */
              <div className="flex flex-col space-y-4">
                {/* Mobile Navigation Links for non-logged in */}
                <div className="flex flex-col space-y-3 font-bold">
                  <Link 
                    to="/" 
                    className={`text-white px-3 py-2 rounded transition-colors duration-300 ${isActive('/')}`}
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>

                  <Link 
                    to="/" 
                    className={`text-white px-3 py-2 rounded transition-colors duration-300 ${isActive('/')}`}
                    onClick={closeMobileMenu}
                  >
                    About
                  </Link>

                  <Link 
                    to="/features" 
                    className={`text-white px-3 py-2 rounded transition-colors duration-300 ${isActive('/features')}`}
                    onClick={closeMobileMenu}
                  >
                    Features
                  </Link>
                </div>
                
                <div className="flex flex-col space-y-3 border-t border-white border-opacity-20 pt-4">
                  <Link 
                    to="/login" 
                    className="border border-white text-white hover:bg-white hover:bg-opacity-10 px-4 py-3 rounded transition-colors duration-300 text-center"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-[#ffa000] hover:bg-yellow-600 text-white px-4 py-3 rounded transition-colors duration-300 text-center"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header