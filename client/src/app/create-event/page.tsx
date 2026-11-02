"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`${api}/api/events`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not create event.");
      router.push(`/events/${data.event._id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create event.");
    } finally {
      setLoading(false);
    }
  }
  if (isPending) return <main className="form-page">Loading your account…</main>;
  if (!session) return <main className="form-page"><h1>Please log in first</h1><Link href="/login">Go to login</Link></main>;
  return <main className="form-page"><Link href="/" className="form-back">← Back to home</Link><section className="form-panel"><span className="section-kicker">BRING PEOPLE TOGETHER</span><h1>Create an <em>event.</em></h1><p>Share an initiative and invite your community to take part.</p>{error && <div className="form-error">{error}</div>}<form onSubmit={submit} className="event-form"><label>Event title<input name="title" required maxLength={120} placeholder="e.g. Neighborhood clean-up day" /></label><label>Category<select name="category" required defaultValue=""><option value="" disabled>Select a category</option><option>Community Service</option><option>Environment</option><option>Education</option><option>Health</option><option>Fundraising</option><option>Other</option></select></label><label>Location<input name="location" required maxLength={200} placeholder="Where will it happen?" /></label><label>Event date and time<input name="eventDate" type="datetime-local" required min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} /></label><label>Image URL <span>(optional)</span><input name="imageUrl" type="url" placeholder="https://…" /></label><label className="full-field">Description<textarea name="description" required rows={6} maxLength={5000} placeholder="Tell people what the event is about…" /></label><button className="button full-field" disabled={loading}>{loading ? "Publishing…" : "Publish event ↗"}</button></form></section></main>;
}
