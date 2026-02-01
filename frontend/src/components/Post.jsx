import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import CommentTree from "./CommentTree";

export default function Post({ post, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [commentText, setCommentText] = useState("");

  const loadDetail = async () => {
    const res = await api.get(`posts/${post.id}/`);
    setDetail(res.data);
  };

  useEffect(() => { if (expanded) loadDetail(); }, [expanded]);

  const like = async () => {
    try {
      await api.post(`posts/${post.id}/like/`);
      onRefresh();
      if (expanded) loadDetail();
    } catch (e) {
      alert("Already liked or login required");
    }
  };

  const addComment = async () => {
    if(!commentText.trim()) return;
    try {
      await api.post(`posts/${post.id}/comments/`, { content: commentText });
      setCommentText("");
      loadDetail();
      onRefresh();
    } catch (e) {
      alert("comment failed");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between">
        <div>
          <div className="font-semibold">{post.author.username}</div>
          <div className="text-sm text-gray-600">{new Date(post.created_at).toLocaleString()}</div>
        </div>
        <div>
          <button onClick={like} className="bg-red-500 text-white px-3 py-1 rounded">Like ({post.like_count})</button>
        </div>
      </div>
      <div className="mt-3">{post.content}</div>

      <div className="mt-3">
        <button onClick={() => setExpanded(s=>!s)} className="text-blue-600 underline">
          {expanded ? "Hide comments" : "View comments"}
        </button>
      </div>

      {expanded && detail && (
        <div className="mt-4">
          <div className="mb-3">
            <textarea value={commentText} onChange={(e)=>setCommentText(e.target.value)} className="w-full p-2 border rounded" placeholder="Write a comment..." />
            <div className="text-right mt-2">
              <button onClick={addComment} className="bg-green-600 text-white px-3 py-1 rounded">Comment</button>
            </div>
          </div>

          <CommentTree
            comments={detail.comments}
            postId={post.id}
            refresh={loadDetail}
            />

        </div>
      )}
    </div>
  );
}
