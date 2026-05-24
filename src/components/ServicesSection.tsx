import React from 'react';
import { Leaf, Zap, Globe } from 'lucide-react';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: <Leaf className="w-12 h-12 text-green-600" />,
      title: 'Agricultural Solutions',
      description: 'Innovative farming techniques, crop optimization, and sustainable agriculture practices to boost productivity and food security.',
      features: ['Smart Farming', 'Crop Management', 'Soil Analysis', 'Irrigation Systems'],
      hoverColor: 'hover:bg-green-600',
      iconColor: 'text-green-600',
      iconHoverColor: 'group-hover:text-white'
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: 'Renewable Energy',
      description: 'Clean energy solutions including solar, wind, and hydroelectric power systems for sustainable development.',
      features: ['Solar Power', 'Wind Energy', 'Hydroelectric', 'Energy Storage'],
      hoverColor: 'hover:bg-yellow-500',
      iconColor: 'text-yellow-500',
      iconHoverColor: 'group-hover:text-white'
    },
    {
      icon: <Globe className="w-12 h-12 text-blue-600" />,
      title: 'Climate Solutions',
      description: 'Comprehensive climate change mitigation and adaptation strategies for communities and businesses.',
      features: ['Carbon Reduction', 'Climate Adaptation', 'Environmental Monitoring', 'Green Technology'],
      hoverColor: 'hover:bg-blue-600',
      iconColor: 'text-blue-600',
      iconHoverColor: 'group-hover:text-white'
    }
  ];

  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Expertise</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering communities through innovative solutions in agriculture, renewable energy, and climate action
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className={`group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all 
                duration-300 transform hover:-translate-y-2 p-8 ${service.hoverColor}
                 hover:text-white cursor-pointer`}
            >
              <div className={`flex justify-center mb-6 transition-colors duration-300
                 ${service.iconColor} ${service.iconHoverColor}`}>
                {service.icon}
              </div>
              <h3 className={`text-2xl font-bold mb-4 text-center transition-colors
                 duration-300 group-hover:text-white ${index === 0 ? 'text-gray-900' : index === 1 ? 'text-gray-900' : 'text-gray-900'}`}>
                {service.title}
              </h3>
              <p className={`text-gray-600 mb-6 text-center transition-colors duration-300 group-hover:text-white`}>
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700 group-hover:text-white transition-colors duration-300">
                    <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-300 ${
                      index === 0 ? 'bg-green-600 group-hover:bg-white' : 
                      index === 1 ? 'bg-yellow-500 group-hover:bg-white' : 
                      'bg-blue-600 group-hover:bg-white'
                    }`}></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;