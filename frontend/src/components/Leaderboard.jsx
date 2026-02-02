import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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
      return "from-amber-500/20 to-yellow-500/20 border-amber-500/30";
    if (position === 1)
      return "from-slate-400/20 to-zinc-400/20 border-slate-400/30";
    if (position === 2)
      return "from-orange-700/20 to-amber-700/20 border-orange-700/30";
    return "from-slate-800/30 to-slate-900/30 border-slate-700/30";
  };

  return (
    <div className="sticky top-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/50 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Top Contributors</h3>
        <p className="text-xs text-slate-500">Last 24 hours</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : data.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-6">
          No activity yet
        </p>
      ) : (
        <ol className="space-y-3">
          {data.map((u, i) => {
            const username = u?.username || "anonymous";
            const initial = username.charAt(0).toUpperCase();

            return (
              <li
                key={i}
                className={`bg-gradient-to-r ${getRankGradient(
                  i
                )} border rounded-xl p-4`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 flex items-center justify-center text-lg">
                      {getMedalEmoji(i) || `#${i + 1}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                          {initial}
                        </div>
                        <span className="text-sm font-semibold text-slate-200 truncate">
                          @{username}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1 flex gap-3">
                        <span>❤️ {u?.post_likes ?? 0}</span>
                        <span>💬 {u?.comment_likes ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="bg-indigo-600 rounded-lg px-3 py-1.5 text-center">
                    <div className="text-sm font-bold text-white">
                      {u?.karma_24h ?? 0}
                    </div>
                    <div className="text-[9px] text-indigo-200 uppercase">
                      Karma
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/50 text-xs text-slate-500 flex justify-between">
        <span>⏱ Updates every 30s</span>
        <span>Post +5 • Comment +1</span>
      </div>
    </div>
  );
}
