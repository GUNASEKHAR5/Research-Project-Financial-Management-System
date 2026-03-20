import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login }              = useAuth();
  const navigate               = useNavigate();
  const [email,    setEmail]   = useState("");
  const [password, setPassword]= useState("");
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 60% 30%, #1e1b4b 0%, #09090b 60%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div className="w-full max-w-md px-8 py-10 bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ResearchFinance</h1>
          <p className="text-zinc-400 text-sm mt-1">University Research Management Portal</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-rose-900/40 border border-rose-700 text-rose-300 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 text-center mb-2">Seed credentials</p>
          <div className="space-y-1 text-xs text-zinc-500">
            {[
              { email: "arjun@university.edu",  role: "Admin" },
              { email: "priya@university.edu",  role: "Faculty" },
              { email: "ravi@university.edu",   role: "Finance" },
              { email: "sneha@university.edu",  role: "Faculty" },
            ].map((u) => (
              <div key={u.email}
                className="flex justify-between px-3 py-1.5 bg-zinc-900 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => { setEmail(u.email); setPassword("Test@1234"); }}
              >
                <span className="text-zinc-400">{u.email}</span>
                <span className="text-zinc-600">{u.role}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;