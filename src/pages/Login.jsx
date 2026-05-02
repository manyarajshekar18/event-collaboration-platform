import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("All fields are required");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950 px-4">
      {/* Decorative blurs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold/3 rounded-full blur-[150px]" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center text-brand-950 font-extrabold text-xl">
              E
            </div>
            <span className="text-2xl font-bold text-brand-50">
              Event<span className="text-gold">Collab</span>
            </span>
          </div>
          <p className="text-brand-300 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={loading} className="gold-btn w-full flex items-center justify-center gap-2 py-3">
            {loading ? <Spinner size="sm" /> : "Sign In"}
          </button>

          <p className="text-center text-sm text-brand-300">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-gold hover:text-gold-300 font-medium">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
