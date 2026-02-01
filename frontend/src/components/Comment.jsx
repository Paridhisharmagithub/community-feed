import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment, onLike, onUnlike, onReply, depth = 0 }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    setIsLiking(true);
    try {
      if (comment.is_liked) {
        await onUnlike(comment.id);
      } else {
        await onLike(comment.id);
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxDepth = 5;
  const shouldIndent = depth < maxDepth;

  const styles = {
    commentWrapper: {
      position: 'relative',
      marginLeft: shouldIndent ? `${depth * 2}rem` : `${maxDepth * 2}rem`,
      marginTop: '1rem',
      animation: 'slideIn 0.4s ease-out',
      paddingLeft: shouldIndent ? '1rem' : '0',
    },
    commentLine: {
      position: 'absolute',
      left: '-1rem',
      top: 0,
      bottom: 0,
      width: '2px',
      background: 'linear-gradient(180deg, rgba(247, 215, 148, 0.2), rgba(247, 215, 148, 0.05))',
      opacity: '0.5',
    },
    commentCard: {
      background: 'rgba(22, 22, 31, 0.6)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '1rem',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.2s ease',
    },
    commentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem',
    },
    commentAuthor: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    authorAvatarSmall: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '0.75rem',
      color: 'white',
      textTransform: 'uppercase',
    },
    authorNameSmall: {
      fontWeight: '500',
      fontSize: '0.85rem',
      color: 'var(--color-text)',
    },
    commentTime: {
      fontSize: '0.75rem',
      color: 'var(--color-text-muted)',
      marginLeft: '0.25rem',
    },
    commentContent: {
      margin: '0.5rem 0',
    },
    contentText: {
      color: 'var(--color-text)',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
    },
    commentActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '0.75rem',
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: 'transparent',
      border: 'none',
      color: 'var(--color-text-muted)',
      fontSize: '0.8rem',
      padding: '0.4rem 0.75rem',
      borderRadius: '16px',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
    },
    likeButtonSmall: {
      color: comment.is_liked ? 'var(--color-like)' : 'var(--color-text-muted)',
    },
    icon: {
      width: '16px',
      height: '16px',
    },
    replyForm: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid var(--color-border)',
      animation: 'fadeIn 0.3s ease-out',
    },
    textarea: {
      width: '100%',
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '0.75rem',
      color: 'var(--color-text)',
      fontSize: '0.85rem',
      fontFamily: 'var(--font-mono)',
      resize: 'vertical',
      transition: 'all 0.2s ease',
    },
    replyFormActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      marginTop: '0.75rem',
    },
    cancelButton: {
      padding: '0.5rem 1.25rem',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      border: '1px solid var(--color-border)',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      background: 'transparent',
      color: 'var(--color-text-muted)',
    },
    submitButton: {
      padding: '0.5rem 1.25rem',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-bright))',
      color: 'var(--color-bg)',
    },
  };

  return (
    <div style={styles.commentWrapper}>
      {shouldIndent && <div style={styles.commentLine} />}
      <div 
        style={styles.commentCard}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(247, 215, 148, 0.2)';
          e.currentTarget.style.background = 'rgba(22, 22, 31, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.background = 'rgba(22, 22, 31, 0.6)';
        }}
      >
        <div style={styles.commentHeader}>
          <div style={styles.commentAuthor}>
            <div style={styles.authorAvatarSmall}>
              {comment.author.username.charAt(0).toUpperCase()}
            </div>
            <span style={styles.authorNameSmall}>{comment.author.username}</span>
            <span style={styles.commentTime}>
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div style={styles.commentContent}>
          <p style={styles.contentText}>{comment.content}</p>
        </div>

        <div style={styles.commentActions}>
          <button
            style={{ ...styles.actionButton, ...styles.likeButtonSmall }}
            onClick={handleLike}
            disabled={isLiking}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 157, 0.1)';
              e.currentTarget.style.color = 'var(--color-like)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = comment.is_liked ? 'var(--color-like)' : 'var(--color-text-muted)';
            }}
          >
            <svg
              style={styles.icon}
              viewBox="0 0 24 24"
              fill={comment.is_liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{comment.like_count}</span>
          </button>

          <button
            style={styles.actionButton}
            onClick={() => setIsReplying(!isReplying)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(247, 215, 148, 0.1)';
              e.currentTarget.style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 17l-5-5 5-5M20 12H4" />
            </svg>
            Reply
          </button>
        </div>

        {isReplying && (
          <form style={styles.replyForm} onSubmit={handleReplySubmit}>
            <textarea
              style={styles.textarea}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
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
            <div style={styles.replyFormActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => setIsReplying(false)}
                disabled={isSubmitting}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-surface)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={isSubmitting || !replyContent.trim()}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(247, 215, 148, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isSubmitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onUnlike={onUnlike}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;