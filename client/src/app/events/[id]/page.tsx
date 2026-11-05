"use client";

import Link from "next/link";
import { EventDetailsSkeleton } from "@/components/loading-skeletons";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { formatEventDateTime } from "@/lib/event-time";

type EventItem = {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  category: string;
  eventDate: string;
  organizerName: string;
  joinedCount?: number;
  joinedBy?: string[];
};

const fallbackImage = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=85";

function EventDetailsContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinFailed, setJoinFailed] = useState(false);
  const joiningRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setEvent(null);
    setError("");
    setMessage("");

    async function load() {
      try {
        const response = await fetch(`/api/events/${id}`, {
          credentials: "include", cache: "no-store", signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load this event.");
        if (!controller.signal.aborted) setEvent(data.event);
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Unable to load this event.");
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [id, session?.user.id]);

  const joined = !!session && !!event?.joinedBy?.includes(session.user.id);
  const ended = !!event && new Date(event.eventDate).getTime() <= Date.now();

  async function join() {
    if (isPending || joiningRef.current || joined || ended) return;
    if (!session) { router.push("/login"); return; }

    joiningRef.current = true;
    setJoining(true);
    setJoinFailed(false);
    setMessage("");
    try {
      const response = await fetch(`/api/events/${id}/join`, {
        method: "POST", credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          const fresh = await fetch(`/api/events/${id}`, {
            credentials: "include", cache: "no-store",
          });
          if (fresh.ok) {
            const latest = await fresh.json();
            setEvent(latest.event);
            if (latest.event.joinedBy?.includes(session.user.id)) {
              setMessage("You have already joined this event.");
              return;
            }
          }
        }
        throw new Error(data.message || "Unable to join this event.");
      }
      setEvent(current => current ? {
        ...current,
        joinedBy: [...(current.joinedBy || []), session.user.id],
        joinedCount: (current.joinedCount || 0) + 1,
      } : current);
      setMessage("You joined this event. Find it in Joined Events.");
    } catch (reason) {
      setJoinFailed(true);
      setMessage(reason instanceof Error ? reason.message : "Unable to join. Please try again.");
    } finally {
      joiningRef.current = false;
      setJoining(false);
    }
  }

  if (error) return (
    <main className="form-page">
      <Link href="/events" className="form-back">Back to events</Link>
      <section className="form-panel"><h1>Unable to load event</h1><p role="alert">{error}</p></section>
    </main>
  );
  if (!event) return <EventDetailsSkeleton />;

  return (
    <main className="form-page event-detail-page">
      <Link href="/events" className="form-back">Back to events</Link>
      <article className="detail-panel">
        <img className="detail-image" src={event.imageUrl || fallbackImage} alt={event.title}
          onError={e => {
            const image = e.currentTarget;
            if (image.src !== fallbackImage) image.src = fallbackImage;
          }} />
        <div className="detail-copy">
          <span className="section-kicker">{event.category}</span>
          <h1>{event.title}</h1>
          <dl className="detail-facts">
            <div><dt>Date and time</dt><dd><time dateTime={event.eventDate}>{formatEventDateTime(event.eventDate)}</time><small>Bangladesh time (UTC+6)</small></dd></div>
            <div><dt>Location</dt><dd>{event.location}</dd></div>
            <div><dt>Organized by</dt><dd>{event.organizerName}</dd></div>
            <div><dt>Participants</dt><dd>{event.joinedCount || 0} joined</dd></div>
          </dl>
          <section className="detail-description"><h2>About this event</h2><p>{event.description}</p></section>
          <div className="detail-actions">
            <button className="button" onClick={join} disabled={isPending || joining || joined || ended}>
              {joining ? "Joining..." : joined ? "Joined" : ended ? "Event ended" : isPending ? "Checking account..." : !session ? "Log in to join" : "Join this event"}
            </button>
            {joined && <Link className="text-link" href="/joined-events">View joined events</Link>}
          </div>
          {message && <p className={joinFailed ? "detail-feedback detail-feedback-error" : "detail-feedback"} role={joinFailed ? "alert" : "status"}>{message}</p>}
        </div>
      </article>
    </main>
  );
}

export default function EventDetailsPage() {
  return <Suspense fallback={<EventDetailsSkeleton />}><EventDetailsContent /></Suspense>;
}
