import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Leaderboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("leaderboard/").then((r) => setData(r.data));
  }, []);

  return (
    <div className="sticky top-24 bg-slate-950 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">
        Top Contributors (24h)
      </h3>

      <ol className="space-y-2">
        {data.map((u, i) => (
          <li key={i} className="flex justify-between text-sm">
            <span>{i + 1}. @{u.user.username}</span>
            <span className="text-green-400 font-medium">
              {u.karma}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
