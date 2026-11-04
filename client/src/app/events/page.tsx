import Link from "next/link";
import { formatEventDate } from "@/lib/event-time";

export const instant = false;

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getEvents() {
  try {
    const response = await fetch(`${api}/api/events?upcoming=true&limit=50`, { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.events) ? data.events : [];
  } catch {
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();
  return <main className="form-page"><Link href="/" className="form-back">← Back to home</Link><section className="form-panel"><span className="section-kicker">FIND YOUR NEXT YES</span><h1>Upcoming <em>events.</em></h1>{events.length ? <div className="event-grid">{events.map((event: any) => <article className="event-card" key={event._id}><div className="event-image" style={{ backgroundImage: `url("${event.imageUrl || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=85"}")` }} /><div className="event-content"><div className="event-date">{formatEventDate(event.eventDate)}</div><h3>{event.title}</h3><p>{event.location}</p><Link href={`/events/${event._id}`}>View event ↗</Link></div></article>)}</div> : <p>No upcoming events yet. <Link href="/create-event">Create the first one.</Link></p>}</section></main>;
}
