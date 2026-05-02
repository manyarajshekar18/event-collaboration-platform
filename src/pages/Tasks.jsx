import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/Spinner";

const PRIORITY_COLORS = {
  High: "bg-red-500/15 text-red-400",
  Medium: "bg-gold/15 text-gold",
  Low: "bg-blue-500/15 text-blue-400",
};

const STATUS_COLORS = {
  Pending: "bg-brand-400/15 text-brand-200",
  "In Progress": "bg-gold/15 text-gold",
  Completed: "bg-emerald-500/15 text-emerald-400",
};

export default function Tasks() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventProviders, setEventProviders] = useState([]);

  /* Create task form (organizer only) */
  const [showForm, setShowForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", assignedTo: "", priority: "Medium", dueDate: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  /* Fetch user events */
  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === "Organizer") {
          const { data } = await api.get("/events/user/my");
          setEvents(data.data);
        } else {
          const { data } = await api.get("/events");
          setEvents(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setEventsLoading(false);
      }
    };
    load();
  }, [user]);

  /* Fetch tasks for selected event */
  useEffect(() => {
    if (!selectedEvent) { setTasks([]); return; }
    const load = async () => {
      setLoading(true);
      try {
        const [taskRes, evRes] = await Promise.all([
          api.get(`/tasks/event/${selectedEvent}`),
          api.get(`/events/${selectedEvent}`)
        ]);
        setTasks(taskRes.data.data);
        // Only set providers if user is Organizer (to populate Assignee dropdown)
        if (evRes.data.data?.providers) {
           // We reuse the 'events' state, or we can just stick it onto the component dynamically
           // Better yet, dynamically extracting accepted providers:
           setEventProviders(evRes.data.data.providers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedEvent]);

  /* Toggle task status */
  const toggleStatus = async (task) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    try {
      await api.put(`/tasks/${task._id}`, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t)));
    } catch (err) {
      console.error(err);
    }
  };

  /* Create new task */
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!taskForm.title) return setFormError("Title is required");
    setFormLoading(true);
    try {
      const payload = {
        eventId: selectedEvent,
        title: taskForm.title,
        description: taskForm.description,
        assignedTo: taskForm.assignedTo || undefined,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
      };
      const { data } = await api.post("/tasks", payload);
      setTasks((prev) => [...prev, data.data]);
      setTaskForm({ title: "", description: "", assignedTo: "", priority: "Medium", dueDate: "" });
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create task");
    } finally {
      setFormLoading(false);
    }
  };

  /* Delete task */
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-50">Tasks</h1>
          <p className="text-brand-300 text-sm mt-1">Manage tasks for your events</p>
        </div>
        {user.role === "Organizer" && selectedEvent && (
          <button onClick={() => setShowForm(!showForm)} className="gold-btn text-sm self-start inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Task
          </button>
        )}
      </div>

      {/* Event selector */}
      {eventsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="input-field max-w-md"
        >
          <option value="">Select an event</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>{ev.title}</option>
          ))}
        </select>
      )}

      {/* Create Task Form */}
      {showForm && (
        <form onSubmit={handleCreateTask} className="glass-card p-5 space-y-4 animate-slide-up">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{formError}</div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Title</label>
              <input placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="input-label">Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="input-field">
                {["Low", "Medium", "High"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea rows={2} placeholder="Optional description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="input-field resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Assign To</label>
              <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className="input-field">
                 <option value="">Unassigned</option>
                 {eventProviders?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={formLoading} className="gold-btn text-sm">{formLoading ? <Spinner size="sm" /> : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-brand-500/40 text-brand-200 text-sm hover:bg-brand-700 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Task List */}
      {!selectedEvent ? (
        <div className="text-center py-16 text-brand-300">Select an event to view tasks</div>
      ) : loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-brand-300">No tasks for this event yet</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task._id} className="glass-card p-4 flex items-start gap-4 hover:border-gold/20 transition-colors">
              {/* Toggle checkbox */}
              <button
                onClick={() => toggleStatus(task)}
                className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  task.status === "Completed"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-brand-400 hover:border-gold"
                }`}
              >
                {task.status === "Completed" && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-medium ${task.status === "Completed" ? "line-through text-brand-300" : "text-brand-50"}`}>
                  {task.title}
                </p>
                {task.description && <p className="text-sm text-brand-300 mt-0.5">{task.description}</p>}

                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                  {task.dueDate && (
                    <span className="text-xs text-brand-300">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                  {task.assignedTo && (
                    <span className="text-xs text-brand-300">→ {task.assignedTo.name || task.assignedTo}</span>
                  )}
                </div>
              </div>

              {user.role === "Organizer" && (
                <button
                  onClick={() => deleteTask(task._id)}
                  className="shrink-0 p-1.5 rounded-lg text-brand-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
