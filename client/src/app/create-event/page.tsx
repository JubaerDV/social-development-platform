"use client";

import Link from "next/link";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/loading-skeletons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { eventDateToIso, minimumEventDate } from "@/lib/event-time";

const api = "";

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
      const response = await fetch(`${api}/api/events`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, eventDate: eventDateToIso(String(payload.eventDate || "")) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create event.");
      }

      toast.success("Event created successfully.");
      router.push("/events");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not create event."
      );
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return <PageSkeleton label="Loading your account..." />;
  }

  if (!session) {
    return (
      <main className="form-page">
        <h1>Please log in first</h1>
        <Link href="/login">Go to login</Link>
      </main>
    );
  }

  return (
    <main className="form-page">
      <Link href="/" className="form-back">Back to home</Link>

      <section className="form-panel">
        <span className="section-kicker">MAKE A DIFFERENCE</span>
        <h1>Create a community event</h1>
        <p>Share an opportunity for people to contribute to their community.</p>

        {error && <p role="alert" className="form-error">{error}</p>}

        <form onSubmit={submit} className="event-form">
          <label>
            Event title
            <input
              name="title"
              type="text"
              required
              maxLength={120}
              placeholder="Enter event title"
            />
          </label>

          <label>
            Event type
            <select name="category" required defaultValue="">
              <option value="" disabled>Select a category</option>
              <option value="Cleanup">Cleanup</option>
              <option value="Plantation">Plantation</option>
              <option value="Donation">Donation</option>
              <option value="Community Service">Community Service</option>
              <option value="Environment">Environment</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Fundraising">Fundraising</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Location
            <input
              name="location"
              type="text"
              required
              maxLength={200}
              placeholder="Event location"
            />
          </label>

          <label>
            Event date and time (Bangladesh)
            <input
              name="eventDate"
              type="datetime-local"
              required
              min={minimumEventDate()}
            />
          </label>

          <label className="full-field">
            Event image URL
            <input
              name="imageUrl"
              type="url"
              required
              pattern="[hH][tT][tT][pP][sS]?://.+"
              maxLength={1000}
              placeholder="https://example.com/event-image.jpg"
            />
          </label>

          <label className="full-field">
            Description
            <textarea
              name="description"
              required
              rows={6}
              maxLength={5000}
              placeholder="Describe the event and how people can participate."
            />
          </label>

          <div className="full-field">
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Creating event..." : "Create event"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
