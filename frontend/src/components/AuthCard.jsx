import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCard() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        mode === "login" ? "auth/login/" : "auth/register/",
        { username, password }
      );

      const { user, token } = res.data;
      if (!user || !token) throw new Error("Invalid response");

      login(user, token);
    } catch (e) {
      setError(e.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white text-center">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        <input
          className="w-full mt-6 p-3 bg-slate-950 border border-slate-700 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full mt-4 p-3 bg-slate-950 border border-slate-700 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-6 py-3 bg-indigo-600 rounded text-white font-semibold"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
        </button>

        <p className="text-sm text-center text-slate-400 mt-4">
          {mode === "login" ? "No account?" : "Already have one?"}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="ml-2 text-indigo-400"
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
