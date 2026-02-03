import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get("leaderboard/");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMedalEmoji = (position) => {
    if (position === 0) return "🥇";
    if (position === 1) return "🥈";
    if (position === 2) return "🥉";
    return null;
  };

  const getRankGradient = (position) => {
    if (position === 0)
      return "from-amber-500/20 to-yellow-500/20 border-amber-500/40";
    if (position === 1)
      return "from-slate-400/20 to-zinc-400/20 border-slate-400/40";
    if (position === 2)
      return "from-orange-700/20 to-amber-700/20 border-orange-700/40";
    return "from-slate-800/30 to-slate-900/30 border-slate-700/30";
  };

  const getRankTitle = (position, karma) => {
    if (position === 0) return "👑 Champion";
    if (karma > 100) return "🔥 Elite";
    if (karma > 50) return "⭐ Rising Star";
    return "💫 Contributor";
  };

  return (
    <div className="sticky top-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header with Trophy */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-slate-800/50 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
            <svg
              className="w-7 h-7 text-amber-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Top Contributors
              <span className="text-xs px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
                LIVE
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Last 24 hours • Refreshes every 30s</p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2">
          {['24h', '7d', 'All Time'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-slate-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-sm text-slate-500 font-medium mb-1">No activity yet</p>
            <p className="text-xs text-slate-600">Be the first to earn karma!</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {data.map((u, i) => {
              const username = u?.username || "anonymous";
              const initial = username.charAt(0).toUpperCase();
              const karma = u?.karma_24h || 0;
              const postLikes = u?.post_likes || 0;
              const commentLikes = u?.comment_likes || 0;
              const medal = getMedalEmoji(i);

              return (
                <li
                  key={i}
                  className={`group relative bg-gradient-to-r ${getRankGradient(
                    i
                  )} border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    i === 0 ? 'ring-2 ring-amber-500/30' : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex items-center gap-3">
                    {/* Medal/Number */}
                    <div className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center">
                      {medal ? (
                        <span className="text-3xl">{medal}</span>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700">
                          <span className="text-lg font-bold text-slate-400">
                            {i + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      {/* Username and Badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-200 truncate hover:text-indigo-400 cursor-pointer transition-colors">
                              {username}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[9px] font-bold rounded uppercase">
                              {getRankTitle(i, karma)}
                            </span>
                          </div>
                          
                          {/* Stats Row */}
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1" title="Post Likes">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                              {postLikes} posts
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span className="flex items-center gap-1" title="Comment Likes">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                              {commentLikes} comments
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Karma Display */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl px-3 py-2 shadow-lg min-w-[70px]">
                          <div className="text-center">
                            <div className="text-lg font-bold text-white leading-none">
                              {karma}
                            </div>
                            <div className="text-[9px] text-indigo-200 uppercase tracking-wider font-medium mt-0.5">
                              Karma
                            </div>
                          </div>
                        </div>
                        {/* Trending indicator */}
                        {i === 0 && karma > 50 && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center animate-pulse">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {i < 3 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/30">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Level Progress</span>
                        <span>{Math.min(Math.floor((karma % 100) / 100 * 100), 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((karma % 100), 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800/50 p-4 bg-slate-900/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Live updates</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Post +5
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Comment +1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}