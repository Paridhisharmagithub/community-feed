import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.get();
      setLeaders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (position) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${position + 1}`;
    }
  };

  const getRankGradient = (index) => {
    switch (index) {
      case 0: return 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))';
      case 1: return 'linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.05))';
      case 2: return 'linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.05))';
      default: return 'rgba(10, 10, 15, 0.5)';
    }
  };

  const getRankBorderColor = (index) => {
    switch (index) {
      case 0: return 'rgba(255, 215, 0, 0.3)';
      case 1: return 'rgba(192, 192, 192, 0.3)';
      case 2: return 'rgba(205, 127, 50, 0.3)';
      default: return 'var(--color-border)';
    }
  };

  const styles = {
    leaderboardWidget: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '1.5rem',
      position: 'sticky',
      top: '2rem',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
    leaderboardHeader: {
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid var(--color-border)',
    },
    title: {
      fontFamily: 'var(--font-display)',
      fontSize: '1.5rem',
      fontWeight: '900',
      background: 'linear-gradient(135deg, var(--color-accent-bright), var(--color-accent))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.25rem',
    },
    subtitle: {
      fontSize: '0.75rem',
      color: 'var(--color-text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontWeight: '500',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      padding: '2rem',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid var(--color-border)',
      borderTop: '3px solid var(--color-accent)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    errorMessage: {
      textAlign: 'center',
      color: 'var(--color-like)',
      padding: '1rem',
      fontSize: '0.9rem',
    },
    emptyLeaderboard: {
      textAlign: 'center',
      color: 'var(--color-text-muted)',
      padding: '2rem 1rem',
      fontSize: '0.9rem',
    },
    leaderboardList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    leaderboardItem: (index, animationDelay) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: getRankGradient(index),
      border: `1px solid ${getRankBorderColor(index)}`,
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      animation: `slideIn 0.5s ease-out ${animationDelay}s backwards`,
      position: 'relative',
      overflow: 'hidden',
    }),
    rankBadge: {
      fontSize: '1.5rem',
      minWidth: '40px',
      textAlign: 'center',
      fontWeight: '900',
    },
    leaderInfo: {
      flex: 1,
      minWidth: 0,
    },
    leaderName: {
      fontWeight: '600',
      fontSize: '0.95rem',
      color: 'var(--color-text)',
      marginBottom: '0.25rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    leaderStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
      color: 'var(--color-text-muted)',
    },
    statDivider: {
      opacity: 0.3,
    },
    karmaBadge: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0.5rem 0.75rem',
      background: 'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
      borderRadius: '8px',
      minWidth: '60px',
    },
    karmaValue: {
      fontWeight: '900',
      fontSize: '1.2rem',
      color: 'white',
      fontFamily: 'var(--font-display)',
    },
    karmaLabel: {
      fontSize: '0.65rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
    },
    leaderboardFooter: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
      color: 'var(--color-text-muted)',
    },
    updateIndicator: {
      color: 'var(--color-accent)',
      animation: 'pulse 2s ease-in-out infinite',
    },
  };

  if (loading) {
    return (
      <div style={styles.leaderboardWidget}>
        <div style={styles.leaderboardHeader}>
          <h2 style={styles.title}>🏆 Top Contributors</h2>
          <p style={styles.subtitle}>Last 24 hours</p>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.leaderboardWidget}>
        <div style={styles.leaderboardHeader}>
          <h2 style={styles.title}>🏆 Top Contributors</h2>
          <p style={styles.subtitle}>Last 24 hours</p>
        </div>
        <div style={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.leaderboardWidget}>
      <div style={styles.leaderboardHeader}>
        <h2 style={styles.title}>🏆 Top Contributors</h2>
        <p style={styles.subtitle}>Last 24 hours</p>
      </div>

      {leaders.length === 0 ? (
        <div style={styles.emptyLeaderboard}>
          <p>No activity in the last 24 hours</p>
        </div>
      ) : (
        <div style={styles.leaderboardList}>
          {leaders.map((leader, index) => (
            <div 
              key={leader.user_id} 
              style={styles.leaderboardItem(index, index * 0.1)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.background = 'rgba(10, 10, 15, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = getRankBorderColor(index);
                e.currentTarget.style.background = getRankGradient(index);
              }}
            >
              <div style={styles.rankBadge}>
                {getMedalEmoji(index)}
              </div>
              
              <div style={styles.leaderInfo}>
                <div style={styles.leaderName}>{leader.username}</div>
                <div style={styles.leaderStats}>
                  <span>❤️ {leader.post_likes} posts</span>
                  <span style={styles.statDivider}>•</span>
                  <span>💬 {leader.comment_likes} comments</span>
                </div>
              </div>

              <div style={styles.karmaBadge}>
                <div style={styles.karmaValue}>{leader.karma_24h}</div>
                <div style={styles.karmaLabel}>karma</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.leaderboardFooter}>
        <span style={styles.updateIndicator}>●</span> Live updates
      </div>
    </div>
  );
};

export default Leaderboard;