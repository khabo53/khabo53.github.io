import React from 'react';
import { Leaf, Zap, Globe } from 'lucide-react';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: <Leaf className="w-12 h-12 text-green-600" />,
      title: 'Agricultural Solutions',
      description: 'Innovative farming techniques, crop optimization, and sustainable agriculture practices to boost productivity and food security.',
      features: ['Smart Farming', 'Crop Management', 'Soil Analysis', 'Irrigation Systems']
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: 'Renewable Energy',
      description: 'Clean energy solutions including solar, wind, and hydroelectric power systems for sustainable development.',
      features: ['Solar Power', 'Wind Energy', 'Hydroelectric', 'Energy Storage']
    },
    {
      icon: <Globe className="w-12 h-12 text-blue-600" />,
      title: 'Climate Solutions',
      description: 'Comprehensive climate change mitigation and adaptation strategies for communities and businesses.',
      features: ['Carbon Reduction', 'Climate Adaptation', 'Environmental Monitoring', 'Green Technology'],
    hoverColor: 'hover:text-blue-600'
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
            <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8">
              <div className="flex justify-center mb-6">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-centergroup-hover:${service.hoverColor}">{service.title}</h3>
              <p className="text-gray-600 mb-6 text-center">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
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