import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Header: React.FC = () => { 
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Pages where header should NOT be shown
  const noHeaderPaths = ["/login", "/membership"];
  const showHeader = !noHeaderPaths.includes(location.pathname);

  // Get current user info
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);
        
        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || user.email?.split('@')[0] || "User");
            setIsAdmin(userData.role === "admin");
          } else {
            setUserName(user.email?.split('@')[0] || "User");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName(user.email?.split('@')[0] || "User");
        }
      } else {
        setUserName(null);
        setUserEmail(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
            {userName ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{userName}</span>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold">{userName}</p>
                      <p className="text-xs text-gray-500 truncate">{userEmail}</p>
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
              
              {!userName && (
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
              
              {userName && (
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