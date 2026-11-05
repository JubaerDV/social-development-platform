"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { consumeAuthSuccess } from "@/lib/auth-toast";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const headerRef = useRef<HTMLElement>(null);

  function closeMenus() {
    setMobileOpen(false);
    setProfileOpen(false);
  }

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    function syncTheme(event: StorageEvent) {
      if (event.key !== "site-theme") return;
      const next = event.newValue === "dark";
      document.documentElement.classList.toggle("dark", next);
      setDark(next);
    }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) closeMenus();
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenus();
    }
    window.addEventListener("storage", syncTheme);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("storage", syncTheme);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    const message = consumeAuthSuccess();
    if (message) toast.success(message);
  }, [session?.user.id]);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
    try { localStorage.setItem("site-theme", next ? "dark" : "light"); } catch { /* Theme still works without storage. */ }
  }

  async function logout() {
    if (signingOut) return;
    setSigningOut(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Unable to sign out. Please try again.");
      closeMenus();
      router.push("/login");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign out.");
    } finally {
      setSigningOut(false);
    }
  }

  const name = session?.user.name || "Community member";

  return (
    <div className="app-frame">
      <Toaster theme={dark ? "dark" : "light"} />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="top-strip"><span>Small actions. Stronger communities.</span><span>Make a difference, one event at a time.</span></div>
      <header className="site-header shared-header" ref={headerRef}>
        <Link href="/" className="brand" onClick={closeMenus} aria-label="SocialGood home">
          <span className="brand-mark" aria-hidden="true">S<span>+</span></span>
          <span>social<span className="brand-light">good</span><small>DEVELOPMENT EVENTS</small></span>
        </Link>

        <nav id="main-navigation" className={`desktop-nav shared-nav${mobileOpen ? " is-open" : ""}`} aria-label="Main navigation">
          <Link href="/events" onClick={closeMenus}>Upcoming Events</Link>
          <Link href="/#about" onClick={closeMenus}>About us</Link>
          <Link href="/#gallery" onClick={closeMenus}>Our impact</Link>
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark} title={dark ? "Light theme" : "Dark theme"}>
            <span aria-hidden="true">{dark ? "☀" : "☾"}</span>
          </button>
          {isPending ? <span className="nav-loading" role="status">Loading account...</span> : session ? (
            <>
              <div className="profile-wrap">
                <button className="profile-button" type="button" title={name} aria-label={`Account menu for ${name}`} aria-expanded={profileOpen} aria-controls="account-navigation" onClick={() => { setProfileOpen(!profileOpen); setMobileOpen(false); }}>
                  {session.user.image ? <img className="avatar avatar-image" src={session.user.image} alt={name} referrerPolicy="no-referrer" /> : <span className="avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>}
                  <span className="profile-label">{name}</span><span aria-hidden="true">⌄</span>
                </button>
                {profileOpen && <nav className="profile-menu" id="account-navigation" aria-label="Account navigation">
                  <span className="profile-name">{name}</span>
                  <Link href="/dashboard" onClick={closeMenus}>Dashboard</Link>
                  <Link href="/profile" onClick={closeMenus}>My profile</Link>
                  <Link href="/create-event" onClick={closeMenus}>Create Event</Link>
                  <Link href="/manage-events" onClick={closeMenus}>Manage Events</Link>
                  <Link href="/joined-events" onClick={closeMenus}>Joined Events</Link>
                </nav>}
              </div>
              <button className="logout-link" type="button" disabled={signingOut} onClick={logout}>{signingOut ? "Signing out..." : "Logout"}</button>
            </>
          ) : <Link className="login-link" href="/login" onClick={closeMenus}>Log in</Link>}
          <button className="mobile-menu-toggle" type="button" aria-expanded={mobileOpen} aria-controls="main-navigation" onClick={() => { setMobileOpen(!mobileOpen); setProfileOpen(false); }}>{mobileOpen ? "Close" : "Menu"}</button>
        </div>
      </header>
      {error && <p className="chrome-error" role="alert">{error}</p>}
      <div className="app-page-content" id="main-content" tabIndex={-1}>{children}</div>
      <footer className="site-footer">
        <div className="footer-main">
          <Link href="/" className="brand footer-brand" onClick={closeMenus} aria-label="SocialGood home"><span className="brand-mark" aria-hidden="true">S<span>+</span></span><span>social<span className="brand-light">good</span><small>DEVELOPMENT EVENTS</small></span></Link>
          <p>Bringing people together<br />to build a better tomorrow.</p>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/events" onClick={closeMenus}>Upcoming events</Link>
            <Link href="/create-event" onClick={closeMenus}>Create an event</Link>
            <Link href="/manage-events" onClick={closeMenus}>Manage events</Link>
            <Link href="/profile" onClick={closeMenus}>My profile</Link>
            <Link href="/joined-events" onClick={closeMenus}>Joined events</Link>
            <Link href="/#gallery" onClick={closeMenus}>Community gallery</Link>
            <Link href={session ? "/dashboard" : "/login"} onClick={closeMenus}>{session ? "Dashboard" : "Login"}</Link>
          </nav>
        </div>
        <div className="footer-bottom"><span>© SocialGood. Made for community.</span><span>GROW GOOD. DO GOOD. BE GOOD.</span></div>
      </footer>
    </div>
  );
}
