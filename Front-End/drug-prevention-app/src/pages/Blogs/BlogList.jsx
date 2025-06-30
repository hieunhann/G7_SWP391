import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaHeart, FaShare, FaFilter, FaEdit } from 'react-icons/fa';
import Header from '../../components/Header/Header';
import { getBlogs } from '../../services/api';

const BlogList = ({ user }) => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedBlogs, setLikedBlogs] = useState(() => {
    try {
      const saved = localStorage.getItem('likedBlogs');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error parsing liked blogs:', err);
      return [];
    }
  });

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getBlogs();
        // Đảm bảo dữ liệu là mảng trước khi set state
        if (Array.isArray(data?.data)) {
          setBlogs(data.data);
        } else {
          console.error('Invalid data format received:', data);
          setError('Dữ liệu không hợp lệ');
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Không thể tải danh sách bài viết');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));
    } catch (err) {
      console.error('Error saving liked blogs:', err);
    }
  }, [likedBlogs]);

  const handleLike = (blogId) => {
    setLikedBlogs(prev => {
      const newLikedBlogs = prev.includes(blogId)
        ? prev.filter(id => id !== blogId)
        : [...prev, blogId];
      return newLikedBlogs;
    });
  };

  const handleShare = async (blog) => {
    try {
      if (!navigator.share) {
        throw new Error('Web Share API not supported');
      }

      await navigator.share({
        title: blog.title,
        text: blog.content.substring(0, 100) + '...',
        url: `${window.location.origin}/blogs/${blog.id}` // Sửa đường dẫn URL
      });
    } catch (error) {
      if (error.message !== 'Web Share API not supported') {
        console.error('Error sharing:', error);
      }
      alert('Trình duyệt không hỗ trợ chia sẻ hoặc có lỗi xảy ra');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || blog.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Lấy danh sách các loại blog duy nhất và sắp xếp
  const blogTypes = [...new Set(blogs.map(blog => blog.type))].sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkblue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-darkblue-500 text-white px-4 py-2 rounded hover:bg-darkblue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-darkblue-800 drop-shadow-lg">
          <i className="bi bi-journal-text mr-2"></i> 
          Danh sách bài viết
        </h2>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-darkblue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-darkblue-500 appearance-none"
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

        {filteredBlogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy bài viết nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <div className="relative h-48">
                  <img
                    src={blog.imageUrl || "https://cdn-icons-png.flaticon.com/512/2913/2913461.png"}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/2913/2913461.png"}
                  />
                  <div className="absolute top-2 right-2 bg-darkblue-500 text-white px-2 py-1 rounded text-sm">
                    {blog.type}
                  </div>
                  {user?.id === blog.manager?.id && (
                    <Link 
                      to={`/edit-blog/${blog.id}`}
                      className="absolute top-2 left-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                    >
                      <FaEdit size={14} />
                    </Link>
                  )}
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
                        {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <Link
                      to={`/blog/${blog.id}`}
                      className="block w-full text-center bg-darkblue-600 text-black py-2 px-4 rounded-lg hover:bg-darkblue-600 transition-colors"
                    >
                      Đọc thêm
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BlogList;