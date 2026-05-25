import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  date?: string;
  location?: string;
  type: 'blog' | 'vacancy';
  category: string;
  image?: string;
  applyUrl?: string;
  createdAt: string;
}
const navigate = useNavigate();

const BlogSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'blog' | 'vacancy'>('all');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("📥 Fetching posts from Firestore...");
        const postsRef = collection(db, "admin_posts");
        const q = query(postsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const postsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled",
            content: data.content || "",
            excerpt: data.content ? data.content.substring(0, 120) + "..." : "No description available",
            date: data.createdAt || data.date || new Date().toISOString(),
            location: data.location || "",
            type: data.type || "blog",
            category: data.category || "General",
            image: data.image || "",
            applyUrl: data.applyUrl || "",
            createdAt: data.createdAt
          };
        }) as BlogPost[];
        
        console.log(`Fetched ${postsData.length} posts`);
        setPosts(postsData);
      } catch (error: any) {
        console.error("❌ Error fetching posts:", error);
        setError("Failed to load posts. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => 
    activeTab === 'all' || post.type === activeTab
  );

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Date unavailable";
    }
  };

  if (loading) {
    return (
      <section id="blog" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Updates & Opportunities</h2>
            <p className="text-xl text-gray-600">Stay informed about our latest projects and available positions</p>
          </div>
          <div className="flex justify-center">
            <div className="text-gray-500">Loading posts...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="blog" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Updates & Opportunities</h2>
            <p className="text-xl text-gray-600">Stay informed about our latest projects and available positions</p>
          </div>
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

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

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    post.type === 'vacancy' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {post.type === 'vacancy' ? 'Vacancy' : 'Blog'}
                  </span>
                  <span className="text-sm text-gray-500">{post.category}</span>
                </div>
                
                {post.image && (
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{post.excerpt}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(post.date || post.createdAt)}
                  </div>
                  {post.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {post.location}
                    </div>
                  )}
                </div>
                
                {post.type === 'vacancy' && post.applyUrl ? (
                  <a 
                    href={post.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors text-center"
                  >
                    Apply Now
                  </a>
                ) : (
                  <button onClick={() => navigate(`/blog/${post.id}`)}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    Read More
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;