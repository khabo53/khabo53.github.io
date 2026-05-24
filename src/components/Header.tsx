import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";

const Header: React.FC = () => { 
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Pages where header should NOT be shown
  const noHeaderPaths = ["/login", "/membership"];
  const showHeader = !noHeaderPaths.includes(location.pathname);

  // If on login or membership page, don't render header
  if (!showHeader) {
    return null;
  }

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
          
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => navigate('/')} className="hover:text-yellow-300 transition-colors">
              Home
            </button>
            <a href="#services" className="hover:text-yellow-300 transition-colors">Services</a>
            <button onClick={() => navigate('/scholarships')} className="hover:text-yellow-300 transition-colors">
              Opportunities
            </button>
            <a href="#blog" className="hover:text-yellow-300 transition-colors">Blog</a>
            <button onClick={() => navigate('/login')} className="hover:text-yellow-300 transition-colors">
              LogIn
            </button>
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

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

              <button
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
                className="text-left hover:text-green-600 py-2 border-b"
              >
                LogIn
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;