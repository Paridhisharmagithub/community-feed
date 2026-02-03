import React, { useEffect, useState } from "react";
import api from "../services/api";
import CommentTree from "./CommentTree";

export default function Post({ post, refresh }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [comment, setComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  //const [showShareMenu, setShowShareMenu] = useState(false);

  const load = async () => {
    const res = await api.get(`posts/${post.id}/`);
    setDetail(res.data);
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const like = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await api.post(`posts/${post.id}/like/`);
      refresh();
      if (open) load();
    } finally {
      setIsLiking(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    await api.post(`posts/${post.id}/comments/`, { content: comment });
    setComment("");
    load();
  };

  // Calculate time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate karma earned
  const karmaEarned = post.like_count * 5;
  const userLevel = Math.floor(karmaEarned / 50) + 1;

  return (
    <div className="group bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/50 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      {/* Reddit-style Vote Bar */}
      <div className="flex">
        {/* Left Vote Section */}
        <div className="w-14 bg-slate-900/80 border-r border-slate-800/50 flex flex-col items-center py-4 gap-1">
          <button
            onClick={like}
            disabled={isLiking}
            className={`p-2 rounded-lg transition-all duration-200 ${
              post.is_liked
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
          
          <div className="flex flex-col items-center py-1">
            <span className={`text-sm font-bold ${post.is_liked ? 'text-rose-400' : 'text-slate-300'}`}>
              {post.like_count}
            </span>
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">votes</span>
          </div>

          <button
            className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200"
            title="Downvote (Premium)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar with Level Badge */}
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-indigo-500/20">
                  {post.author.username.charAt(0).toUpperCase()}
                </div>
                {/* User Level Badge */}
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg">
                  L{userLevel}
                </div>
              </div>
              
              {/* Author Info with Stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-indigo-400 font-semibold text-base hover:underline cursor-pointer">
                    {post.author.username}
                  </span>
                  
                  {/* User Flair */}
                  {karmaEarned > 100 && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                      🔥 Hot Contributor
                    </span>
                  )}
                  
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span className="text-xs text-slate-500 hover:text-slate-400 cursor-pointer" title={new Date(post.created_at).toLocaleString()}>
                    {getTimeAgo(post.created_at)}
                  </span>
                </div>
                
                {/* Post Metadata */}
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    +{karmaEarned} karma
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                    {detail?.comments?.length || post.comment_count || 0} comments
                  </span>
                </div>
              </div>
            </div>

            {/* Award Button */}
            <button
              className="ml-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all duration-200 group/award"
              title="Give Award"
            >
              <svg className="w-5 h-5 group-hover/award:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </div>

          {/* Content Section */}
          <div className="mb-4">
            <p className="text-slate-200 leading-relaxed text-base whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>

          {/* Enhanced Footer Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-800/50">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-indigo-400 transition-all duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {open ? "Hide" : "Comment"}
            </button>

            

            {/* Engagement Indicator */}
            <div className="ml-auto flex items-center gap-2 text-xs">
              {post.like_count > 10 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-400 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Trending
                </span>
              )}
              <span className="text-slate-600">
                {Math.round((post.like_count / (post.like_count + 1)) * 100)}% upvoted
              </span>
            </div>
          </div>

          {/* Expanded Discussion Section */}
          {open && detail && (
            <div className="mt-6 pt-6 border-t border-slate-800/50 space-y-4">
              {/* Enhanced Add Comment Section */}
              <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-xl p-4 border border-slate-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                    {post.author.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-400">Comment as <span className="text-indigo-400 font-medium">{post.author.username}</span></span>
                </div>
                
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-700/50 focus:border-indigo-500/50 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors" title="Bold">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/>
                      </svg>
                    </button>
                    <button className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors" title="Italic">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.5 5L10 19h2.5l1.5-14h-2.5z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <button
                    onClick={addComment}
                    disabled={!comment.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Comment
                  </button>
                </div>
              </div>

              {/* Comments Header with Sort */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                  </svg>
                  {detail.comments?.length || 0} Comments
                </h4>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Sort by:</span>
                  <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500">
                    <option>Best</option>
                    <option>Top</option>
                    <option>New</option>
                    <option>Controversial</option>
                  </select>
                </div>
              </div>

              {/* Comments Tree */}
              {detail.comments?.length > 0 ? (
                <CommentTree
                  comments={detail.comments}
                  postId={post.id}
                  refresh={load}
                />
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800/50">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-base font-medium mb-1">No Comments Yet</p>
                  <p className="text-sm">Be the first to share what you think!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}