import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import Post from "./Post";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");

  const load = async () => {
    const res = await api.get("posts/");
    setPosts(res.data);
  };

  useEffect(() => { load(); }, []);

  const createPost = async () => {
    if (!text.trim()) return;
    try {
      await api.post("posts/create/", { content: text });
      setText("");
      load();
    } catch (e) {
      alert("Create post failed: login?");
    }
  };

  return (
    <div>
      <div className="mb-4 p-4 border bg-white rounded">
        <textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full p-2 border rounded" placeholder="Write something..." />
        <div className="text-right mt-2">
          <button onClick={createPost} className="bg-indigo-600 text-white px-4 py-1 rounded">Post</button>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map(p => <Post key={p.id} post={p} onRefresh={load} />)}
      </div>
    </div>
  );
}
