"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { PageSkeleton } from "@/components/loading-skeletons";

type ProfileUser = { id: string; name: string; email: string; image?: string | null };

function ProfileForm({ user, refresh }: { user: ProfileUser; refresh: () => Promise<unknown> }) {
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image || "");
  const [imageFailed, setImageFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cleanName = name.trim();
  const cleanImage = image.trim();
  const dirty = cleanName !== user.name || cleanImage !== (user.image || "");
  let preview = "";
  try {
    const url = new URL(cleanImage);
    if (["http:", "https:"].includes(url.protocol)) preview = cleanImage;
  } catch { /* Use initials until a complete image URL is entered. */ }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setNotice("");
    if (cleanName.length < 2 || cleanName.length > 80) {
      setError("Please enter a name between 2 and 80 characters.");
      return;
    }
    if (cleanImage && (!preview || cleanImage.length > 1000)) {
      setError("Please enter a valid HTTP or HTTPS photo URL (maximum 1000 characters).");
      return;
    }
    setSaving(true);
    try {
      const result = await authClient.updateUser({ name: cleanName, image: cleanImage || null });
      if (result.error) throw new Error(result.error.message || "Unable to update your profile.");
      await refresh();
      setNotice("Your profile has been updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setName(user.name);
    setImage(user.image || "");
    setImageFailed(false);
    setError("");
    setNotice("");
  }

  return (
    <main className="form-page">
      <Link href="/dashboard" className="form-back">Back to dashboard</Link>
      <section className="form-panel">
        <span className="section-kicker">YOUR COMMUNITY PROFILE</span>
        <h1>My profile</h1>
        <p>Choose the name and photo your community sees.</p>
        <div className="profile-layout">
          <div className="profile-summary">
            {preview && !imageFailed ? <img className="profile-photo" src={preview} alt={`${cleanName || user.name}'s profile`} referrerPolicy="no-referrer" onError={() => setImageFailed(true)} /> : <div className="profile-photo profile-initial" aria-label="Profile initials">{(cleanName || user.name || "M").charAt(0).toUpperCase()}</div>}
            <p className="profile-display-name">{cleanName || user.name}</p>
          </div>
          <form className="event-form profile-form" onSubmit={save} aria-busy={saving}>
            <label htmlFor="profile-name">Display name<input id="profile-name" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={e => setName(e.target.value)} disabled={saving} /></label>
            <label htmlFor="profile-email">Sign-in email<input id="profile-email" type="email" value={user.email} readOnly /></label>
            <label htmlFor="profile-image">Profile photo URL (optional)<input id="profile-image" type="url" maxLength={1000} pattern="[hH][tT][tT][pP][sS]?://.+" value={image} placeholder="https://example.com/profile.jpg" onChange={e => { setImage(e.target.value); setImageFailed(false); }} disabled={saving} /><small className="profile-hint">Leave empty to use your initial.</small></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            {notice && <p className="profile-success" role="status">{notice}</p>}
            <div className="profile-actions"><button className="button" type="submit" disabled={saving || !dirty}>{saving ? "Saving..." : "Save profile"}</button><button className="button button-outline" type="button" onClick={reset} disabled={saving || !dirty}>Reset changes</button></div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function ProfilePage() {
  const { data: session, isPending, refetch } = authClient.useSession();
  if (isPending) return <PageSkeleton label="Loading your profile..." />;
  if (!session) return <main className="form-page"><section className="form-panel"><h1>Please log in</h1><p>Sign in to view and update your profile.</p><Link href="/login" className="button">Go to login</Link></section></main>;
  return <ProfileForm key={session.user.id} user={session.user} refresh={async () => { await refetch(); }} />;
}
