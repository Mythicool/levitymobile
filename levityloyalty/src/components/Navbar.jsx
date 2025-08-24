import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Coffee, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white shadow-lg border-b border-orange-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-orange-600" />
            <span className="text-xl font-bold text-orange-800">Levity Loyalty</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-amber-700 hover:text-amber-900 font-medium">
                  Dashboard
                </Link>
                <Link to="/rewards" className="text-amber-700 hover:text-amber-900 font-medium">
                  Rewards
                </Link>
                <Link to="/checkin" className="text-amber-700 hover:text-amber-900 font-medium">
                  Check In
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-amber-600">
                    {user.points} points
                  </span>
                  <Link to="/profile" className="flex items-center space-x-1 text-amber-700 hover:text-amber-900">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-amber-700 hover:text-amber-900"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-amber-700 hover:text-amber-900 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-amber-700 hover:bg-amber-50"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-100">
            {user ? (
              <div className="space-y-3">
                <div className="px-3 py-2 text-sm text-amber-600">
                  Welcome, {user.name} • {user.points} points
                </div>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/rewards"
                  className="block px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Rewards
                </Link>
                <Link
                  to="/checkin"
                  className="block px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Check In
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
