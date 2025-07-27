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

    // Lấy token nếu có, nếu không thì chỉ gửi Content-Type
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    let headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/blogs/${numericId}`, { headers });
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
    const numericBlogId = Number(blogId);
    if (isNaN(numericBlogId)) {
      throw new Error('Invalid blog ID');
    }

    let headers = { 'Content-Type': 'application/json' };
    let userData = null;
    try {
      userData = JSON.parse(localStorage.getItem("user"));
    } catch {}
    const token = userData?.accessToken;
    if (token && token.length > 10) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(`${API_BASE_URL}/comments?blog_id=${numericBlogId}`, { headers });

    // Nếu bị 401, thử lại không gửi Authorization header
    if (response.status === 401 && headers['Authorization']) {
      localStorage.removeItem('user');
      response = await fetch(`${API_BASE_URL}/comments?blog_id=${numericBlogId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
    if (!comment || !comment.description || !comment.blogId || !comment.userId) {
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
    const numericCommentId = Number(commentId);
    if (isNaN(numericCommentId)) {
      throw new Error('Invalid comment ID');
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/comments/${numericCommentId}/like`, {
      method: 'POST',
      headers
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
export const createBlog = async (blogData) => {
  const userData = JSON.parse(localStorage.getItem('user'));
  const token = userData?.accessToken; // Đúng với các API khác

  const response = await fetch('http://localhost:8080/api/blogs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(blogData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create blog: ${JSON.stringify(errorData)}`);
  }
  return response.json();
};

// BLOG: Update blog
export const updateBlog = async (id, blog) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(blog)
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update blog: ${error}`);
  }
  return response.json();
};

// BLOG: Delete blog
export const deleteBlog = async (id) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete blog: ${error}`);
  }
  // Nếu status 204 (No Content), không cần parse json
  if (response.status === 204) return;
  // Nếu có body, parse json
  try {
    return await response.json();
  } catch {
    return;
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
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Gửi đúng DTO backend: { memberId, eventId } (cả hai là số)
    const registration = { memberId: Number(memberId), eventId: Number(eventId) };
    const response = await fetch(`${API_BASE_URL}/registrations`, {
      method: 'POST',
      headers,
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



export const checkOut = async (memberId, eventId, status) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_BASE_URL}/registrations/checkOut/${memberId}/${eventId}/${status}`;
  const response = await fetch(url, {
    method: "POST",
    headers,
  });
console.log("Sending checkOut request:", memberId, eventId, status);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Check out failed: ${error}`);
  }

  return response.json();

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

export const deleteEvent = async (id) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete event: ${error}`);
  }
  return response;
};

export const approveRegistration = async (id) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/registrations/approve/${id}`, {
    method: 'PUT',
    headers
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to approve registration: ${error}`);
  }
  return response.json();
};

export const rejectRegistration = async (id) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/registrations/reject/${id}`, {
    method: 'PUT',
    headers
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to reject registration: ${error}`);
  }
  return response.json();
};

export const getRegistrationsByStatus = async (status) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.accessToken;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(
    `${API_BASE_URL}/registrations/search-by-status?status=${status}`,
    { method: 'GET', headers }
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch registrations: ${error}`);
  }
  return response.json();
};

