import React from 'react';
import ImageCarousel from './ImageCarousel';
import { useNavigate } from "react-router-dom";


const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const heroImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=400&fit=crop',
      alt: 'Agricultural innovation',
      title: 'Transforming Agriculture'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&h=400&fit=crop',
      alt: 'Renewable energy solutions',
      title: 'Renewable Energy Solutions'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1624324378932-68e20f332982?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2xpbWF0ZSUyMGNoYW5nZXxlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      alt: 'Climate change action',
      title: 'Climate Action Today'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200&h=400&fit=crop',
      alt: 'Sustainable development',
      title: 'Sustainable Development'
    }
  ];

  return (
    <section id="home" className="relative">
      <ImageCarousel images={heroImages} autoPlay={true} interval={4000} />
      
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-50"></div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-6xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 animate-fade-in">
            Unlock Opportunities. Empower Youth. Build a Sustainable Future.
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
             Basotho Solutions – Your Opportunity Hub for Growth and Impact.
          </p>
          {/*<div className="space-x-4">*/}
          <div className="flex flex-wrap justify-center gap-4">
            {/* <Link
              to="/membership"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Join as a Member
            </Link>
            <Link
              to="/consulting"
              className="bg-white text-green-700 border-2 border-white hover:bg-green-100 px-6 py-3 rounded-full font-semibold transition-all"
            >
              Book Consulting
            </Link>
            <Link
              to="/scholarships"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-full font-semibold transition-all"
            >
              Explore Scholarships
            </Link> */}
            <button  onClick={() => navigate('/login')}
             className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg">
              Join as a Member
            </button>
            <button  onClick={() => navigate('/consulting')}
             className="bg-white text-green-700 border-2 border-white hover:bg-green-100 px-6 py-3 rounded-full font-semibold transition-all">
              Book Consulting
            </button>
            <button  onClick={() => navigate('/scholarships')}
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-full font-semibold transition-all">
              Explore Opportunities
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;