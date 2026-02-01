import React, { useState } from "react";
import { api } from "../services/api";

/**
 * Recursive single comment node
 */
function CommentNode({ node, postId, refresh }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [text, setText] = useState("");

  const like = async () => {
    try {
      await api.post(`comments/${node.id}/like/`);
      refresh();
    } catch (e) {
      alert("Already liked or login required");
    }
  };

  const reply = async () => {
    if (!text.trim()) return;

    try {
      await api.post(`posts/${postId}/comments/`, {
        parent_id: node.id,
        content: text,
      });

      setText("");
      setReplyOpen(false);
      refresh();
    } catch (e) {
      alert("Reply failed (login required?)");
    }
  };

  return (
    <div className="ml-4 border-l pl-3 py-2">
      <div className="flex justify-between items-start">
        <div>
          <b>{node.author.username}</b>{" "}
          <span className="text-sm text-gray-500">
            · {new Date(node.created_at).toLocaleString()}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={like}
            className="text-sm bg-red-400 text-white px-2 rounded"
          >
            Like ({node.like_count})
          </button>
          <button
            onClick={() => setReplyOpen((s) => !s)}
            className="text-sm text-blue-600"
          >
            Reply
          </button>
        </div>
      </div>

      <div className="mt-1">{node.content}</div>

      {replyOpen && (
        <div className="mt-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Write a reply..."
          />
          <div className="text-right mt-1">
            <button
              onClick={reply}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Post Reply
            </button>
          </div>
        </div>
      )}

      {/* Recursive children */}
      {node.children &&
        node.children.map((child) => (
          <CommentNode
            key={child.id}
            node={child}
            postId={postId}
            refresh={refresh}
          />
        ))}
    </div>
  );
}

/**
 * Root comment tree
 */
export default function CommentTree({ comments, postId, refresh }) {
  if (!comments || comments.length === 0) {
    return <div className="text-gray-500">No comments yet</div>;
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentNode
          key={comment.id}
          node={comment}
          postId={postId}
          refresh={refresh}
        />
      ))}
    </div>
  );
}
