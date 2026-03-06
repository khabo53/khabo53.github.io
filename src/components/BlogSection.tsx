import React, { useState } from 'react';
import { Calendar, MapPin, Briefcase } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  location?: string;
  type: 'blog' | 'vacancy';
  category: string;
}

const BlogSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'blog' | 'vacancy'>('all');

  const posts: BlogPost[] = [
    {
      id: 1,
      title: 'Agricultural Engineer Position Available',
      excerpt: 'Join our team to develop innovative farming solutions for sustainable agriculture in Lesotho.',
      date: '2024-01-15',
      location: 'Maseru, Lesotho',
      type: 'vacancy',
      category: 'Agriculture'
    },
    {
      id: 2,
      title: 'Solar Energy Project Manager Needed',
      excerpt: 'Lead renewable energy projects and help communities access clean, affordable power.',
      date: '2024-01-12',
      location: 'Remote/Lesotho',
      type: 'vacancy',
      category: 'Renewable Energy'
    },
    {
      id: 3,
      title: 'Climate Adaptation Strategies for Rural Communities',
      excerpt: 'Exploring effective methods to help rural communities adapt to changing climate conditions.',
      date: '2024-01-10',
      type: 'blog',
      category: 'Climate Change'
    },
    {
      id: 4,
      title: 'Sustainable Farming Techniques Workshop',
      excerpt: 'Learn about modern sustainable farming methods that increase yield while protecting the environment.',
      date: '2024-01-08',
      type: 'blog',
      category: 'Agriculture'
    }
  ];

  const filteredPosts = posts.filter(post => 
    activeTab === 'all' || post.type === activeTab
  );

  return (
    <section id="blog" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Updates & Opportunities</h2>
          <p className="text-xl text-gray-600">Stay informed about our latest projects and available positions</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-md transition-all ${activeTab === 'all' ? 'bg-white shadow-md text-green-600' : 'text-gray-600 hover:text-green-600'}`}
            >
              All Posts
            </button>
            <button 
              onClick={() => setActiveTab('blog')}
              className={`px-6 py-2 rounded-md transition-all ${activeTab === 'blog' ? 'bg-white shadow-md text-green-600' : 'text-gray-600 hover:text-green-600'}`}
            >
              Blog
            </button>
            <button 
              onClick={() => setActiveTab('vacancy')}
              className={`px-6 py-2 rounded-md transition-all ${activeTab === 'vacancy' ? 'bg-white shadow-md text-green-600' : 'text-gray-600 hover:text-green-600'}`}
            >
              Vacancies
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  post.type === 'vacancy' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {post.type === 'vacancy' ? 'Vacancy' : 'Blog'}
                </span>
                <span className="text-sm text-gray-500">{post.category}</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.date).toLocaleDateString()}
                </div>
                {post.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {post.location}
                  </div>
                )}
              </div>
              
              <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors">
                {post.type === 'vacancy' ? 'Apply Now' : 'Read More'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;