import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import cZeroLogo from './Logos/c_zero.jpg';
import mgpiLogo from './Logos/mgpi.jpg';
import artiscience from './Logos/artiscience.jpg';
import vaulte from './Logos/vaulte.jpeg';  
import afriprime from './Logos/afriprime.jpeg'; 

const Footer: React.FC = () => {
  const partners = [
      { name: "C-Zero", logo: cZeroLogo, url: 'https://www.c-zero.world/' },
      { name: "MGPI", logo: mgpiLogo, url: 'https://www.mgpinvestments.co.ls/' },
      { name: "Artiscience", logo: artiscience, url: 'https://articulatingscience.org/' },
      { name: "Vaulte", logo: vaulte, url: 'https://www.vaulte-us.com/' },
      { name: "Afriprime", logo: afriprime, url: 'https://linkfly.to/afriprime' },

  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* GRID SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ABOUT SECTION */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Basotho Solutions</h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering communities through innovative solutions in agriculture, renewable energy, and climate action. 
              Building a sustainable future for Lesotho and beyond.
            </p>

            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/1FGi5gicgW/"
                 target="_blank"
                 rel="noopener noreferrer" 
                 className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/basothosolutions?utm_source=qr&igsh=MWRpdmhxMXRkcG9mNA=="
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://twitter.com/BasothoSolutions"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/company/basotho-solutions/"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-gray-300 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="mailto:basothosolutions@gmail.com"
                 className="text-gray-300 hover:text-white transition-colors"
                 target="_blank">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="#services" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
              <li><a href="#opportunities" className="text-gray-300 hover:text-white transition-colors">Opportunities</a></li>
              <li><a href="#blog" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Executive Floor,<br/>opposite American Embassy</span>
                <span className="text-gray-300">Link house No.2<br/>219 Kingsway RD<br/>Maseru west,<br/> Maseru 100 Lesotho</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">+266 5988 9058</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">basothosolutions@gmail.com</span>
              </div>
            </div>
          </div>

          {/* PARTNERS SECTION */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Partners</h4>
            <div className="flex flex-wrap gap-4">
              {partners.map((p, index) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                 <img
                   key={index}
                   src={p.logo}
                   alt={p.name}
                   className="h-16 w-auto bg-white p-2 rounded-md shadow-md object-contain"
                  />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2023 Basotho Solutions. All rights reserved. Building opportunities for a sustainable future.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
