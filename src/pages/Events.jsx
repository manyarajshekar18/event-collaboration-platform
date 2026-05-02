import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/Spinner";

const CATEGORIES = ["All", "Conference", "Wedding", "Concert", "Workshop", "Corporate", "Festival", "Other"];

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [applyModal, setApplyModal] = useState(null);
  const [applyForm, setApplyForm] = useState({ message: "", proposedBudget: "" });
  const [applyLoading, setApplyLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== "All") params.category = category;

      const { data } = await api.get("/events", { params });
      setEvents(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setFeedback("");

    try {
      await api.post("/applications", {
        eventId: applyModal._id,
        message: applyForm.message,
        proposedBudget: Number(applyForm.proposedBudget) || undefined,
      });

      setFeedback("Application submitted successfully!");
      setTimeout(() => {
        setApplyModal(null);
        setFeedback("");
      }, 1500);
    } catch (err) {
      setFeedback(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-50">Events</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1"
          />
          <button className="gold-btn">Search</button>
        </form>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {events.map((ev) => (
            <div
              key={ev._id}
              onClick={() => navigate(`/events/${ev._id}`)}
              className="glass-card p-5 cursor-pointer hover:border-gold transition"
            >
              <span className="text-xs text-gold">{ev.category}</span>

              <h3 className="text-lg text-white">{ev.title}</h3>

              <p className="text-sm text-gray-400">{ev.description}</p>

              <div className="mt-2 text-sm">
                <div>📍 {ev.location}</div>
                <div>📅 {new Date(ev.date).toLocaleDateString()}</div>
              </div>

              {/* APPLY BUTTON FIX */}
              {user.role === "Provider" && ev.status === "Published" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 IMPORTANT FIX
                    setApplyModal(ev);
                    setApplyForm({ message: "", proposedBudget: "" });
                  }}
                  className="mt-3 text-gold"
                >
                  Apply →
                </button>
              )}
            </div>
          ))}

        </div>
      )}

      {/* APPLY MODAL */}
      {applyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <form onSubmit={handleApply} className="bg-gray-900 p-5 rounded space-y-3">

            <h3>Apply to {applyModal.title}</h3>

            <textarea
              placeholder="Why are you unique?"
              value={applyForm.message}
              onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })}
              className="input-field"
            />

            <input
              type="number"
              placeholder="Budget"
              value={applyForm.proposedBudget}
              onChange={(e) => setApplyForm({ ...applyForm, proposedBudget: e.target.value })}
              className="input-field"
            />

            <button className="gold-btn">
              {applyLoading ? "Submitting..." : "Submit"}
            </button>

            {feedback && <p>{feedback}</p>}

          </form>
        </div>
      )}

    </div>
  );
}