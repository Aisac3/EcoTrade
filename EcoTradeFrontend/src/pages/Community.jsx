import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('growing-tips');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postError, setPostError] = useState(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const { currentUser } = useAuth();
  
  const API_BASE_URL = 'http://localhost:8080';

  // Categories for community posts
  const categories = [
    { id: 'growing-tips', name: 'Growing Tips' },
    { id: 'plant-care', name: 'Plant Care' },
    { id: 'troubleshooting', name: 'Troubleshooting' },
    { id: 'harvesting', name: 'Harvesting' },
    { id: 'composting', name: 'Composting' },
    { id: 'general', name: 'General Discussion' }
  ];

  // Initial mock data for posts
  const initialMockPosts = [
    {
      id: 1,
      title: 'Best practices for watering indoor plants',
      content: "I've found that the key to healthy indoor plants is consistent but moderate watering. Most indoor plants do better when allowed to dry out slightly between waterings. What are your watering routines?",
      userName: 'GreenThumb',
      userId: "mock-user-1", // Mock user ID for demo purposes
      createdAt: '2023-10-15T12:30:00Z',
      likes: 24,
      comments: [
        {
          id: 'c1',
          text: "I water my plants once a week and they're thriving!",
          userName: 'PlantLover',
          userId: 'mock-user-5',
          createdAt: '2023-10-16T10:15:00Z'
        },
        {
          id: 'c2',
          text: "Thanks for the tips! I've been overwatering my plants.",
          userName: 'NewGardener',
          userId: 'mock-user-6',
          createdAt: '2023-10-17T14:30:00Z'
        }
      ],
      category: 'plant-care'
    },
    {
      id: 2,
      title: 'My snake plant is turning yellow - help!',
      content: "I've had my snake plant for about 6 months and recently noticed some of the leaves turning yellow. I water it once every 2-3 weeks and it gets indirect light. Any ideas what could be causing this?",
      userName: 'PlantNewbie',
      userId: "mock-user-2",
      createdAt: '2023-10-12T09:15:00Z',
      likes: 5,
      comments: [
        {
          id: 'c3',
          text: "Snake plants don't like too much water. Check if the soil is draining properly.",
          userName: 'PlantExpert',
          userId: 'mock-user-7',
          createdAt: '2023-10-13T11:45:00Z'
        }
      ],
      category: 'troubleshooting'
    },
    {
      id: 3,
      title: 'Homemade compost formula that works wonders',
      content: "I've been experimenting with different compost mixtures and found a formula that has given me amazing results. 2 parts brown material (dried leaves, cardboard), 1 part green material (kitchen scraps, fresh grass), and a handful of garden soil to introduce microorganisms. Turn it weekly and keep it moderately moist.",
      userName: 'CompostKing',
      userId: "mock-user-3",
      createdAt: '2023-10-08T16:45:00Z',
      likes: 31,
      comments: [],
      category: 'composting'
    },
    {
      id: 4,
      title: 'When to harvest your herbs for maximum flavor',
      content: "I've found that harvesting herbs in the morning after the dew has dried but before the sun gets too hot gives the best flavor. The essential oils are most concentrated at this time. Also, harvest just before flowering for most herbs like basil and cilantro.",
      userName: 'HerbGardener',
      userId: "mock-user-4",
      createdAt: '2023-10-05T11:20:00Z',
      likes: 18,
      comments: [
        {
          id: 'c4',
          text: "This is so helpful! I've been harvesting my basil at the wrong time.",
          userName: 'CookingEnthusiast',
          userId: 'mock-user-8',
          createdAt: '2023-10-06T09:10:00Z'
        }
      ],
      category: 'harvesting'
    }
  ];

  // Load posts from localStorage or use initialMockPosts if nothing is stored
  useEffect(() => {
    try {
      setLoading(true);
      
      // Load posts from localStorage
      const savedPosts = localStorage.getItem('communityPosts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      } else {
        // If no posts are saved, use the initial mock data
        setPosts(initialMockPosts);
        // Save initial posts to localStorage
        localStorage.setItem('communityPosts', JSON.stringify(initialMockPosts));
      }
      
      // Load liked posts from localStorage
      const savedLikedPosts = localStorage.getItem('likedPosts');
      if (savedLikedPosts) {
        setLikedPosts(JSON.parse(savedLikedPosts));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Failed to load community posts. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('communityPosts', JSON.stringify(posts));
    }
  }, [posts]);

  // Save liked posts to localStorage whenever they change
  useEffect(() => {
    if (likedPosts.length > 0) {
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    }
  }, [likedPosts]);

  // Handle form submission for new post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPostError(null);
    
    if (!currentUser) {
      setPostError('You must be logged in to create a post');
      return;
    }
    
    if (!title.trim()) {
      setPostError('Please provide a title for your post');
      return;
    }
    
    if (!newPost.trim()) {
      setPostError('Post content cannot be empty');
      return;
    }
    
    try {
      // Create a unique ID with timestamp and random string
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      const newPostData = {
        id: uniqueId,
        title: title,
        content: newPost,
        userName: currentUser.name || currentUser.username || 'Anonymous',
        userId: currentUser.id || currentUser.userId || uniqueId, // Use current user's ID
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        category: category
      };
      
      // Add the new post to the top of the list
      const updatedPosts = [newPostData, ...posts];
      setPosts(updatedPosts);
      
      // Save to localStorage
      localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
      
      // Reset form
      setTitle('');
      setNewPost('');
      setCategory('growing-tips');
      
      // Show success message
      setPostSuccess(true);
      setTimeout(() => {
        setPostSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Failed to create post:', err);
      setPostError('Failed to create post. Please try again.');
    }
  };

  // Handle post like
  const handleLike = (postId) => {
    if (!currentUser) {
      setPostError('You must be logged in to like posts');
      return;
    }
    
    // Check if user already liked this post
    const alreadyLiked = likedPosts.includes(postId);
    
    // Update posts state with the new like count
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: alreadyLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
    
    // Update liked posts array
    if (alreadyLiked) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
  };

  // Toggle comment section for a post
  const toggleCommentSection = (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
      setCommentText('');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = (postId) => {
    if (!currentUser) {
      setPostError('You must be logged in to comment');
      return;
    }
    
    if (!commentText.trim()) {
      return;
    }
    
    // Create a unique ID for the comment
    const commentId = 'c-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Create the new comment
    const newComment = {
      id: commentId,
      text: commentText,
      userName: currentUser.name || currentUser.username || 'Anonymous',
      userId: currentUser.id || currentUser.userId,
      createdAt: new Date().toISOString()
    };
    
    // Update the posts with the new comment
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
    setCommentText('');
  };

  // Handle comment deletion
  const handleDeleteComment = (postId, commentId) => {
    if (!currentUser) return;
    
    // Find the post and comment
    const post = posts.find(p => p.id === postId);
    const comment = post?.comments?.find(c => c.id === commentId);
    
    // Check if current user is the comment creator
    if (!comment || (comment.userId !== currentUser.id && comment.userId !== currentUser.userId)) {
      setPostError('You can only delete your own comments');
      return;
    }
    
    // Update the posts with the comment removed
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.filter(c => c.id !== commentId)
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
  };

  // Handle post deletion
  const handleDeletePost = (postId) => {
    if (!currentUser) return;
    
    // Find the post
    const postToDelete = posts.find(post => post.id === postId);
    
    // Check if current user is the post creator
    if (!postToDelete || postToDelete.userId !== currentUser.id && postToDelete.userId !== currentUser.userId) {
      setPostError('You can only delete your own posts');
      return;
    }
    
    // Remove the post from the list
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    
    // Also remove from liked posts if it exists
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get category name from id
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'General Discussion';
  };

  // Check if current user is the creator of a post
  const isPostCreator = (post) => {
    if (!currentUser) return false;
    return post.userId === currentUser.id || post.userId === currentUser.userId;
  };

  // Check if current user is the creator of a comment
  const isCommentCreator = (comment) => {
    if (!currentUser) return false;
    return comment.userId === currentUser.id || comment.userId === currentUser.userId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Forum</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* New Post Form */}
        <div className="lg:col-span-4">
          <div className="bg-white shadow rounded-lg p-6 mb-8 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Share Your Experience</h2>
            
            {postSuccess && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
                Your post has been shared with the community!
              </div>
            )}
            
            {postError && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {postError}
              </div>
            )}
            
            {!currentUser ? (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                <p>Please log in to share your experience with the community.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-black"
                      placeholder="Enter a title for your post"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-black"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="post" className="block text-sm font-medium text-gray-700">
                      Your Post
                    </label>
                    <textarea
                      id="post"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows="6"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-black"
                      placeholder="Share your plant growth techniques, tips, or ask questions..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full btn btn-primary"
                    >
                      Post to Community
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Community Guidelines</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>Be respectful and constructive in your posts</li>
                <li>Share your successes and challenges with plant growth</li>
                <li>Include details to help others understand your situation</li>
                <li>Tag your posts with the appropriate category</li>
                <li>Help others by responding to questions when you can</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Posts List */}
        <div className="lg:col-span-8 mt-8 lg:mt-0">
          <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
            <div className="p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Community Posts</h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">
                {error}
              </div>
            ) : posts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No posts yet. Be the first to share with the community!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <div key={post.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                            {post.userName.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 ml-2">
                              {getCategoryName(post.category)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Posted by {post.userName} on {formatDate(post.createdAt)}
                          </p>
                          <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                            {post.content}
                          </div>
                          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center space-x-1 hover:text-primary-600 ${likedPosts.includes(post.id) ? 'text-primary-600 font-bold' : ''}`}
                              disabled={!currentUser}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={likedPosts.includes(post.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              <span>{post.likes}</span>
                            </button>
                            <button 
                              onClick={() => toggleCommentSection(post.id)}
                              className={`flex items-center space-x-1 hover:text-primary-600 ${activeCommentPostId === post.id ? 'text-primary-600 font-bold' : ''}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{post.comments?.length || 0}</span>
                            </button>
                          </div>
                          
                          {/* Comment Section */}
                          {activeCommentPostId === post.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                              
                              {/* Comment List */}
                              {post.comments && post.comments.length > 0 ? (
                                <div className="space-y-4 mb-4">
                                  {post.comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start group">
                                      <div className="flex-shrink-0">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">
                                          {comment.userName.charAt(0).toUpperCase()}
                                        </div>
                                      </div>
                                      <div className="ml-3 flex-1 bg-gray-50 rounded-lg p-3 relative">
                                        <div className="flex justify-between items-baseline">
                                          <p className="text-xs font-medium text-gray-900">{comment.userName}</p>
                                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-700">{comment.text}</p>
                                        
                                        {/* Delete Comment Button */}
                                        {isCommentCreator(comment) && (
                                          <button 
                                            onClick={() => handleDeleteComment(post.id, comment.id)}
                                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete comment"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 mb-4">No comments yet. Be the first to comment!</p>
                              )}
                              
                              {/* New Comment Form */}
                              {currentUser ? (
                                <div className="flex items-start">
                                  <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xs">
                                      {(currentUser.name || currentUser.username || 'A').charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <div className="flex items-end">
                                      <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-black text-sm"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleCommentSubmit(post.id)}
                                        disabled={!commentText.trim()}
                                        className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                      >
                                        Post
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-yellow-600">Please log in to comment.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete button - only visible for post creator */}
                      {isPostCreator(post) && (
                        <button 
                          onClick={() => handleDeletePost(post.id)} 
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full p-2 transition-colors duration-200 ml-2"
                          title="Delete post"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 