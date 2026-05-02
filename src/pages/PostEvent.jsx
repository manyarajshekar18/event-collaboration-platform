import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Spinner from "../components/Spinner";

const CATEGORIES = ["Conference", "Wedding", "Concert", "Workshop", "Corporate", "Festival", "Other"];

export default function PostEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    budget: "",
    category: "Other",
    status: "Draft",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description || !form.date || !form.location) {
      return setError("Title, description, date, and location are required");
    }
    setLoading(true);
    try {
      const payload = { ...form, budget: form.budget ? Number(form.budget) : undefined };
      await api.post("/events", payload);
      navigate("/events");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-50">Create Event</h1>
        <p className="text-brand-300 text-sm mt-1">Fill in the details to publish a new event</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 lg:p-8 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="input-label">Event Title</label>
          <input name="title" placeholder="Annual Tech Conference" value={form.title} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="input-label">Description</label>
          <textarea name="description" rows={4} placeholder="Describe your event in detail..." value={form.description} onChange={handleChange} className="input-field resize-none" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="input-label">Location</label>
            <input name="location" placeholder="New York, NY" value={form.location} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Budget ($)</label>
            <input name="budget" type="number" placeholder="5000" value={form.budget} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="input-label">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="input-label">Status</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-brand-700 rounded-xl">
            {["Draft", "Published"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, status: s })}
                className={`py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  form.status === s
                    ? "bg-gold text-brand-950 shadow-lg shadow-gold/20"
                    : "text-brand-200 hover:text-brand-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="gold-btn w-full py-3 flex items-center justify-center gap-2">
          {loading ? <Spinner size="sm" /> : "Create Event"}
        </button>
      </form>
    </div>
  );
}
