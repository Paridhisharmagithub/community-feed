import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const Post = ({ post, onLike, onUnlike, onClick }) => {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    setIsLiking(true);
    try {
      if (post.is_liked) {
        await onUnlike(post.id);
      } else {
        await onLike(post.id);
      }
    } finally {
      setIsLiking(false);
    }
  };

  const styles = {
    postCard: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'fadeIn 0.5s ease-out',
    },
    postHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    postAuthor: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    authorAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '1.1rem',
      color: 'white',
      textTransform: 'uppercase',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },
    authorInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.1rem',
    },
    authorName: {
      fontWeight: '500',
      fontSize: '0.95rem',
      color: 'var(--color-text)',
    },
    postTime: {
      fontSize: '0.8rem',
      color: 'var(--color-text-muted)',
    },
    postContent: {
      margin: '1rem 0',
      lineHeight: '1.7',
    },
    contentText: {
      color: 'var(--color-text)',
      fontSize: '0.95rem',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
    },
    postFooter: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      paddingTop: '1rem',
      borderTop: '1px solid var(--color-border)',
      marginTop: '1rem',
    },
    likeButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'transparent',
      border: 'none',
      color: post.is_liked ? 'var(--color-like)' : 'var(--color-text-muted)',
      fontSize: '0.9rem',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      transition: 'all 0.2s ease',
      cursor: isLiking ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--font-mono)',
    },
    heartIcon: {
      width: '20px',
      height: '20px',
      transition: 'all 0.2s ease',
    },
    commentCount: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'var(--color-text-muted)',
      fontSize: '0.9rem',
    },
    commentIcon: {
      width: '20px',
      height: '20px',
    },
  };

  return (
    <div 
      style={styles.postCard}
      onClick={() => onClick(post.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(247, 215, 148, 0.3)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3), 0 0 60px rgba(247, 215, 148, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
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
          style={styles.likeButton}
          onClick={handleLike}
          disabled={isLiking}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 107, 157, 0.1)';
            e.currentTarget.style.color = 'var(--color-like)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
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
          <span>{post.like_count}</span>
        </button>

        <div style={styles.commentCount}>
          <svg style={styles.commentIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{post.comment_count || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default Post;