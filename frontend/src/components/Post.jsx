import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import CommentTree from "./CommentTree";

export default function Post({ post, refresh }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [comment, setComment] = useState("");

  const load = async () => {
    const res = await api.get(`posts/${post.id}/`);
    setDetail(res.data);
  };

  useEffect(() => { if (open) load(); }, [open]);

  const like = async () => {
    await api.post(`posts/${post.id}/like/`);
    refresh();
    if (open) load();
  };

  const addComment = async () => {
    await api.post(`posts/${post.id}/comments/`, { content: comment });
    setComment("");
    load();
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
      <div className="flex justify-between">
        <div>
          <div className="text-indigo-400 font-medium">
            @{post.author.username}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
        <button onClick={like} className="btn-like">
          ❤️ {post.like_count}
        </button>
      </div>

      <p className="mt-4 text-gray-100">{post.content}</p>

      <button
        onClick={() => setOpen(!open)}
        className="mt-4 text-sm text-indigo-400"
      >
        {open ? "Hide discussion" : "View discussion"}
      </button>

      {open && detail && (
        <div className="mt-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-slate-900 border border-slate-800 rounded p-2"
          />
          <div className="text-right mt-2">
            <button onClick={addComment} className="btn-primary">
              Comment
            </button>
          </div>

          <CommentTree
            comments={detail.comments}
            postId={post.id}
            refresh={load}
          />
        </div>
      )}
    </div>
  );
}
