import React, { useEffect, useState } from "react";
import Feed from "./components/Feed";
import Leaderboard from "./components/Leaderboard";
import { api, setAuthToken } from "./services/api";

export default function App() {
  const [user, setUser] = useState(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  const auth = async (type, e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = { username: f.get("username"), password: f.get("password") };

    const res = await api.post(`auth/${type}/`, data);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <h1 className="text-xl font-semibold text-indigo-400">
            Community Feed
          </h1>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                @{user.username}
              </span>
              <button
                onClick={logout}
                className="text-sm bg-red-500/20 border border-red-500/40 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <form onSubmit={(e) => auth("login", e)} className="flex gap-2">
                <input name="username" placeholder="user" className="input" />
                <input name="password" type="password" placeholder="pass" className="input" />
                <button className="btn">Login</button>
              </form>
              <form onSubmit={(e) => auth("register", e)} className="flex gap-2">
                <input name="username" placeholder="new user" className="input" />
                <input name="password" type="password" placeholder="pass" className="input" />
                <button className="btn">Register</button>
              </form>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <section className="md:col-span-3">
          <Feed />
        </section>
        <aside>
          <Leaderboard />
        </aside>
      </main>
    </div>
  );
}
