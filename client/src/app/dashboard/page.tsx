"use client";

import Link from "next/link";
import { PageSkeleton } from "@/components/loading-skeletons";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  async function handleLogout() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (isPending || !session) {
    return <PageSkeleton label="Checking your session..." />;
  }

  return (
    <main className="dashboard-page px-5 py-12">
      <section className="mx-auto max-w-4xl">

        <div className="mt-12 rounded-3xl bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
            Member dashboard
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Welcome, {session.user.name || "Community Member"}!
          </h1>
          <p className="mt-3 text-slate-600">
            You are successfully logged in to the Social Development Events Platform.
          </p>

          <div className="mt-8 rounded-2xl bg-emerald-50 p-5">
            <p className="text-sm text-emerald-800">Logged in email</p>
            <p className="mt-1 break-all font-semibold text-emerald-950">
              {session.user.email}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/" className="rounded-xl bg-emerald-700 px-5 py-4 text-center font-semibold text-white transition hover:bg-emerald-800">
              Explore community
            </Link>
            <Link href="/profile" className="rounded-xl border border-slate-300 px-5 py-4 text-center font-semibold text-slate-700 transition hover:bg-slate-50">My profile</Link>
            <button onClick={handleLogout} className="rounded-xl border border-slate-300 px-5 py-4 font-semibold text-slate-700 transition hover:bg-slate-50">
              Sign out
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
