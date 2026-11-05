"use client";

import Link from "next/link";
import { EventCardsSkeleton, PageSkeleton } from "@/components/loading-skeletons";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { eventDateToIso, minimumEventDate, formatEventDate, toEventInput } from "@/lib/event-time";

const api = "";

type EventItem = {
  _id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  imageUrl?: string;
  category: string;
};

type EventForm = {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  imageUrl: string;
  category: string;
};

const emptyForm: EventForm = {
  title: "",
  description: "",
  location: "",
  eventDate: "",
  imageUrl: "",
  category: ""
};

function toLocalDateTime(value: string) {
  return toEventInput(value);
}

export default function MemberEventsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [message, setMessage] = useState("");
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<EventForm>(emptyForm);

  useEffect(() => {
    if (!session) return;

    let active = true;
    setEventsLoading(true);
    setEvents([]);
    setMessage("");

    fetch(`${api}/api/events/member/managed`, {
      credentials: "include"
    })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load events.");
        }
        if (!active) return;
        setEvents(data.events || []);
        setMessage("");
      })
      .catch(reason => {
        if (active) {
          setMessage(
            reason instanceof Error
              ? reason.message
              : "Unable to load events."
          );
        }
      })
      .finally(() => {
        if (active) setEventsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session]);

  function startEdit(event: EventItem) {
    setError("");
    setMessage("");
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: toLocalDateTime(event.eventDate),
      imageUrl: event.imageUrl || "",
      category: event.category
    });
  }

  function cancelEdit() {
    setEditingId("");
    setForm(emptyForm);
    setError("");
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${api}/api/events/${editingId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventDate: eventDateToIso(form.eventDate) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update event.");
      }

      setEvents(current =>
        current.map(item =>
          item._id === editingId ? data.event : item
        )
      );

      setEditingId("");
      setForm(emptyForm);
      setMessage("Event updated successfully.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to update event."
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
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

      if (editingId === id) cancelEdit();

      setMessage("Event deleted successfully.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to delete event."
      );
    } finally {
      setDeletingId("");
    }
  }

  if (isPending) {
    return <PageSkeleton label="Loading your account..." />;
  }

  if (!session) {
    return (
      <main className="form-page">
        <h1>Please log in</h1>
        <Link href="/login">Login</Link>
      </main>
    );
  }

  return (
    <main className="form-page">
      <Link href="/" className="form-back">← Back</Link>

      <section className="form-panel">
        <span className="section-kicker">YOUR COMMUNITY ACTIVITY</span>
        <h1>Events I've organized</h1>

        {message && <p role="status">{message}</p>}
        {error && <p role="alert" className="form-error">{error}</p>}

        {editingId && (
          <form onSubmit={saveEdit} className="event-form">
            <h2>Edit event</h2>

            <label>
              Event title
              <input
                required
                maxLength={120}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </label>

            <label>
              Event type
              <select
                required
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select a category</option>
                <option>Cleanup</option>
                <option>Plantation</option>
                <option>Donation</option>
                <option>Community Service</option>
                <option>Environment</option>
                <option>Education</option>
                <option>Health</option>
                <option>Fundraising</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Location
              <input
                required
                maxLength={200}
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </label>

            <label>
              Event date and time (Bangladesh)
              <input
                required
                type="datetime-local"
                min={minimumEventDate()}
                value={form.eventDate}
                onChange={e => setForm({ ...form, eventDate: e.target.value })}
              />
            </label>

            <label>
              Event image URL
              <input
                type="url"
                required
                maxLength={1000}
                pattern="[hH][tT][tT][pP][sS]?://.+"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
              />
            </label>

            <label className="full-field">
              Description
              <textarea
                required
                rows={6}
                maxLength={5000}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <div className="full-field" style={{ display: "flex", gap: 12 }}>
              <button className="button" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                className="button"
                type="button"
                disabled={saving}
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {eventsLoading && <EventCardsSkeleton />}
        {!eventsLoading && events.length > 0 && (
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
                  <div className="event-date">
                    {formatEventDate(event.eventDate)}
                  </div>

                  <h3>{event.title}</h3>
                  <p>{event.location}</p>

                  <div className="event-card-bottom">
                    <Link href={`/events/${event._id}`}>View event →</Link>

                    <button
                      className="text-link"
                      type="button"
                      disabled={saving || deletingId === event._id}
                      onClick={() => startEdit(event)}
                    >
                      Edit
                    </button>

                    <button
                      className="text-link"
                      type="button"
                      disabled={deletingId === event._id || saving}
                      onClick={() => remove(event._id)}
                    >
                      {deletingId === event._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!eventsLoading && !events.length && !message && (
          <p>You haven't organized any events yet.</p>
        )}
        <Link href="/create-event" className="button">Create an event</Link>
      </section>
    </main>
  );
}
