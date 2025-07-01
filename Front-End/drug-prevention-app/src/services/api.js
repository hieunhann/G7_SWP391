const API_BASE_URL = 'http://localhost:8080/api';

export const getBlogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch blogs: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

export const getBlogById = async (id) => {
  try {
    // Đảm bảo id là số
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid blog ID');
    }

    const response = await fetch(`${API_BASE_URL}/blogs/${numericId}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch blog: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};

export const getCommentsByBlogId = async (blogId) => {
  try {
    // Đảm bảo blogId là số
    const numericBlogId = Number(blogId);
    if (isNaN(numericBlogId)) {
      throw new Error('Invalid blog ID');
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/comments?blog_id=${numericBlogId}`, {
      headers
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch comments: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const postComment = async (comment) => {
  try {
    // Validate comment object
    if (!comment || !comment.description || !comment.blog) {
      throw new Error('Invalid comment data');
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comment)
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to post comment: ${error}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
};

export const likeComment = async (commentId) => {
  try {
    // Đảm bảo commentId là số
    const numericCommentId = Number(commentId);
    if (isNaN(numericCommentId)) {
      throw new Error('Invalid comment ID');
    }

    const response = await fetch(`${API_BASE_URL}/comments/${numericCommentId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to like comment: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error liking comment:', error);
    throw error;
  }
};

export const getEvents = async () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/events`, { headers });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch events: ${error}`);
  }
  return response.json();
};

export const getEventById = async (id) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/events/${id}`, { headers });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch event: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

export const getRegistrations = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/registrations`, { headers });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch registrations: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
};

export const createRegistration = async (registration) => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registration)
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create registration: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error creating registration:', error);
    throw error;
  }
};

export const updateRegistration = async (id, registration) => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registration)
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update registration: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error updating registration:', error);
    throw error;
  }
};

export const deleteRegistration = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete registration: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error deleting registration:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết thành viên theo id
export const getMemberById = async (id) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/v1/users/${id}`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch member: ${await res.text()}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching member:', error);
    throw error;
  }
};

// BLOG: Search blogs by term
export const searchBlogs = async (term) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/search?term=${encodeURIComponent(term)}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to search blogs: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error searching blogs:', error);
    throw error;
  }
};

// BLOG: Get blogs by type
export const getBlogsByType = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/type/${encodeURIComponent(type)}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch blogs by type: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching blogs by type:', error);
    throw error;
  }
};

// BLOG: Create blog
export const createBlog = async (blog) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blog)
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create blog: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

// BLOG: Update blog
export const updateBlog = async (id, blog) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blog)
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update blog: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

// BLOG: Delete blog
export const deleteBlog = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete blog: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// COMMENT: Delete comment
export const deleteComment = async (id) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete comment: ${error}`);
    }
    return response;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const registerForEvent = async (memberId, eventId) => {
  try {
    // Gửi member là object
    const registration = { member: { id: memberId }, eventId };
    const response = await fetch(`${API_BASE_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registration)
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to register for event: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error registering for event:', error);
    throw error;
  }
};

export const getEventFeedbacks = async (eventId) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/feedback/event/${eventId}`, { headers });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch event feedbacks: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching event feedbacks:', error);
    throw error;
  }
};

export const createEventFeedback = async (feedback) => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create event feedback: ${error}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error creating event feedback:', error);
    throw error;
  }
};

export const getUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/users`);
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  // result.data là mảng user, result.total là tổng số lượng, ...
  return result.data || [];
};

// Lấy event theo manager
export const getEventsByManager = async (managerId) => {
  const response = await fetch(`${API_BASE_URL}/events/manager/${managerId}`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

// Lấy đăng ký theo member (chuẩn JPA)
export const getRegistrationsByMember = async (memberId) => {
  const response = await fetch(`${API_BASE_URL}/registrations/user/${memberId}`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

// Lấy feedback theo member
export const getFeedbacksByMember = async (memberId) => {
  const response = await fetch(`${API_BASE_URL}/feedback/member/${memberId}`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

// Tạo event mới (manager là object)
export const createEvent = async (event) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify(event)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

export const deleteFeedbackEvent = async (id) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete feedback: ${error}`);
  }
  return response;
};

export const updateEvent = async (id, event) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(event)
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update event: ${error}`);
  }
  return response.json();
};