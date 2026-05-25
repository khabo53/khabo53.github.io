import React, { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext"; 
import { signOut } from "firebase/auth";

const Header: React.FC = () => { 
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userName, userEmail, userRole, loading } = useAuth(); // ← Get everything from AuthContext
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isAdmin = userRole === 'admin';

  // Pages where header should NOT be shown
  const noHeaderPaths = ["/login", "/membership"];
  const showHeader = !noHeaderPaths.includes(location.pathname);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      navigate("/");
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // If on login or membership page, don't render header
  if (!showHeader) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="https://pbs.twimg.com/profile_images/1935214019440152576/qXWVglEh_400x400.png"
                alt="Basotho Solutions Logo"
                className="h-14 w-14 rounded-full"
              />
              <span className="ml-2 text-sm opacity-90">Basotho Solutions</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img
              src="https://pbs.twimg.com/profile_images/1935214019440152576/qXWVglEh_400x400.png"
              alt="Basotho Solutions Logo"
              className="h-14 w-14 rounded-full"
            />
            <span className="ml-2 text-sm opacity-90">Basotho Solutions</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => navigate('/')} className="hover:text-yellow-300 transition-colors">
              Home
            </button>
            <a href="#services" className="hover:text-yellow-300 transition-colors">Services</a>
            <button onClick={() => navigate('/scholarships')} className="hover:text-yellow-300 transition-colors">
              Opportunities
            </button>
            <a href="#blog" className="hover:text-yellow-300 transition-colors">Blog</a>
            
            {/* Show Admin Panel link only for admin users */}
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="hover:text-yellow-300 transition-colors">
                Admin
              </button>
            )}
          </nav>

          {/* User Section / Login Button */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{userName || user.email?.split('@')[0]}</span>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold">{userName || user.email?.split('@')[0]}</p>
                      <p className="text-xs text-gray-500 truncate">{userEmail || user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-transparent border border-white hover:bg-white hover:text-green-600 px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/membership')}
                  className="bg-yellow-400 text-gray-800 hover:bg-yellow-300 px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                >
                  Join
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden bg-white text-gray-800 rounded-lg shadow-lg mt-2">
            <div className="flex flex-col space-y-2 p-4">
              <button 
                onClick={() => {
                  navigate('/');
                  setIsMenuOpen(false);
                }}
                className="text-left hover:text-green-600 py-2 border-b"
              >
                Home
              </button>
              <a 
                href="#services" 
                className="hover:text-green-600 py-2 border-b"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </a>
              <button
                onClick={() => {
                  navigate('/scholarships');
                  setIsMenuOpen(false);
                }}
                className="text-left hover:text-green-600 py-2 border-b"
              >
                Opportunities
              </button>
              <a 
                href="#blog" 
                className="hover:text-green-600 py-2 border-b"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </a>
              
              {/* Admin link in mobile menu */}
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsMenuOpen(false);
                  }}
                  className="text-left hover:text-green-600 py-2 border-b"
                >
                  Admin Panel
                </button>
              )}
              
              {!user && (
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="text-left hover:text-green-600 py-2 border-b"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate('/membership');
                      setIsMenuOpen(false);
                    }}
                    className="text-left hover:text-green-600 py-2 border-b"
                  >
                    Join
                  </button>
                </>
              )}
              
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-red-600 hover:text-red-700 py-2 border-b"
                >
                  Logout
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;