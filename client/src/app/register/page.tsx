"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase) {
      setError(
        "Password must contain at least 6 characters, one uppercase and one lowercase letter."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (photoURL && !/^https?:\/\/.+/i.test(photoURL)) {
      setError("Please enter a valid photo URL.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: photoURL.trim() || undefined,
      });

      if (result.error) {
        setError(result.error.message || "Registration failed. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/dashboard",
      });

      if (result.error) {
        setError(result.error.message || "Google sign-in failed.");
        setLoading(false);
      }
    } catch {
      setError("Unable to connect to Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  const requirementClass = (passed: boolean) =>
    passed ? "text-emerald-700" : "text-slate-400";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
        <Link href="/" className="text-sm font-bold text-emerald-700">
          ← Social Development
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Join the community
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-slate-500">
            Be part of positive change in your community.
          </p>
        </div>

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}



        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label htmlFor="photoURL" className="mb-2 block text-sm font-semibold text-slate-700">
              Profile photo URL <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="photoURL"
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create your password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-emerald-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs">
              <p className={requirementClass(hasMinLength)}>
                {hasMinLength ? "✓" : "○"} At least 6 characters
              </p>
              <p className={requirementClass(hasUppercase)}>
                {hasUppercase ? "✓" : "○"} At least 1 uppercase letter (A-Z)
              </p>
              <p className={requirementClass(hasLowercase)}>
                {hasLowercase ? "✓" : "○"} At least 1 lowercase letter (a-z)
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter your password again"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-emerald-700"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs">
              {!confirmPassword ? (
                <p className="text-slate-400">○ Re-enter your password to confirm</p>
              ) : passwordsMatch ? (
                <p className="text-emerald-700">✓ Passwords match</p>
              ) : (
                <p className="text-red-600">○ Passwords do not match</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <span className="text-xl font-bold text-blue-600">G</span>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase text-slate-400">
            Or register with email
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>        <p className="mt-7 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-emerald-700 hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
