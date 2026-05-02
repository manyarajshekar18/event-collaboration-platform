import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Spinner from "../components/Spinner";
import Chat from "./Chat";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return <div className="text-center text-brand-300">Event not found</div>;
  }

  return (
    <div className="space-y-6">

      {/* Event Info */}
      <div className="glass-card p-6">
        <h1 className="text-2xl font-bold text-brand-50">{event.title}</h1>
        <p className="text-brand-300 mt-2">{event.description}</p>

        <div className="mt-4 text-sm text-brand-200 space-y-2">
          <div>📍 {event.location}</div>
          <div>📅 {new Date(event.date).toLocaleDateString()}</div>
          {event.budget && <div>💰 ${event.budget}</div>}
        </div>
      </div>

      {/* Chat */}
      <div className="glass-card p-4">
        <Chat eventId={id} />
      </div>

    </div>
  );
}