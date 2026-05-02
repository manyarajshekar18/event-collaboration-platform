import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/Spinner";

export default function Chat() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  /* Fetch events the user participates in */
  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === "Organizer") {
          const { data } = await api.get("/events/my");
          setEvents(data.data);
        } else {
          const { data } = await api.get("/events");
          // Filter to events where user might be a provider (published events they can message)
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

  /* Fetch messages for selected event */
  const fetchMessages = async () => {
    if (!selectedEvent) return;
    try {
      const { data } = await api.get(`/messages/event/${selectedEvent}`);
      setMessages(data.data);
    } catch (err) {
      // user may not be a participant — silently fail
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!selectedEvent) { setMessages([]); return; }
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    /* Poll every 5 seconds */
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Send message */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedEvent) return;
    setSending(true);
    try {
      await api.post("/messages", { eventId: selectedEvent, content: content.trim() });
      setContent("");
      await fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-50">Chat</h1>
          <p className="text-brand-300 text-sm mt-1">Communicate with your team</p>
        </div>
        {eventsLoading ? (
          <Spinner size="sm" />
        ) : (
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="input-field sm:w-64"
          >
            <option value="">Select an event</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>{ev.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Chat area */}
      <div className="glass-card flex flex-col flex-1 min-h-0 overflow-hidden">
        {!selectedEvent ? (
          <div className="flex-1 flex items-center justify-center text-brand-300">
            <div className="text-center">
              <span className="text-4xl block mb-3">💬</span>
              <p>Select an event to start chatting</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-brand-300 py-8">No messages yet — start the conversation!</div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender?._id === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] ${isMe ? "order-2" : ""}`}>
                      {!isMe && (
                        <p className="text-xs font-medium text-gold mb-1 px-1">
                          {msg.sender?.name} <span className="text-brand-400">· {msg.sender?.role}</span>
                        </p>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-gold text-brand-950 rounded-br-md"
                            : "bg-brand-700 text-brand-50 rounded-bl-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-[10px] text-brand-400 mt-1 px-1 ${isMe ? "text-right" : ""}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-brand-500/20 flex gap-3">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <button type="submit" disabled={sending || !content.trim()} className="gold-btn px-5 flex items-center gap-2">
                {sending ? (
                  <Spinner size="sm" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
