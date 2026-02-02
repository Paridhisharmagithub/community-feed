import React, { useState } from "react";
import { api } from "../services/api";

function CommentNode({ node, postId, refresh }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const reply = async () => {
    await api.post(`posts/${postId}/comments/`, {
      parent_id: node.id,
      content: text,
    });
    setText("");
    setOpen(false);
    refresh();
  };

  return (
    <div className="ml-4 mt-3 border-l border-slate-700 pl-4">
      <div className="flex justify-between">
        <span className="text-sm text-indigo-400">
          @{node.author.username}
        </span>
        <button
          onClick={() => api.post(`comments/${node.id}/like/`).then(refresh)}
          className="text-xs text-gray-400 hover:text-red-400"
        >
          ❤️ {node.like_count}
        </button>
      </div>

      <p className="text-sm text-gray-200 mt-1">{node.content}</p>

      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-indigo-400 mt-1"
      >
        Reply
      </button>

      {open && (
        <div className="mt-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded p-2"
          />
          <div className="text-right mt-1">
            <button onClick={reply} className="btn-primary text-xs">
              Reply
            </button>
          </div>
        </div>
      )}

      {node.children &&
        node.children.map((c) => (
          <CommentNode
            key={c.id}
            node={c}
            postId={postId}
            refresh={refresh}
          />
        ))}
    </div>
  );
}

export default function CommentTree({ comments, postId, refresh }) {
  return (
    <div className="mt-4">
      {comments.map((c) => (
        <CommentNode
          key={c.id}
          node={c}
          postId={postId}
          refresh={refresh}
        />
      ))}
    </div>
  );
}
