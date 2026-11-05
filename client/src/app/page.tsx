"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { formatEventDate } from "@/lib/event-time";

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
};

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const features = [
  { number: "01", title: "Create an event", text: "Bring people together around a cause and turn an idea into meaningful action." },
  { number: "02", title: "Join your community", text: "Discover local initiatives, meet people and contribute your time and skills." },
  { number: "03", title: "Track your impact", text: "Keep the events you joined close and stay connected to the causes you care about." },
];

const gallery = [
  { image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=85", label: "Community action" },
  { image: "https://images.unsplash.com/photo-1469540313663-8b9f5f2f6f2f?auto=format&fit=crop&w=900&q=85", label: "Learning together" },
  { image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=85", label: "Helping hands" },
  { image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=85", label: "Making a difference" },
];

export default function Home() {
  const { data: session } = authClient.useSession();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch(`${api}/api/events?upcoming=true&limit=6`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load events");
        const data = await response.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);





  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Thanks for your interest! Newsletter updates will be available soon.");
    (event.currentTarget as HTMLFormElement).reset();
  }

  return (
    <main className="site-shell">

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> COMMUNITY BEGINS WITH YOU</div>
          <h1>Good things happen<br />when we <em>come together.</em></h1>
          <p>Discover meaningful events, meet people who care, and take small steps toward a kinder, stronger community.</p>
          <div className="hero-actions"><a className="button" href="#events">Explore upcoming events <span>↗</span></a><Link className="text-link" href={session ? "/create-event" : "/register"}>Start an initiative <span>→</span></Link></div>
          <div className="hero-proof"><div className="proof-avatars"><span>J</span><span>A</span><span>R</span><span>M</span></div><div><strong>People-powered change</strong><small>Every contribution matters.</small></div></div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo" role="img" aria-label="Volunteers working together in a community"></div>
          <div className="photo-note"><span className="note-icon">✳</span><span><strong>Make an impact</strong><small>One event at a time</small></span></div>
          <div className="hero-stamp">BETTER<br />TOGETHER<br /><span>✳</span></div>
        </div>
        <div className="hero-bottom"><span>01 — 03</span><span>SCROLL TO EXPLORE ↓</span><span>EST. FOR GOOD</span></div>
      </section>

      <section className="intro-section" id="about">
        <div className="section-kicker">WHY WE EXIST <span>✳</span></div>
        <div className="intro-grid"><h2>A little good can<br />go a <em>long way.</em></h2><div><p className="intro-text">We believe stronger communities are built by people who show up. Our platform makes it easier to find opportunities, organize initiatives and turn shared intentions into real-world impact.</p><a className="text-link" href="#features">Discover what you can do <span>→</span></a></div></div>
        <div className="feature-grid" id="features">{features.map((item) => <article className="feature-card" key={item.number}><span>{item.number}</span><div className="feature-icon">{item.number === "01" ? "✳" : item.number === "02" ? "↗" : "◎"}</div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>

      <section className="events-section" id="events">
        <div className="section-heading"><div><div className="section-kicker">FIND YOUR NEXT YES <span>✳</span></div><h2>Upcoming <em>events.</em></h2></div><Link className="text-link" href="/events">View all events <span>→</span></Link></div>
        {eventsLoading ? <div className="empty-events">Finding good things happening near you…</div> : events.length ? <div className="event-grid">{events.slice(0, 6).map((event) => <article className="event-card" key={event._id}><div className="event-image" style={{ backgroundImage: `url("${event.imageUrl || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=85"}")` }}><span>{event.category}</span></div><div className="event-content"><div className="event-date">{formatEventDate(event.eventDate)}</div><h3>{event.title}</h3><p>⌖ {event.location}</p><div className="event-card-bottom"><small>By {event.organizerName}</small><Link href={`/events/${event._id}`}>View event ↗</Link></div></div></article>)}</div> : <div className="empty-events"><span>✳</span><h3>Good things are getting organized.</h3><p>There are no upcoming events just yet. Be the first to bring people together.</p><Link className="button" href={session ? "/create-event" : "/register"}>Create an event <span>↗</span></Link></div>}
      </section>

      <section className="gallery-section" id="gallery"><div className="gallery-heading"><div><div className="section-kicker">MOMENTS THAT MATTER <span>✳</span></div><h2>Real people. <em>Real change.</em></h2></div><p>Every gathering is a chance to make a difference. Here’s to the people who make it happen.</p></div><div className="gallery-grid">{gallery.map((item, index) => <div className={`gallery-photo gallery-photo-${index + 1}`} key={item.label} style={{ backgroundImage: `url("${item.image}")` }}><span>{item.label}</span></div>)}</div></section>

      <section className="newsletter-section"><div><div className="section-kicker">A LITTLE GOOD IN YOUR INBOX <span>✳</span></div><h2>Stay close to the <em>good stuff.</em></h2><p>Get community stories and event inspiration delivered to your inbox.</p></div><form className="newsletter-form" onSubmit={subscribe}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required /><button type="submit">Count me in <span>↗</span></button>{notice && <small role="status">{notice}</small>}</form></section>

    </main>
  );
}
