import React, { useState } from "react";
import api from "../services/api";

function CommentNode({ node, postId, refresh, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const maxDepth = 5;
  const isMaxDepth = depth >= maxDepth;

  const reply = async () => {
    if (!text.trim() || isReplying) return;
    setIsReplying(true);
    try {
      await api.post(`posts/${postId}/comments/`, {
        parent_id: node.id,
        content: text,
      });
      setText("");
      setOpen(false);
      refresh();
    } finally {
      setIsReplying(false);
    }
  };

  const likeComment = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await api.post(`comments/${node.id}/like/`);
      refresh();
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className={`${
        depth > 0 ? 'ml-6 mt-4' : 'mt-4'
      } border-l-2 border-slate-800/50 pl-4 transition-all duration-200 hover:border-indigo-500/30`}
    >
      {/* Comment Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Mini Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {node.author.username.charAt(0).toUpperCase()}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-indigo-400">
                @{node.author.username}
              </span>
              <span className="text-xs text-slate-600">
                {new Date(node.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {depth > 0 && (
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 17l-5-5 5-5M20 12H4" />
                  </svg>
                  Reply
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
              {node.content}
            </p>

            {/* Comment Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={likeComment}
                disabled={isLiking}
                className={`group/like flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  node.is_liked
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-400'
                }`}
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${
                    node.is_liked ? 'fill-current scale-110' : 'group-hover/like:scale-110'
                  }`}
                  viewBox="0 0 24 24"
                  fill={node.is_liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {node.like_count > 0 && <span>{node.like_count}</span>}
              </button>

              {!isMaxDepth && (
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Reply
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {open && (
        <div className="mt-3 ml-11 bg-slate-900/30 rounded-lg p-3 border border-slate-800/50">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a reply..."
            rows="2"
            className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-indigo-500/50 rounded-lg p-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setOpen(false);
                setText("");
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={reply}
              disabled={!text.trim() || isReplying}
              className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReplying ? "Posting..." : "Reply"}
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {node.children && node.children.length > 0 && (
        <div className={isMaxDepth ? "mt-2" : ""}>
          {node.children.map((c) => (
            <CommentNode
              key={c.id}
              node={c}
              postId={postId}
              refresh={refresh}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentTree({ comments, postId, refresh }) {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {comments.map((c) => (
        <CommentNode
          key={c.id}
          node={c}
          postId={postId}
          refresh={refresh}
          depth={0}
        />
      ))}
    </div>
  );
}