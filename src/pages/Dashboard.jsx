import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/Spinner";

/* ── Stat Card ─────────────────────────────────────── */
function StatCard({ label, value, icon, gradient, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 ${gradient} ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform shadow-lg hover:shadow-xl' : ''}`}
    >
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
      <div className="relative">
        <span className="text-3xl mb-2 block">{icon}</span>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-white/70 mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ── Dashboard Page ────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ events: 0, tasks: 0, applications: 0, accepted: 0 });
  const [recentEvents, setRecentEvents] = useState([]);

  // Data stores for modals
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [providerApps, setProviderApps] = useState([]);
  const [userTasks, setUserTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  // Review states
  const [reviewModal, setReviewModal] = useState(null); // { eventId, revieweeId, revieweeName }
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  const [manageEvent, setManageEvent] = useState(null);
  const [eventApps, setEventApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Controls which stat list modal is open ('events', 'tasks', 'accepted', 'applications')
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === "Organizer") {
          const [evRes, taskRes] = await Promise.all([
            api.get("/events/my"),
            api.get("/tasks/my"),
          ]);
          const events = evRes.data.data;
          setRecentEvents(events.slice(0, 5));
          setOrganizerEvents(events);
          setUserTasks(taskRes.data.data || []);

          setStats({
            events: events.length,
            tasks: taskRes.data.count || 0,
            applications: 0,
            accepted: events.reduce((a, e) => a + (e.providers?.length || 0), 0),
          });
        } else {
          const [appRes, taskRes] = await Promise.all([
            api.get("/applications/my"),
            api.get("/tasks/my"),
          ]);
          const apps = appRes.data.data;
          setProviderApps(apps);
          setUserTasks(taskRes.data.data || []);

          setStats({
            events: apps.length,
            tasks: taskRes.data.count || 0,
            applications: apps.length,
            accepted: apps.filter((a) => a.status === "Accepted").length,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleManageEvent = async (ev) => {
    setManageEvent(ev);
    setAppsLoading(true);
    try {
      const res = await api.get(`/applications/event/${ev._id}`);
      setEventApps(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleAppStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}`, { status });
      setEventApps((prev) => prev.map((a) => (a._id === appId ? { ...a, status } : a)));

      // Update acceptance stats locally
      if (status === "Accepted") {
        setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
      } else if (status === "Rejected") {
        // Technically reduces accepted count if it was accepted before, but simplified for MVP
      }
    } catch (err) {
      alert("Error updating application");
    }
  };

  const handleCompleteEvent = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/complete`);
      setOrganizerEvents(prev => prev.map(e => e._id === eventId ? { ...e, status: "Completed" } : e));
      setRecentEvents(prev => prev.map(e => e._id === eventId ? { ...e, status: "Completed" } : e));
      alert("Event officially marked as Completed!");
    } catch (err) {
      alert("Failed to complete event");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await api.post("/reviews", {
        eventId: reviewModal.eventId,
        revieweeId: reviewModal.revieweeId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      alert(`Review for ${reviewModal.revieweeName} submitted successfully!`);
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  const isOrganizer = user.role === "Organizer";
  const gradients = [
    "bg-gradient-to-br from-gold-600 to-gold",
    "bg-gradient-to-br from-blue-600 to-blue-400",
    "bg-gradient-to-br from-purple-600 to-purple-400",
    "bg-gradient-to-br from-emerald-600 to-emerald-400",
  ];

  /* Helpers for Modal Rendering */
  const renderEventList = (title, list) => (
    <div className="space-y-3">
      {list.length === 0 ? <p className="text-brand-300 text-sm p-4 text-center">No events found.</p> : list.map(ev => (
        <div key={ev._id} className="p-4 bg-brand-700/40 rounded-xl border border-brand-500/20 hover:bg-brand-700/60 transition">
          <p className="text-brand-50 font-medium">{ev.title}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-brand-300">{new Date(ev.date).toLocaleDateString()} · {ev.location || "No location"}</p>
            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${ev.status === "Published" ? 'bg-emerald-500/20 text-emerald-400' : ev.status === "Completed" ? 'bg-blue-500/20 text-blue-400' : 'bg-gold/20 text-gold'}`}>{ev.status}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAppList = (title, list) => (
    <div className="space-y-3">
      {list.length === 0 ? <p className="text-brand-300 text-sm p-4 text-center">No applications found.</p> : list.map(app => (
        <div key={app._id} className="p-4 bg-brand-700/40 rounded-xl border border-brand-500/20 flex flex-col hover:bg-brand-700/60 transition">
          <div className="flex justify-between items-start mb-2">
            <p className="text-brand-50 font-medium">{app.event?.title || "Unknown Event"}</p>
            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${app.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                app.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-gold/20 text-gold'
              }`}>
              {app.status}
            </span>
          </div>
          <p className="text-xs text-brand-300 line-clamp-2 mb-2">{app.message || "No cover message provided."}</p>
          <div className="flex justify-between items-center">
            <div className="text-xs font-semibold text-brand-400">Budget: ${app.proposedBudget || "0"}</div>
            {app.status === 'Accepted' && app.event?.status === 'Completed' && !isOrganizer && (
              <button onClick={() => setReviewModal({ eventId: app.event._id, revieweeId: app.event.organizer || "organizer", revieweeName: "Event Organizer" })} className="text-[10px] bg-gold/20 text-gold px-2 py-1 rounded hover:bg-gold/30 transition uppercase font-bold">
                Rate Organizer
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-50">
          Welcome back, <span className="text-gold">{user.name}</span>
        </h1>
        <p className="text-brand-300 mt-1">
          {isOrganizer ? "Here's an overview of your events" : "Here's your activity summary locally tracked"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={isOrganizer ? "Total Events" : "Applications"}
          value={stats.events}
          icon="📅"
          gradient={gradients[0]}
          onClick={() => setActiveModal(isOrganizer ? 'events' : 'applications')}
        />
        <StatCard
          label="Active Tasks"
          value={stats.tasks}
          icon="✅"
          gradient={gradients[1]}
          onClick={() => setActiveModal('tasks')}
        />
        <StatCard
          label={isOrganizer ? "Collaborators" : "Accepted Apps"}
          value={stats.accepted}
          icon="🤝"
          gradient={gradients[2]}
          onClick={() => setActiveModal('accepted')}
        />
        <StatCard
          label="Completion"
          value={stats.tasks > 0 ? Math.round((stats.accepted / Math.max(stats.events, 1)) * 100) + "%" : "—"}
          icon="📊"
          gradient={gradients[3]}
        />
      </div>

      {/* Progress Section */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-brand-50 mb-4">Activity Progress</h2>
        <div className="space-y-4">
          {[
            { label: "Events", value: stats.events, max: Math.max(stats.events, 10), color: "bg-gold" },
            { label: "Tasks", value: stats.tasks, max: Math.max(stats.tasks, 10), color: "bg-blue-500" },
            { label: "Collaborations", value: stats.accepted, max: Math.max(stats.accepted, 5), color: "bg-emerald-500" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-brand-200">{bar.label}</span>
                <span className="text-brand-100 font-medium">{bar.value}</span>
              </div>
              <div className="h-2 bg-brand-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${bar.color} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events (Organizer) */}
      {isOrganizer && recentEvents.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-brand-50 mb-4">Recent Events</h2>
          <div className="space-y-3">
            {recentEvents.map((ev) => (
              <div key={ev._id} className="flex items-center justify-between p-3 bg-brand-700/40 rounded-xl hover:bg-brand-700/60 transition cursor-default">
                <div>
                  <p className="text-sm font-medium text-brand-50">{ev.title}</p>
                  <p className="text-xs text-brand-300">{new Date(ev.date).toLocaleDateString()} · {ev.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${ev.status === "Published" ? "bg-emerald-500/15 text-emerald-400" :
                      ev.status === "Draft" ? "bg-brand-400/15 text-brand-200" :
                        ev.status === "Completed" ? "bg-blue-500/15 text-blue-400" :
                          "bg-gold/15 text-gold"
                    }`}>
                    {ev.status}
                  </span>
                  {ev.status !== "Completed" && ev.status !== "Draft" && (
                    <button onClick={() => handleCompleteEvent(ev._id)} className="text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition">
                      Mark Complete
                    </button>
                  )}
                  <button onClick={() => handleManageEvent(ev)} className="text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition">
                    View Applicants
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List Modal for Stat Cards */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setActiveModal(null)}>
          <div className="glass-card w-full max-w-lg p-6 space-y-4 animate-slide-up max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-brand-50 capitalize">
                {activeModal === 'events' ? 'Your Events' :
                  activeModal === 'applications' ? 'Your Applications' :
                    activeModal === 'accepted' ? (isOrganizer ? 'Accepted Providers' : 'Accepted Applications') :
                      'Assigned Tasks'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-brand-300 hover:text-white transition cursor-pointer text-xl">&times;</button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2">
              {activeModal === 'events' && renderEventList("Events", organizerEvents)}

              {activeModal === 'applications' && renderAppList("Applications", providerApps)}

              {activeModal === 'accepted' && !isOrganizer && renderAppList("Accepted Applications", providerApps.filter(a => a.status === 'Accepted'))}

              {activeModal === 'accepted' && isOrganizer && (
                <p className="text-sm text-brand-300 text-center py-4">Total headcount of accepted providers across your events. Click on "View Applicants" on your specific event card below to manage them.</p>
              )}

              {activeModal === 'tasks' && (
                <div className="space-y-3">
                  {userTasks.length === 0 ? <p className="text-brand-300 text-sm text-center">No tasks assigned to you right now.</p> : userTasks.map(task => (
                    <div key={task._id} className="p-4 bg-brand-700/40 rounded-xl border border-brand-500/20">
                      <div className="flex justify-between items-start">
                        <p className="text-brand-50 font-medium">{task.title}</p>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${task.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-gold/20 text-gold'}`}>{task.priority} Priority</span>
                      </div>
                      <p className="text-xs text-brand-300 mt-2">Status: {task.status}</p>
                      {task.event && <p className="text-xs font-semibold text-brand-400 mt-1 flex gap-1 items-center"><span>🔗</span> {task.event.title}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manage Applicants Modal */}
      {manageEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setManageEvent(null)}>
          <div className="glass-card w-full max-w-2xl p-6 space-y-4 animate-slide-up max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-50">Applicants for "{manageEvent.title}"</h3>
              <button onClick={() => setManageEvent(null)} className="text-brand-300 hover:text-white transition cursor-pointer text-xl">&times;</button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
              {appsLoading ? (
                <div className="flex justify-center p-8"><Spinner size="md" /></div>
              ) : eventApps.length === 0 ? (
                <p className="text-brand-300 text-sm text-center p-8">No applicants yet for this event.</p>
              ) : (
                eventApps.map((app) => (
                  <div key={app._id} className="p-4 bg-brand-700/40 rounded-xl border border-brand-500/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-brand-50 font-medium">{app.provider.name}</p>
                        <p className="text-xs text-brand-300 mt-0.5">{app.provider.email} • {app.provider.phone || "No phone"}</p>
                        {app.provider.skills && app.provider.skills.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {app.provider.skills.map(s => <span key={s} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{s}</span>)}
                          </div>
                        )}
                        <div className="mt-3 text-sm text-brand-200">
                          <span className="font-semibold text-brand-100">Message:</span> {app.message || "No message provided."}
                        </div>
                        {app.proposedBudget && (
                          <div className="mt-1 text-sm text-brand-200">
                            <span className="font-semibold text-brand-100">Proposed Budget:</span> ${app.proposedBudget}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${app.status === "Accepted" ? "bg-emerald-500/15 text-emerald-400" :
                            app.status === "Rejected" ? "bg-red-500/15 text-red-400" :
                              "bg-gold/15 text-gold"
                          }`}>
                          {app.status}
                        </span>

                        {app.status === "Pending" && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleAppStatus(app._id, "Accepted")} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition">Accept</button>
                            <button onClick={() => handleAppStatus(app._id, "Rejected")} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition">Reject</button>
                          </div>
                        )}
                        {app.status === "Accepted" && manageEvent?.status !== "Completed" && (
                          <button onClick={() => handleAppStatus(app._id, "Rejected")} className="text-[10px] mt-1 text-brand-400 hover:text-red-400 transition underline">Revoke</button>
                        )}
                        {app.status === "Accepted" && manageEvent?.status === "Completed" && (
                          <button onClick={() => setReviewModal({ eventId: manageEvent._id, revieweeId: app.provider._id, revieweeName: app.provider.name })} className="text-[10px] mt-2 font-semibold px-3 py-1.5 rounded-lg bg-gold/20 text-gold hover:bg-gold/30 transition uppercase">Rate Provider</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setReviewModal(null)}>
          <form className="glass-card w-full max-w-sm p-6 space-y-4 animate-slide-up" onClick={e => e.stopPropagation()} onSubmit={submitReview}>
            <h3 className="text-lg font-bold text-brand-50">Rate {reviewModal.revieweeName}</h3>
            <div>
              <label className="input-label">Rating (1-5)</label>
              <input type="number" min="1" max="5" required value={reviewForm.rating} onChange={e => setReviewForm(prev => ({ ...prev, rating: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="input-label">Review Comment</label>
              <textarea rows={3} placeholder="How was working with them?" required value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} className="input-field resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={reviewLoading} className="gold-btn flex-1 text-sm">{reviewLoading ? "Submitting..." : "Submit Review"}</button>
              <button type="button" onClick={() => setReviewModal(null)} className="px-4 py-2 rounded-xl border border-brand-500/40 text-brand-200 hover:bg-brand-700 transition">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
