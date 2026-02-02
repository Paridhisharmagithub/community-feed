import React, { useEffect, useState } from "react";
import api from "../services/api";
import Post from "../components/Post";
import Leaderboard from "../components/Leaderboard";
import { useAuth } from "../context/AuthContext";


export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user, logout } = useAuth();


  const load = async () => {
    try {
      const res = await api.get("posts/");
      setPosts(res.data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!text.trim() || creating) return;
    
    setCreating(true);
    try {
      await api.post("posts/create/", { content: text });
      setText("");
      await load();
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-medium text-indigo-400">Live Community</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
              Community
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Feed</span>
            </h1>
            
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Share your thoughts, engage in discussions, and climb the leaderboard
            </p>
          </div>
        </div>
      </div>
        <button
  onClick={logout}
  className="absolute top-6 right-6 text-sm text-slate-400 hover:text-rose-400"
>
  Logout
</button>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <span>Share Your Thoughts</span>
                    <span className="text-xs text-slate-600">• What's on your mind?</span>
                  </h3>
                  
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write something interesting for the community..."
                    rows="4"
                    className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-indigo-500/50 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        {text.length} characters
                      </span>
                    </div>
                    
                    <button
  onClick={create}
  disabled={!user || !text.trim() || creating}
  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl disabled:opacity-50"
>
  {!user ? "Login to Post" : creating ? "Posting..." : "Post"}
</button>

                  </div>
                </div>
              </div>
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/50 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No posts yet</h3>
                <p className="text-slate-500 mb-4">Be the first to share something with the community!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((p) => (
                  <Post key={p.id} post={p} refresh={load} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}