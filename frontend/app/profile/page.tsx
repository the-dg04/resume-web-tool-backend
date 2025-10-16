"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000";

export default function ProfilePage() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<"user" | "company" | null>(null);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    type: string;
  } | null>(null);
  const [companyProfile, setCompanyProfile] = useState<{
    name: string;
    location: string | null;
    linkedin_url: string | null;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      if (t) {
        setToken(t);
        const decoded: any = jwtDecode(t);
        setRole(decoded?.role === "company" ? "company" : "user");
      }
    } catch {
      router.push("/")
    }
  }, []);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  }

  async function apiFetch<T>(path: string, init?: RequestInit) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BACKEND_URL}${path}`, { ...init, headers });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as T;
  }

  useEffect(() => {
    if (!token) return;
    if (role === "company") {
      (async () => {
        try {
          const c = await apiFetch<{
            name: string;
            location: string | null;
            linkedin_url: string | null;
          }>("/api/companies/me");
          setCompanyProfile(c);
        } catch {}
      })();
    } else if (role === "user") {
      (async () => {
        try {
          const u = await apiFetch<{
            name: string;
            email: string;
            type: string;
          }>("/auth/me");
          setUserProfile(u);
        } catch {}
      })();
    }
  }, [token, role]);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <a href="/" className="text-sm text-white/70 hover:underline">
            ← Back
          </a>
        </div>

        {!token ? (
          <div className="text-white/60">Sign in to view your profile.</div>
        ) : role === "company" ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-white/60">Company Name</div>
                <div className="text-sm text-white/90">
                  {companyProfile?.name || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60">Admin Email</div>
                <div className="text-sm text-white/90">
                  {(jwtDecode(token) as any).email}
                </div>
              </div>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget as HTMLFormElement);
                const location =
                  String(form.get("location") || "").trim() || undefined;
                const linkedin_url =
                  String(form.get("linkedin_url") || "").trim() || undefined;
                try {
                  const updated = await apiFetch<{
                    name: string;
                    location: string | null;
                    linkedin_url: string | null;
                  }>("/api/companies/me", {
                    method: "PATCH",
                    body: JSON.stringify({ location, linkedin_url }),
                  });
                  setCompanyProfile(updated);
                  showToast("Saved");
                } catch {
                  showToast("Save failed");
                }
              }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <input
                name="location"
                defaultValue={companyProfile?.location || ""}
                placeholder="Location"
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              />
              <input
                name="linkedin_url"
                defaultValue={companyProfile?.linkedin_url || ""}
                placeholder="Contact/LinkedIn"
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              />
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-white/60">Name</div>
                <div className="text-sm text-white/90">
                  {userProfile?.name || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60">Email</div>
                <div className="text-sm text-white/90">
                  {userProfile?.email || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60">Plan</div>
                <div className="text-sm text-white/90">
                  {userProfile?.type || "free"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast ? (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 transform rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90 shadow-lg backdrop-blur">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
