import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Organizer",
    phone: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) return setError("Name, email and password are required");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await signup(payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950 px-4 py-12">
      <div className="absolute top-20 right-20 w-72 h-72 bg-gold/5 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center text-brand-950 font-extrabold text-xl">
              E
            </div>
            <span className="text-2xl font-bold text-brand-50">
              Event<span className="text-gold">Collab</span>
            </span>
          </div>
          <p className="text-brand-300 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Role toggle */}
          <div>
            <label className="input-label">I am a</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-brand-700 rounded-xl">
              {["Organizer", "Provider"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    form.role === r
                      ? "bg-gold text-brand-950 shadow-lg shadow-gold/20"
                      : "text-brand-200 hover:text-brand-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Full Name</label>
            <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="input-label">Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Password</label>
              <input name="password" type="password" placeholder="••••••" value={form.password} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="input-label">Confirm</label>
              <input name="confirmPassword" type="password" placeholder="••••••" value={form.confirmPassword} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label className="input-label">Phone <span className="text-brand-400">(optional)</span></label>
            <input name="phone" placeholder="+1 234 567 890" value={form.phone} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="input-label">Bio <span className="text-brand-400">(optional)</span></label>
            <textarea name="bio" rows={2} placeholder="Tell us about yourself..." value={form.bio} onChange={handleChange} className="input-field resize-none" />
          </div>

          <button type="submit" disabled={loading} className="gold-btn w-full flex items-center justify-center gap-2 py-3">
            {loading ? <Spinner size="sm" /> : "Create Account"}
          </button>

          <p className="text-center text-sm text-brand-300">
            Already have an account?{" "}
            <Link to="/login" className="text-gold hover:text-gold-300 font-medium">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
