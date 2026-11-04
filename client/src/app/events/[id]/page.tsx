"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

const api = "";

type EventItem = { _id: string; title: string; description: string; imageUrl?: string; location: string; category: string; eventDate: string; organizerName: string; joinedCount?: number };

function EventDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { fetch(`${api}/api/events/${params.id}`).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message); setEvent(d.event); }).catch(e => setError(e.message || "Event not found.")); }, [params.id]);
  async function join() {
    if (!session) { router.push("/login"); return; }
    const response = await fetch(`${api}/api/events/${params.id}/join`, { method: "POST", credentials: "include" });
    const data = await response.json();
    setMessage(data.message || "Request complete.");
    if (response.ok) setEvent(current => current ? { ...current, joinedCount: (current.joinedCount || 0) + 1 } : current);
  }
  if (error) return <main className="form-page"><p>{error}</p><Link href="/">Back home</Link></main>;
  if (!event) return <main className="form-page">Loading event…</main>;
  return <main className="form-page"><Link href="/" className="form-back">← Back to events</Link><article className="detail-panel"><div className="detail-image" style={{ backgroundImage: `url("${event.imageUrl || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=85"}")` }} /><div className="detail-copy"><span className="section-kicker">{event.category}</span><h1>{event.title}</h1><p className="detail-meta">{new Date(event.eventDate).toLocaleString()} · {event.location}</p><p>{event.description}</p><p>Organized by {event.organizerName} · {event.joinedCount || 0} joined</p><button className="button" onClick={join}>Join this event ↗</button>{message && <p role="status">{message}</p>}</div></article></main>;
}

export default function EventDetailsPage() {
  return <Suspense fallback={<main className="form-page">Loading event...</main>}><EventDetailsContent /></Suspense>;
}
