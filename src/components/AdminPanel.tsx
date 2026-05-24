import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Header from './Header';  // ← ADD THIS IMPORT

interface AdminPost {
  id: string;
  title: string;
  content: string;
  type: 'blog' | 'vacancy';
  category: string;
  location?: string;
  image?: string;
  applyUrl?: string;
  createdAt: string;
}

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'blog' as 'blog' | 'vacancy',
    category: '',
    location: '',
    image: '',
    applyUrl: ''
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      setError(null);
      const user = auth.currentUser;
      
      if (!user) {
        console.log("No user logged in, redirecting to login");
        navigate('/login');
        return;
      }
      
      try {
        console.log("Checking admin status for user:", user.uid);
        
        // Get user role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log("User document not found");
          setError("User profile not found. Please contact support.");
          navigate('/');
          return;
        }
        
        const userData = userDoc.data();
        console.log("User role:", userData.role);
        
        if (userData.role === 'admin') {
          console.log("Admin access granted");
          setIsAuthenticated(true);
          setIsAdmin(true);
          await fetchPosts();
        } else {
          console.log("User is not admin, redirecting to home");
          setError("You don't have admin access.");
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error: any) {
        console.error("Error checking admin status:", error);
        
        // Handle permission errors
        if (error.code === 'permission-denied') {
          setError("Permission denied. Please check your Firestore security rules.");
        } else {
          setError(`Authentication error: ${error.message}`);
        }
        
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAdminStatus();
      } else {
        setLoading(false);
        navigate('/login');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    try {
      console.log("Fetching admin posts...");
      const postsRef = collection(db, "admin_posts");
      const q = query(postsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminPost[];
      
      console.log(`Fetched ${postsData.length} posts`);
      setPosts(postsData);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      if (error.code === 'permission-denied') {
        setError("Cannot fetch posts. Check Firestore rules for admin_posts collection.");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (editingPost) {
        // Update existing post
        const postRef = doc(db, "admin_posts", editingPost.id);
        await updateDoc(postRef, {
          title: formData.title,
          content: formData.content,
          type: formData.type,
          category: formData.category,
          location: formData.location || '',
          image: formData.image || '',
          applyUrl: formData.applyUrl || '',
          updatedAt: new Date().toISOString()
        });
        alert("Post updated successfully!");
      } else {
        // Create new post
        await addDoc(collection(db, "admin_posts"), {
          title: formData.title,
          content: formData.content,
          type: formData.type,
          category: formData.category,
          location: formData.location || '',
          image: formData.image || '',
          applyUrl: formData.applyUrl || '',
          createdAt: new Date().toISOString()
        });
        alert("Post created successfully!");
      }
      
      // Reset form and refresh posts
      setFormData({ title: '', content: '', type: 'blog', category: '', location: '', image: '', applyUrl: '' });
      setEditingPost(null);
      setShowForm(false);
      await fetchPosts();
    } catch (error: any) {
      console.error("Error saving post:", error);
      if (error.code === 'permission-denied') {
        alert("Permission denied. You don't have admin access to write posts.");
      } else {
        alert(`Error saving post: ${error.message}`);
      }
    }
  };

  const handleEdit = (post: AdminPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      category: post.category,
      location: post.location || '',
      image: post.image || '',
      applyUrl: post.applyUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "admin_posts", id));
        alert("Post deleted successfully!");
        await fetchPosts();
      } catch (error: any) {
        console.error("Error deleting post:", error);
        if (error.code === 'permission-denied') {
          alert("Permission denied. You don't have admin access to delete posts.");
        } else {
          alert(`Error deleting post: ${error.message}`);
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Return to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <section id="admin" className="py-16 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-500 mt-1">Manage Blog Posts and Vacancies</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Post
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
                <textarea
                  placeholder="Content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 h-32"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'blog' | 'vacancy'})}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="blog">Blog Post</option>
                    <option value="vacancy">Vacancy</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location (for vacancies)"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Image (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="mt-3 h-32 rounded-md object-cover"
                      />
                    )}
                  </div>
                  {formData.type === 'vacancy' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Application URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/apply"
                        value={formData.applyUrl}
                        onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
                  >
                    {editingPost ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPost(null);
                      setFormData({ title: '', content: '', type: 'blog', category: '', location: '', image: '', applyUrl: ''});
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    post.type === 'vacancy' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {post.type === 'vacancy' ? 'Vacancy' : 'Blog'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.type === 'vacancy' ? 'Vacancy' : 'Blog'}
                    className="mb-3 w-full h-40 object-cover rounded-md"
                  />
                )}
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{post.content.substring(0, 100)}...</p>
                <div className="text-xs text-gray-500">
                  <div>Category: {post.category}</div>
                  {post.location && <div>Location: {post.location}</div>}
                </div>
                {post.type === 'vacancy' && post.applyUrl && (
                  <a
                    href={post.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Apply Now
                  </a>
                )}
              </div>
            ))}
          </div>
          
          {posts.length === 0 && !showForm && (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet. Click "Add Post" to get started.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminPanel;