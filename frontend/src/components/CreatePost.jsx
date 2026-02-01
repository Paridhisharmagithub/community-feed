import React, { useState } from 'react';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onPostCreated(content);
      setContent('');
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    createPost: {
      background: 'var(--color-surface)',
      border: `1px solid ${isExpanded ? 'var(--color-accent)' : 'var(--color-border)'}`,
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      transition: 'all 0.3s ease',
      animation: 'fadeIn 0.5s ease-out',
      boxShadow: isExpanded ? '0 8px 30px rgba(247, 215, 148, 0.15)' : 'none',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
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
      transition: 'all 0.3s ease',
      minHeight: '50px',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      animation: 'fadeIn 0.3s ease-out',
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      border: '1px solid var(--color-border)',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      background: 'transparent',
      color: 'var(--color-text-muted)',
    },
    submitButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '700',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-bright))',
      color: 'var(--color-bg)',
      boxShadow: '0 4px 12px rgba(247, 215, 148, 0.3)',
    },
  };

  return (
    <div style={styles.createPost}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <textarea
          style={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Share your thoughts..."
          rows={isExpanded ? 4 : 1}
          disabled={isSubmitting}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247, 215, 148, 0.1)';
            e.currentTarget.style.background = 'rgba(10, 10, 15, 0.8)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'var(--color-bg)';
          }}
        />
        
        {isExpanded && (
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => {
                setIsExpanded(false);
                setContent('');
              }}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-hover)';
                e.currentTarget.style.color = 'var(--color-text)';
                e.currentTarget.style.borderColor = 'var(--color-text-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-muted)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting || !content.trim()}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(247, 215, 148, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(247, 215, 148, 0.3)';
              }}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;