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

  const create = async () => {
    if (!text.trim()) return;
    await api.post("posts/create/", { content: text });
    setText("");
    load();
  };

  return (
    <div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share something with the community..."
          className="w-full bg-slate-900 border border-slate-800 rounded p-3"
        />
        <div className="text-right mt-2">
          <button onClick={create} className="btn-primary">
            Post
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((p) => (
          <Post key={p.id} post={p} refresh={load} />
        ))}
      </div>
    </div>
  );
}
