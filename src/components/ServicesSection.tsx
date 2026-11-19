import React from 'react';
import { Sprout, Building2, Calendar } from 'lucide-react';

// Import the images so Vite bundles them correctly
import cgpPoster from '../assets/cgp-poster.jpg';
import gepPoster from '../assets/gep-poster.jpg';
import rocPoster from '../assets/roc-poster.jpg';

const ServicesSection: React.FC = () => {
  const programs = [
    {
      icon: <Sprout className="w-12 h-12 text-green-600" />,
      title: 'Roots of Change (ROC)',
      description: 'Our long-term school-based climate and environmental programme, designed to empower learners to understand, protect and actively improve their environment.',
      features: ['Green Ambassadors', 'Climate Education', 'Practical Action', 'School Greening'],
      hoverColor: 'hover:bg-green-600',
      iconColor: 'text-green-600',
      iconHoverColor: 'group-hover:text-white',
      image: rocPoster
    },
    {
      icon: <Building2 className="w-12 h-12 text-yellow-500" />,
      title: 'Corporate Green Program (CGP)',
      description: 'Designed to help businesses integrate environmental responsibility, green infrastructure, renewable energy and sustainable workplace practices into their operations.',
      features: ['Green Workplace', 'Green Electrification', 'Water Conservation', 'Waste Management'],
      hoverColor: 'hover:bg-yellow-500',
      iconColor: 'text-yellow-500',
      iconHoverColor: 'group-hover:text-white',
      image: cgpPoster
    },
    {
      icon: <Calendar className="w-12 h-12 text-blue-600" />,
      title: 'Green Events Program (GEP)',
      description: 'Every event leaves an environmental footprint. We help event organisers reduce that footprint while creating a visible, measurable positive impact.',
      features: ['Event Clean-Up', 'Waste Separation', 'Green Activations', 'Volunteer Mobilisation'],
      hoverColor: 'hover:bg-blue-600',
      iconColor: 'text-blue-600',
      iconHoverColor: 'group-hover:text-white',
      image: gepPoster
    }
  ];

  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Programs</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From climate ambition to climate action. We offer targeted programmes for schools, businesses, and events to create a greener Lesotho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {programs.map((program, index) => (
            <div 
              key={index} 
              className={`group flex flex-col bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all 
                duration-300 transform hover:-translate-y-2 overflow-hidden ${program.hoverColor}
                 hover:text-white cursor-pointer`}
            >
              {/* Image Section */}
              {program.image ? (
                <div className="w-full bg-gray-100 flex items-center justify-center p-4">
                  <img 
                    src={program.image} 
                    alt={program.title} 
                    className="w-full h-auto max-h-[420px] object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-[420px] bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <Sprout className="w-24 h-24 text-green-300" />
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
                <div className={`flex justify-center mb-6 transition-colors duration-300
                   ${program.iconColor} ${program.iconHoverColor}`}>
                  {program.icon}
                </div>
                <h3 className={`text-2xl font-bold mb-4 text-center transition-colors
                   duration-300 group-hover:text-white text-gray-900`}>
                  {program.title}
                </h3>
                <p className={`text-gray-600 mb-6 text-center transition-colors duration-300 group-hover:text-white text-sm`}>
                  {program.description}
                </p>
                <ul className="space-y-2 mt-auto">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 group-hover:text-white transition-colors duration-300 text-sm">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;