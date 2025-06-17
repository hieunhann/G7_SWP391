import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaHeart, FaShare, FaFilter } from 'react-icons/fa';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedBlogs, setLikedBlogs] = useState(() => {
    const saved = localStorage.getItem('likedBlogs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));
  }, [likedBlogs]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('http://localhost:3001/blogs');
      const data = await response.json();
      setBlogs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  const handleLike = (blogId) => {
    setLikedBlogs(prev => {
      if (prev.includes(blogId)) {
        return prev.filter(id => id !== blogId);
      } else {
        return [...prev, blogId];
      }
    });
  };

  const handleShare = async (blog) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Trình duyệt của bạn không hỗ trợ tính năng chia sẻ');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || blog.type === selectedType;
    return matchesSearch && matchesType;
  });

  const blogTypes = [...new Set(blogs.map(blog => blog.type))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <div className="w-full md:w-64">
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Tất cả chủ đề</option>
              {blogTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map(blog => (
          <div key={blog.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
            <div className="relative h-48">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                {blog.type}
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h2 className="text-xl font-bold mb-2 line-clamp-2">{blog.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                {blog.content}
              </p>
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(blog.id)}
                      className={`flex items-center space-x-1 ${
                        likedBlogs.includes(blog.id) ? 'text-red-500' : 'text-gray-500'
                      } hover:text-red-500 transition-colors`}
                    >
                      <FaHeart />
                      <span>{likedBlogs.includes(blog.id) ? 'Đã thích' : 'Thích'}</span>
                    </button>
                    <button
                      onClick={() => handleShare(blog)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <FaShare />
                      <span>Chia sẻ</span>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <Link
                  to={`/blog/${blog.id}`}
                  className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Đọc thêm
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogList; 