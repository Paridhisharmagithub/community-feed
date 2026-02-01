import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Comment from '../components/Comment';
import { postsAPI, commentsAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getOne(id);
      setPost(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostLike = async () => {
    try {
      if (post.is_liked) {
        await postsAPI.unlike(post.id);
        setPost({ ...post, is_liked: false, like_count: post.like_count - 1 });
      } else {
        await postsAPI.like(post.id);
        setPost({ ...post, is_liked: true, like_count: post.like_count + 1 });
      }
    } catch (err) {
      console.error('Error toggling post like:', err);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      await commentsAPI.like(commentId);
      await fetchPost();
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleCommentUnlike = async (commentId) => {
    try {
      await commentsAPI.unlike(commentId);
      await fetchPost();
    } catch (err) {
      console.error('Error unliking comment:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setIsSubmitting(true);
    try {
      await commentsAPI.create({
        post: post.id,
        content: commentContent,
      });
      setCommentContent('');
      await fetchPost();
    } catch (err) {
      console.error('Error creating comment:', err);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      await commentsAPI.create({
        post: post.id,
        parent: parentId,
        content: content,
      });
      await fetchPost();
    } catch (err) {
      console.error('Error creating reply:', err);
      alert('Failed to post reply');
    }
  };

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
      minHeight: '100vh',
    },
    backButton: {
      background: 'transparent',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text)',
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '2rem',
      fontFamily: 'var(--font-mono)',
    },
    postCard: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      animation: 'fadeIn 0.6s ease-out',
    },
    postHeader: {
      marginBottom: '1.5rem',
    },
    postAuthor: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    authorAvatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '1.5rem',
      color: 'white',
      textTransform: 'uppercase',
      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
    },
    authorInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.1rem',
    },
    authorName: {
      fontWeight: '600',
      fontSize: '1.1rem',
      color: 'var(--color-text)',
    },
    postTime: {
      fontSize: '0.9rem',
      color: 'var(--color-text-muted)',
      marginTop: '0.25rem',
    },
    postContent: {
      margin: '1.5rem 0',
    },
    contentText: {
      color: 'var(--color-text)',
      fontSize: '1.05rem',
      lineHeight: '1.8',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
    },
    postFooter: {
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--color-border)',
      marginTop: '1.5rem',
    },
    likeButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: 'transparent',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-muted)',
      fontSize: '1rem',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
    },
    heartIcon: {
      width: '24px',
      height: '24px',
    },
    commentsSection: {
      animation: 'fadeIn 0.8s ease-out',
    },
    commentsTitle: {
      fontFamily: 'var(--font-display)',
      fontSize: '1.8rem',
      fontWeight: '900',
      marginBottom: '1.5rem',
      background: 'linear-gradient(135deg, var(--color-accent-bright), var(--color-accent))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    commentForm: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
    },
    textarea: {
      width: '100%',
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '1rem',
      color: 'var(--color-text)',
      fontSize: '0.95rem',
      fontFamily: 'var(--font-mono)',
      resize: 'vertical',
      marginBottom: '1rem',
      transition: 'all 0.2s ease',
    },
    submitButton: {
      background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-bright))',
      color: 'var(--color-bg)',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'var(--font-mono)',
    },
    commentsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    noComments: {
      textAlign: 'center',
      padding: '3rem 2rem',
      color: 'var(--color-text-muted)',
      fontSize: '1rem',
      background: 'var(--color-surface)',
      border: '1px dashed var(--color-border)',
      borderRadius: '16px',
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
    errorScreen: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.5rem',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingScreen}>
          <div style={styles.spinner} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={styles.container}>
        <div style={styles.errorScreen}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>{error || 'Post not found'}</p>
          <button 
            style={styles.backButton} 
            onClick={() => navigate('/')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface)';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.color = 'var(--color-accent)';
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button 
        style={styles.backButton} 
        onClick={() => navigate('/')}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-surface)';
          e.currentTarget.style.borderColor = 'var(--color-accent)';
          e.currentTarget.style.color = 'var(--color-accent)';
          e.currentTarget.style.transform = 'translateX(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        ← Back to Feed
      </button>

      <div style={styles.postCard}>
        <div style={styles.postHeader}>
          <div style={styles.postAuthor}>
            <div style={styles.authorAvatar}>
              {post.author.username.charAt(0).toUpperCase()}
            </div>
            <div style={styles.authorInfo}>
              <div style={styles.authorName}>{post.author.username}</div>
              <div style={styles.postTime}>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.postContent}>
          <p style={styles.contentText}>{post.content}</p>
        </div>

        <div style={styles.postFooter}>
          <button
            style={{
              ...styles.likeButton,
              background: post.is_liked ? 'rgba(255, 107, 157, 0.1)' : 'transparent',
              borderColor: post.is_liked ? 'var(--color-like)' : 'var(--color-border)',
              color: post.is_liked ? 'var(--color-like)' : 'var(--color-text-muted)',
            }}
            onClick={handlePostLike}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 157, 0.1)';
              e.currentTarget.style.borderColor = 'var(--color-like)';
              e.currentTarget.style.color = 'var(--color-like)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = post.is_liked ? 'rgba(255, 107, 157, 0.1)' : 'transparent';
              e.currentTarget.style.borderColor = post.is_liked ? 'var(--color-like)' : 'var(--color-border)';
              e.currentTarget.style.color = post.is_liked ? 'var(--color-like)' : 'var(--color-text-muted)';
            }}
          >
            <svg
              style={styles.heartIcon}
              viewBox="0 0 24 24"
              fill={post.is_liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{ fontWeight: '600' }}>{post.like_count} likes</span>
          </button>
        </div>
      </div>

      <div style={styles.commentsSection}>
        <h2 style={styles.commentsTitle}>
          {post.comments?.length || 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
        </h2>

        <form style={styles.commentForm} onSubmit={handleCommentSubmit}>
          <textarea
            style={styles.textarea}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
            disabled={isSubmitting}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247, 215, 148, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            style={styles.submitButton}
            disabled={isSubmitting || !commentContent.trim()}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(247, 215, 148, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div style={styles.commentsList}>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onLike={handleCommentLike}
                onUnlike={handleCommentUnlike}
                onReply={handleReply}
                depth={0}
              />
            ))
          ) : (
            <div style={styles.noComments}>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;