import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import Leaderboard from '../components/Leaderboard';
import { postsAPI } from '../services/api';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getAll();
      setPosts(response.data.results || response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = async (content) => {
    try {
      await postsAPI.create({ content });
      await fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      await postsAPI.like(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, is_liked: true, like_count: post.like_count + 1 }
          : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await postsAPI.unlike(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, is_liked: false, like_count: post.like_count - 1 }
          : post
      ));
    } catch (err) {
      console.error('Error unliking post:', err);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const styles = {
    feedContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      minHeight: '100vh',
    },
    feedHeader: {
      textAlign: 'center',
      marginBottom: '3rem',
      animation: 'fadeIn 0.8s ease-out',
    },
    title: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(2rem, 5vw, 4rem)',
      fontWeight: '900',
      background: 'linear-gradient(135deg, var(--color-accent-bright), var(--color-accent))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem',
      letterSpacing: '-0.02em',
    },
    description: {
      color: 'var(--color-text-muted)',
      fontSize: '1.1rem',
      marginTop: '0.5rem',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    feedLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '2rem',
      alignItems: 'start',
    },
    feedMain: {
      minWidth: 0,
    },
    postsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    feedSidebar: {
      position: 'relative',
    },
    loadingScreen: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.5rem',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid var(--color-border)',
      borderTop: '3px solid var(--color-accent)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
      color: 'var(--color-text-muted)',
      fontSize: '1.1rem',
    },
    errorScreen: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.5rem',
    },
    errorText: {
      color: 'var(--color-text-muted)',
      fontSize: '1.1rem',
    },
    retryButton: {
      padding: '0.75rem 2rem',
      background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-bright))',
      color: 'var(--color-bg)',
      border: 'none',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'var(--font-mono)',
    },
    emptyFeed: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: 'var(--color-text-muted)',
      fontSize: '1.1rem',
      background: 'var(--color-surface)',
      border: '1px dashed var(--color-border)',
      borderRadius: '16px',
    },
  };

  if (loading) {
    return (
      <div style={styles.feedContainer}>
        <div style={styles.loadingScreen}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.feedContainer}>
        <div style={styles.errorScreen}>
          <p style={styles.errorText}>{error}</p>
          <button 
            style={styles.retryButton} 
            onClick={fetchPosts}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(247, 215, 148, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.feedContainer}>
      <div style={styles.feedHeader}>
        <h1 style={styles.title}>Community Feed</h1>
        <p style={styles.description}>
          Share your thoughts, engage in discussions, and climb the leaderboard
        </p>
      </div>

      <div style={styles.feedLayout}>
        <div style={styles.feedMain}>
          <CreatePost onPostCreated={handlePostCreated} />

          <div style={styles.postsList}>
            {posts.length === 0 ? (
              <div style={styles.emptyFeed}>
                <p>No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <div 
                  key={post.id} 
                  style={{ 
                    animation: `fadeIn 0.6s ease-out ${index * 0.1}s backwards` 
                  }}
                >
                  <Post
                    post={post}
                    onLike={handleLike}
                    onUnlike={handleUnlike}
                    onClick={handlePostClick}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <aside style={styles.feedSidebar}>
          <Leaderboard />
        </aside>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .feedLayout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Feed;