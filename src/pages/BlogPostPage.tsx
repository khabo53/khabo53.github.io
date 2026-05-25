import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("Invalid post ID");
        setLoading(false);
        return;
      }

      try {
        console.log("📥 Fetching post:", id);
        const postRef = doc(db, "admin_posts", id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const data = postSnap.data();
          setPost({
            id: postSnap.id,
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
          });
        } else {
          setError("Post not found");
        }
      } catch (error: any) {
        console.error("❌ Error fetching post:", error);
        setError("Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Date unavailable";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Post Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The requested post does not exist."}</p>
            <button
              onClick={() => navigate('/scholarships')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Back to Opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/scholarships')}
          className="flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Opportunities
        </button>

        {/* Post content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {post.image && (
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          )}
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                post.type === 'vacancy' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {post.type === 'vacancy' ? 'Vacancy' : 'Blog'}
              </span>
              <span className="text-sm text-gray-500">{post.category}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
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

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {post.type === 'vacancy' && post.applyUrl && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <a
                  href={post.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
                >
                  Apply for this Position
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;