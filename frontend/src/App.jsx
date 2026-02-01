import React, { useState } from "react";
import Feed from "./components/Feed";
import Leaderboard from "./components/Leaderboard";
import { api, setAuthToken } from "./services/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = { username: form.get("username"), password: form.get("password") };
    try {
      const res = await api.post("auth/login/", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);
      setToken(res.data.token);
      setUsername(res.data.user.username);
      setAuthToken(res.data.token);
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = { username: form.get("username"), password: form.get("password") };
    try {
      const res = await api.post("auth/register/", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);
      setToken(res.data.token);
      setUsername(res.data.user.username);
      setAuthToken(res.data.token);
    } catch (err) {
      alert("Register failed");
    }
  };

  React.useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Community Feed</h1>
        <div>
          {username ? (
            <div className="text-right">
              <div className="mb-1">Signed in as <b>{username}</b> ✅</div>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
            </div>
          ) : (
            <div className="flex gap-4">
              <form onSubmit={handleLogin} className="flex gap-2">
                <input name="username" placeholder="username" className="border p-1 rounded" />
                <input name="password" type="password" placeholder="password" className="border p-1 rounded" />
                <button type="submit" className="bg-blue-600 text-white px-3 rounded">Login</button>
              </form>
              <form onSubmit={handleRegister} className="flex gap-2">
                <input name="username" placeholder="new user" className="border p-1 rounded" />
                <input name="password" type="password" placeholder="password" className="border p-1 rounded" />
                <button type="submit" className="bg-green-600 text-white px-3 rounded">Register</button>
              </form>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
        <section className="col-span-2">
          <Feed />
        </section>
        <aside className="col-span-1">
          <Leaderboard />
        </aside>
      </main>
    </div>
  );
}

export default App;
