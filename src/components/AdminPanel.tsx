import React, { useState } from 'react';
import { Plus, Edit, Trash2, Image } from 'lucide-react';

interface AdminPost {
  id: number;
  title: string;
  content: string;
  type: 'blog' | 'vacancy';
  category: string;
  location?: string;
  image?: string;
  applyUrl?: string;
}

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    if (result.authenticated) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Something went wrong. Try again.');
  }
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      setPosts(posts.map(post => 
        post.id === editingPost.id 
          ? { ...editingPost, ...formData }
          : post
      ));
      setEditingPost(null);
    } else {
      const newPost: AdminPost = {
        id: Date.now(),
        ...formData
      };
      setPosts([...posts, newPost]);
    }
    setFormData({ title: '', content: '', type: 'blog', category: '', location: '', image: '', applyUrl: ''});
    setShowForm(false);
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

  const handleEdit = (post: AdminPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      category: post.category,
      location: post.location || '',
      image: post.image || '',
      applyUrl: ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setPosts(posts.filter(post => post.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <section id="admin" className="py-16 bg-gray-100">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="admin" className="py-16 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Post
          </button>
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
                {/* ✅ Add the image upload here */}
                {/*{formData.type === 'vacancy' && (*/
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image (optional)
                </label>
                  <input
                    type="file"
                     accept="image/*"
                     onChange={handleImageChange}
                     className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                 file:rounded-md file:border-0 file:text-sm file:font-semibold 
                 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
               />
     {formData.image && (
      <img
        src={formData.image}
        alt="Preview"
        className="mt-3 h-32 rounded-md object-cover"
      />
    )}
    {formData.type === 'vacancy' && (
  <input
    type="url"
    placeholder="Application Link (optional)"
    value={formData.applyUrl}
    onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
  />
)}
  </div>
}
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
              {/*  Show image if post is a vacancy or blog has an image */}
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
              {/*showing url if it exists*/}
              {post.type === 'vacancy' && post.applyUrl && (
                <a
                  href={post.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Apply Now
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;