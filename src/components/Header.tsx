import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => { 
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img
             src="https://pbs.twimg.com/profile_images/1935214019440152576/qXWVglEh_400x400.png"
              alt="Basotho Solutions Logo"
              className="h-14 w-14 rounded-full"
            />
            <span className="ml-2 text-sm opacity-90">Opportunity Hub</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="hover:text-yellow-300 transition-colors">Home</a>
            <a href="#services" className="hover:text-yellow-300 transition-colors">Services</a>
            <a onClick={() => navigate('/scholarships')} 
             href="#opportunities" className="hover:text-yellow-300 transition-colors">Opportunities</a>
            <a href="#blog" className="hover:text-yellow-300 transition-colors">Blog</a>
            <a href="#admin" className="hover:text-yellow-300 transition-colors">Admin</a>
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/*{isMenuOpen && (
          <nav className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <a href="#home" className="hover:text-yellow-300 transition-colors py-2">Home</a>
              <a href="#services" className="hover:text-yellow-300 transition-colors py-2">Services</a>
              <a   
              href="#opportunities" className="hover:text-yellow-300 transition-colors py-2">Opportunities</a>
              <a href="#blog" className="hover:text-yellow-300 transition-colors py-2">Blog</a>
              <a href="#admin" className="hover:text-yellow-300 transition-colors py-2">Admin</a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};*/}
{isMenuOpen && (
  <nav className="md:hidden bg-white text-gray-800 rounded-lg shadow-lg mt-2">
    <div className="flex flex-col space-y-2 p-4">
      <a 
        href="#home" 
        className="hover:text-green-600 py-2 border-b"
        onClick={() => setIsMenuOpen(false)}
      >
        Home
      </a>

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

      <a 
        href="#admin" 
        className="hover:text-green-600 py-2"
        onClick={() => setIsMenuOpen(false)}
      >
        Admin
      </a>
    </div>
  </nav>
)}
</div>
</header>
  );
};
export default Header;