import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const load = async () => {
    try {
      const res = await api.get("leaderboard/");
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(()=>{ load(); }, []);
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-3">Top 5 (last 24h)</h3>
      {data.length === 0 && <div className="text-gray-500">No activity yet</div>}
      <ol className="space-y-2">
        {data.map((u, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{idx+1}. {u.user.username}</span>
            <span className="font-bold">{u.karma}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
