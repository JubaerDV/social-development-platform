"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type EventItem = {
  _id: string;
  title: string;
  location: string;
  eventDate: string;
  imageUrl?: string;
  category?: string;
};

export default function MemberEventsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [message, setMessage] = useState("Loading events...");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;

    let active = true;

    fetch(`${api}/api/events/member/managed`, { credentials: "include" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load events.");
        if (!active) return;
        setEvents(data.events || []);
        setMessage("");
      })
      .catch(reason => {
        if (active) setMessage(reason instanceof Error ? reason.message : "Unable to load events.");
      });

    return () => {
      active = false;
    };
  }, [session]);

  async function remove(id: string) {
    setError("");
    setDeletingId(id);

    try {
      const response = await fetch(`${api}/api/events/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete event.");
      }

      setEvents(current => current.filter(item => item._id !== id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete event.");
    } finally {
      setDeletingId("");
    }
  }

  if (isPending) {
    return <main className="form-page">Loading...</main>;
  }

  if (!session) {
    return <main className="form-page"><h1>Please log in</h1><Link href="/login">Login</Link></main>;
  }

  return (
    <main className="form-page">
      <Link href="/" className="form-back">← Back to home</Link>
      <section className="form-panel">
        <span className="section-kicker">YOUR COMMUNITY ACTIVITY</span>
        <h1>Events I've organized</h1>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
        {events.length > 0 && (
          <div className="event-grid">
            {events.map(event => (
              <article className="event-card" key={event._id}>
                <div
                  className="event-image"
                  style={{
                    backgroundImage: `url("${event.imageUrl || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=85"}")`
                  }}
                />
                <div className="event-content">
                  <div className="event-date">{new Date(event.eventDate).toLocaleDateString()}</div>
                  <h3>{event.title}</h3>
                  <p>{event.location}</p>
                  <div className="event-card-bottom">
                    <Link href={`/events/${event._id}`}>View event ↗</Link>
                    <button
                      className="text-link"
                      type="button"
                      disabled={deletingId === event._id}
                      onClick={() => remove(event._id)}
                    >
                      {deletingId === event._id ? "Deleting..." : "Delete event"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {!events.length && !message && <p>You haven't organized any events yet.</p>}
        <Link href="/create-event" className="button">Create an event ↗</Link>
      </section>
    </main>
  );
}
