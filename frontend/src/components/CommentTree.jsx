import React, { useState } from "react";
import api from "../services/api";

function CommentNode({ node, postId, refresh, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const karmaEarned = node.like_count * 1; // 1 karma per comment like

  return (
    <div
      className={`${
        depth > 0 ? 'ml-6 mt-3' : 'mt-4'
      } border-l-2 ${collapsed ? 'border-slate-700/30' : 'border-slate-800/50'} pl-4 transition-all duration-200 hover:border-indigo-500/30`}
    >
      {!collapsed ? (
        <>
          {/* Comment Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              {/* Mini Avatar with Level */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 flex items-center justify-center text-white font-semibold text-xs">
                  {node.author.username.charAt(0).toUpperCase()}
                </div>
                {/* Tiny level badge */}
                {karmaEarned > 5 && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                    {Math.floor(karmaEarned / 5)}
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-indigo-400 hover:underline cursor-pointer">
                    {node.author.username}
                  </span>
                  
                  {/* OP Badge */}
                  {node.is_op && (
                    <span className="px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] font-bold rounded uppercase">
                      OP
                    </span>
                  )}
                  
                  {/* Karma indicator */}
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    {node.like_count} points
                  </span>
                  
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-xs text-slate-600 hover:text-slate-400 cursor-pointer" title={new Date(node.created_at).toLocaleString()}>
                    {getTimeAgo(node.created_at)}
                  </span>
                  
                  {node.is_edited && (
                    <span className="text-xs text-slate-600 italic">
                      (edited)
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words mb-2">
                  {node.content}
                </p>

                {/* Comment Actions */}
                <div className="flex items-center gap-3">
                  {/* Vote buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={likeComment}
                      disabled={isLiking}
                      className={`p-1 rounded transition-all duration-200 ${
                        node.is_liked
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={node.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                      </svg>
                    </button>
                    
                    <span className={`text-xs font-bold ${node.is_liked ? 'text-rose-400' : 'text-slate-400'}`}>
                      {node.like_count}
                    </span>
                    
                    <button className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7 7 7-7"/>
                      </svg>
                    </button>
                  </div>

                  {!isMaxDepth && (
                    <button
                      onClick={() => setOpen(!open)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all duration-200"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Reply
                    </button>
                  )}

                  

                  {/* Collapse thread button */}
                  {node.children && node.children.length > 0 && (
                    <button
                      onClick={() => setCollapsed(true)}
                      className="ml-auto text-xs text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      [−] Collapse ({node.children.length})
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
                placeholder="What are your thoughts?"
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
            <div className="mt-2">
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
        </>
      ) : (
        // Collapsed view
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 py-1"
        >
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 flex items-center justify-center text-white font-semibold text-[10px]">
            {node.author.username.charAt(0).toUpperCase()}
          </span>
          <span className="font-medium">{node.author.username}</span>
          <span className="text-slate-600">{node.like_count} points</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-600">{getTimeAgo(node.created_at)}</span>
          <span className="text-slate-600">[+] Expand</span>
          {node.children && node.children.length > 0 && (
            <span className="text-slate-600">({node.children.length} replies)</span>
          )}
        </button>
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