import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaHeart, FaShare, FaArrowLeft } from 'react-icons/fa';
import Header from '../../components/Header/Header';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedBlogs, setLikedBlogs] = useState(() => {
    const saved = localStorage.getItem('likedBlogs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Fetch blog details
    fetch(`http://localhost:5002/blogs/${id}`)
      .then(res => res.json())
      .then(data => {
        setBlog(data);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching blog:', err));

    // Fetch comments
    fetch(`http://localhost:5002/comments?blog_id=${id}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error('Error fetching comments:', err));
  }, [id]);

  useEffect(() => {
    localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));
  }, [likedBlogs]);

  const handleLike = () => {
    setLikedBlogs(prev => {
      if (prev.includes(id)) {
        return prev.filter(blogId => blogId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: blog.title,
        text: blog.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    const comment = {
      blog_id: parseInt(id),
      user_id: 2, // Hardcoded for demo
      description: newComment,
      like: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    fetch('http://localhost:5002/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    })
      .then(res => res.json())
      .then(data => {
        setComments([...comments, data]);
        setNewComment('');
      })
      .catch(err => console.error('Error posting comment:', err));
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (!blog) return <div className="text-center py-8">Không tìm thấy bài viết</div>;

  return (
    <>
    <Header />
    
    <div className="container mx-auto px-4 py-8">
      <Link 
        to="/blogs"
        className="inline-flex items-center text-green-600 hover:text-green-700 mb-8"
      >
        <FaArrowLeft className="mr-2" /> Quay lại danh sách
      </Link>

      <article className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img
            src={blog.image || "https://cdn-icons-png.flaticon.com/512/2913/2913461.png"}
            alt={blog.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleLike}
              className={`p-3 rounded-full ${
                likedBlogs.includes(id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600'
              } hover:bg-red-500 hover:text-white transition-colors`}
            >
              <FaHeart />
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-white text-gray-600 hover:bg-green-500 hover:text-white transition-colors"
            >
              <FaShare />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{blog.type}</span>
            <span className="text-sm text-gray-500">
              {new Date(blog.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-6 text-gray-800">{blog.title}</h1>
          
          <div className="prose max-w-none mb-12">
            <p className="text-gray-700 leading-relaxed">{blog.content}</p>
          </div>

          {/* Comments Section */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Bình luận</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-4 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Viết bình luận của bạn..."
                required
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Gửi bình luận
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">User {comment.user_id}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.description}</p>
                  <div className="mt-2 flex items-center">
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
    </>
  );
};

export default BlogDetail; 