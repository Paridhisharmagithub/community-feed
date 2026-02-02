import React, { useEffect, useState } from "react";
import api from "../services/api";
import CommentTree from "./CommentTree";

export default function Post({ post, refresh }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [comment, setComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);

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

  return (
    <div className="group bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/50 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
          
          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 font-semibold text-base">
                @{post.author.username}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-xs text-slate-500">
                {new Date(post.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={like}
          disabled={isLiking}
          className={`group/like flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
            post.is_liked
              ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
              : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400'
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              post.is_liked ? 'fill-current scale-110' : 'group-hover/like:scale-110'
            }`}
            viewBox="0 0 24 24"
            fill={post.is_liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="font-semibold text-sm">{post.like_count}</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="mb-4">
        <p className="text-slate-200 leading-relaxed text-base whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-800/50">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 transition-all duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-sm font-medium">
            {open ? "Hide Discussion" : `${detail?.comments?.length || post.comment_count || 0} Comments`}
          </span>
        </button>
      </div>

      {/* Expanded Discussion Section */}
      {open && detail && (
        <div className="mt-6 pt-6 border-t border-slate-800/50 space-y-4">
          {/* Add Comment Section */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Add Your Comment
            </h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows="3"
              className="w-full bg-slate-950 border border-slate-700/50 focus:border-indigo-500/50 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={addComment}
                disabled={!comment.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-indigo-500/25"
              >
                Post Comment
              </button>
            </div>
          </div>

          {/* Comments Tree */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Discussion ({detail.comments?.length || 0})
            </h4>
            {detail.comments?.length > 0 ? (
              <CommentTree
                comments={detail.comments}
                postId={post.id}
                refresh={load}
              />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}