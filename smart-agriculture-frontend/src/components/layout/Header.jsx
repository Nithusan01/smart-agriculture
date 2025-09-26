import React from 'react'
import { Link, useLocation,useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';


const Header = () => {
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <i className="fas fa-leaf"></i>
            <span>AgriSmart IoT</span>
          </Link>
          
          <nav className="nav">
            {currentUser ? (
              <>
                <div className="nav-links ">
                  <Link to="dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                  <Link to="/sensors" className={isActive('/sensors')}>IoT Monitor</Link>
                  <Link to="/planning" className={isActive('/planning')}>Planning</Link>
                  <Link to="/disease" className={isActive('/disease')}>Disease Management</Link>
                </div>
                <div className="user-menu">
                  <div>
                  <FontAwesomeIcon icon={faUserCircle} size="3x" />
                  {/* <span> {currentUser.firstName}</span> */}
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                     <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </button>

                </div>
              </>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header