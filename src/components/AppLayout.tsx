import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import BlogSection from './BlogSection';
import AdminPanel from './AdminPanel';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ServicesSection />
      <BlogSection />
      <AdminPanel />
      <Footer />
      
    </div>
    
  );
};

export default AppLayout;
