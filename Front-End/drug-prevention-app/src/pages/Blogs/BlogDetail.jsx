import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaShare, FaArrowLeft, FaEdit } from 'react-icons/fa';
import Header from '../../components/Header/Header';
import { getBlogById, getCommentsByBlogId, postComment, likeComment } from '../../services/api';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = () => {
      try {
        const saved = localStorage.getItem('user');
        setUser(saved ? JSON.parse(saved) : null);
      } catch {
        setUser(null);
      }
    };
    getUser();
    window.addEventListener('focus', getUser);
    return () => window.removeEventListener('focus', getUser);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const numericId = Number(id);
        if (isNaN(numericId)) throw new Error('Invalid blog ID');

        // Nếu API trả về { data: blog }
        let blogData = await getBlogById(numericId);
        if (blogData && blogData.data) blogData = blogData.data;
        if (!blogData || !blogData.id) throw new Error('Không tìm thấy bài viết');
        setBlog(blogData);

        let commentsData = await getCommentsByBlogId(numericId);
        if (commentsData && commentsData.data) commentsData = commentsData.data;
        setComments(Array.isArray(commentsData) ? commentsData : []);

        // Like state
        let likedBlogs = [];
        try {
          likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
        } catch {}
        setLiked(likedBlogs.includes(blogData.id));
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu bài viết');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Đồng bộ likedBlogs với localStorage
  useEffect(() => {
    if (!blog) return;
    let likedBlogs = [];
    try {
      likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
    } catch {}
    if (liked && !likedBlogs.includes(blog.id)) {
      localStorage.setItem('likedBlogs', JSON.stringify([...likedBlogs, blog.id]));
    } else if (!liked && likedBlogs.includes(blog.id)) {
      localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs.filter(bid => bid !== blog.id)));
    }
  }, [liked, blog]);

  useEffect(() => {
    console.log("User in BlogDetail:", user);
  }, [user]);

  const handleLike = () => {
    setLiked(prev => !prev);
  };

  const handleShare = async () => {
    if (!blog) return;
    try {
      if (!navigator.share) throw new Error('Web Share API not supported');
      await navigator.share({
        title: blog.title,
        text: blog.content?.substring(0, 100) + '...',
        url: window.location.href
      });
    } catch {
      alert('Trình duyệt không hỗ trợ chia sẻ hoặc có lỗi xảy ra');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await likeComment(commentId);
      setComments(comments.map(c =>
        c.id === commentId ? { ...c, like: (c.like || 0) + 1 } : c
      ));
    } catch {
      setError('Không thể like bình luận');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const saved = localStorage.getItem('user');
    const currentUser = saved ? JSON.parse(saved) : null;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      setError('Vui lòng nhập nội dung bình luận');
      return;
    }
    try {
      const numericId = Number(id);
      if (isNaN(numericId)) throw new Error('Invalid blog ID');
      const comment = {
        blog: { id: numericId },
        description: newComment.trim(),
        like: 0
      };
      const createdComment = await postComment(comment);
      setComments(prev => [...prev, createdComment]);
      setNewComment('');
      setError('');
    } catch (err) {
      setError(err.message || 'Có lỗi khi đăng bình luận');
      console.error('Error posting comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="text-center py-8">
        <p>{error || 'Không tìm thấy bài viết'}</p>
        <Link to="/blogs" className="text-blue-500 hover:underline">
          Quay lại danh sách bài viết
        </Link>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <div className="container mx-auto px-4 py-10">
        <Link to="/blogs" className="flex items-center text-blue-600 hover:underline mb-6 text-sm">
          <FaArrowLeft className="mr-2" /> Quay lại danh sách
        </Link>
        <article className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="relative group">
            <img
              src={blog.imageUrl || "https://cdn-icons-png.flaticon.com/512/2913/2913461.png"}
              alt={blog.title}
              className="w-full h-72 object-cover group-hover:brightness-90 transition duration-300"
              onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/2913/2913461.png")}
            />
            <div className="absolute top-4 right-4 flex gap-3">
              {user?.id === blog.manager?.id && (
                <Link to={`/edit-blog/${blog.id}`} className="p-3 bg-yellow-500 rounded-full text-white hover:bg-yellow-600 shadow-lg">
                  <FaEdit />
                </Link>
              )}
              <button
                onClick={handleLike}
                className={`p-3 rounded-full shadow-lg border border-gray-300 bg-gray-100 transition-colors duration-150 ${
                  liked ? 'text-red-500' : 'text-gray-600'
                } hover:text-red-500`}
              >
                <FaHeart className="text-inherit" />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-full border border-gray-300 bg-gray-100 text-gray-600 hover:text-green-500 shadow-lg transition-colors duration-150"
              >
                <FaShare className="text-inherit" />
              </button>
            </div>
          </div>
          <div className="p-8">
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>{blog.type}</span>
              <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : ''}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{blog.title}</h1>
            <div className="prose max-w-none mb-10">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{blog.content}</p>
            </div>
            <section className="mt-12 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Bình luận ({comments.length})</h2>
              <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="4"
                  placeholder="Viết bình luận của bạn..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  required
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                <button
                  type="submit"
                  className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Gửi bình luận
                </button>
              </form>
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center">Chưa có bình luận nào</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-4 bg-gray-50 p-5 rounded-lg shadow-sm">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center font-bold">
                          {comment.createdBy ? comment.createdBy.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{comment.createdBy ? `Người dùng ${comment.createdBy}` : 'Người dùng'}</span>
                          <span className="text-sm text-gray-500">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.description}</p>
                        <div className="mt-2">
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className="flex items-center text-gray-500 hover:text-red-500 transition"
                          >
                            <FaHeart className="mr-1" />
                            <span>{comment.like || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogDetail;
