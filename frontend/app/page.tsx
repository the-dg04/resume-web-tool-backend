"use client";

import { useEffect, useMemo, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";

type Role = {
  role_id: number;
  company_id: number;
  job_description: string;
  pay: string | null;
  location: string | null;
  start_date?: string | null;
  application_end_date?: string | null;
  hours_per_week?: number | null;
  company_name: string;
};

type Company = {
  company_id: number;
  name: string;
  location?: string | null;
  linkedin_url?: string | null;
};

type Resume = {
  resume_id: number;
  user_id: number;
  resume_name?: string | null;
  resume_url: string;
  created_at?: string;
};

type Application = {
  application_id: number;
  status: "applied" | "reviewing" | "interviewing" | "rejected" | "hired";
  created_at: string;
  job_description: string;
  company_name: string;
};

type CompanyApplication = {
  application_id: number;
  status: "applied" | "reviewing" | "interviewing" | "rejected" | "hired";
  created_at: string;
  role_id: number;
  resume_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  job_description: string;
  company_name: string;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000";
const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || "";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white/90">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-sm sm:text-base text-white/60 mt-1">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const cookies = useCookies();
  const router = useRouter();

  const [role, setRole] = useState<"user" | "company" | null>(null);

  const [activeTab, setActiveTab] = useState<
    "roles" | "companies" | "resumes" | "applications" | "admin"
  >("roles");

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [roleSearch, setRoleSearch] = useState("");
  const [roleCompanyFilter, setRoleCompanyFilter] = useState<string>("");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [resumesError, setResumesError] = useState<string | null>(null);
  const [newResumeUrl, setNewResumeUrl] = useState("");
  const [newResumeName, setNewResumeName] = useState("");

  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"user" | "company">("user");

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyRole, setApplyRole] = useState<Role | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [applySubmitting, setApplySubmitting] = useState(false);

  // Company Admin
  const [adminTab, setAdminTab] = useState<"postRole" | "reviewApps">("postRole");
  const [adminCompanyId, setAdminCompanyId] = useState<string>("");
  const [postRoleForm, setPostRoleForm] = useState({
    company_id: "",
    job_description: "",
    pay: "",
    location: "",
    start_date: "",
    application_end_date: "",
    hours_per_week: "",
  });
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [companyApps, setCompanyApps] = useState<CompanyApplication[]>([]);
  const [companyAppsLoading, setCompanyAppsLoading] = useState(false);
  const [companyAppsError, setCompanyAppsError] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    try {
      const t = localStorage.getItem("token");
      if (t) {
        setToken(t);
        try {
          const decoded: any = jwtDecode(t);
          if (decoded?.role === "company" || decoded?.role === "user") {
            setRole(decoded.role);
            if (decoded.role === "company") setActiveTab("admin");
          }
        } catch {}
      }
    } catch {}
  }, []);

  async function apiFetch<T>(path: string, init: RequestInit = {}, auth = false) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };
    if (auth && token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BACKEND_URL}${path}`, { ...init, headers });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as T;
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    const run = async () => {
      setRolesLoading(true);
      setRolesError(null);
      try {
        const data = await apiFetch<Role[]>("/api/roles");
        setRoles(data);
      } catch (e: unknown) {
        setRolesError(String(e));
      } finally {
        setRolesLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      setCompaniesLoading(true);
      setCompaniesError(null);
      try {
        const data = await apiFetch<Company[]>("/api/companies");
        setCompanies(data);
      } catch (e: unknown) {
        setCompaniesError(String(e));
      } finally {
        setCompaniesLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!token || role === "company") {
      setResumes([]);
      return;
    }
    const run = async () => {
      setResumesLoading(true);
      setResumesError(null);
      try {
        const data = await apiFetch<Resume[]>("/api/resumes", {}, true);
        setResumes(data);
      } catch (e: unknown) {
        setResumesError(String(e));
      } finally {
        setResumesLoading(false);
      }
    };
    run();
  }, [token, role]);

  useEffect(() => {
    if (!token || role === "company") {
      setApplications([]);
      return;
    }
    const run = async () => {
      setApplicationsLoading(true);
      setApplicationsError(null);
      try {
        const data = await apiFetch<Application[]>("/api/applications", {}, true);
        setApplications(data);
      } catch (e: unknown) {
        setApplicationsError(String(e));
      } finally {
        setApplicationsLoading(false);
      }
    };
    run();
  }, [token, role]);

  const uniqueCompanyNames = useMemo(() => {
    const set = new Set<string>();
    for (const r of roles) {
      if (r.company_name) set.add(r.company_name);
    }
    return Array.from(set).sort();
  }, [roles]);

  const filteredRoles = useMemo(() => {
    const q = roleSearch.toLowerCase();
    return roles.filter((r) => {
      const matchText = `${r.company_name} ${r.location ?? ""} ${r.pay ?? ""} ${r.job_description}`.toLowerCase();
      const passSearch = q.length === 0 || matchText.includes(q);
      const passCompany = roleCompanyFilter ? r.company_name === roleCompanyFilter : true;
      return passSearch && passCompany;
    });
  }, [roles, roleSearch, roleCompanyFilter]);

  async function handleLoginViaBackend(user: { name: string; email: string }, as: "user" | "company") {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/${as === "company" ? "login-company" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      }).then((r) => r.json());
      const receivedToken: string | undefined = res.token || res.authToken;
      if (!receivedToken) throw new Error("No token returned");
      setToken(receivedToken);
      try {
        localStorage.setItem("token", receivedToken);
        cookies.set("authToken", receivedToken);
        const decoded: any = jwtDecode(receivedToken);
        setRole(decoded?.role === "company" ? "company" : "user");
      } catch {}
      showToast("Signed in");
      setActiveTab(as === "company" ? "admin" : "roles");
    } catch (e: unknown) {
      showToast("Login failed");
    }
  }

  function handleLogout() {
    setToken(null);
    setRole(null);
    try {
      localStorage.removeItem("token");
      cookies.remove("authToken");
    } catch {}
    showToast("Signed out");
  }

  async function handleAddResume(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return showToast("Sign in first");
    if (!newResumeUrl.trim()) return showToast("Enter resume URL");
    try {
      await apiFetch<Resume>(
        "/api/resumes",
        {
          method: "POST",
          body: JSON.stringify({ resume_url: newResumeUrl.trim(), resume_name: newResumeName.trim() || "Resume" }),
        },
        true
      );
      setNewResumeUrl("");
      setNewResumeName("");
      const data = await apiFetch<Resume[]>("/api/resumes", {}, true);
      setResumes(data);
      showToast("Resume added");
    } catch (e: unknown) {
      showToast("Failed to add resume");
    }
  }

  function openApply(role: Role) {
    if (rolePropIsCompany()) return; // company should not apply
    setApplyRole(role);
    setSelectedResumeId(resumes[0]?.resume_id ?? null);
    setApplyOpen(true);
  }

  function rolePropIsCompany() {
    return role === "company";
  }

  async function submitApplication() {
    if (!token) return showToast("Sign in first");
    if (!applyRole || !selectedResumeId) return showToast("Select a resume");
    setApplySubmitting(true);
    try {
      await apiFetch(
        "/api/applications",
        {
          method: "POST",
          body: JSON.stringify({ role_id: applyRole.role_id, resume_id: selectedResumeId }),
        },
        true
      );
      showToast("Application submitted");
      setApplyOpen(false);
      setApplyRole(null);
      setSelectedResumeId(null);
      try {
        const data = await apiFetch<Application[]>("/api/applications", {}, true);
        setApplications(data);
      } catch {}
    } catch (e: unknown) {
      showToast("Failed to apply");
    } finally {
      setApplySubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(59,130,246,0.25),transparent),radial-gradient(900px_500px_at_80%_-10%,rgba(168,85,247,0.25),transparent),radial-gradient(700px_400px_at_50%_110%,rgba(16,185,129,0.18),transparent)]" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-500 via-fuchsia-500 to-emerald-400 shadow-[0_0_32px_rgba(59,130,246,0.6)]" />
              <span className="text-lg font-semibold tracking-tight text-white/90">Interview Portal</span>
            </div>
            <div className="flex items-center gap-2">
              {isHydrated && token ? (
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition"
                >
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">Careers Hub</span>
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Browse roles, manage resumes, and track applications in one place.
            </p>
          </div>
          {!token ? (
            <div className="w-full sm:w-auto">
              <div className="mb-2 flex gap-2">
                {(["user", "company"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setAuthMode(m)}
                    className={cx(
                      "rounded-full border px-3 py-1.5 text-sm transition",
                      authMode === m
                        ? "border-transparent bg-white/15 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    )}
                  >
                    {m === "user" ? "User" : "Company"}
                  </button>
                ))}
              </div>
              <GoogleOAuthProvider clientId={OAUTH_CLIENT_ID}>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 text-xs text-white/70">
                    Sign in with Google ({authMode})
                  </div>
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      try {
                        const decoded: any = jwtDecode(
                          String(credentialResponse.credential || "")
                        );
                        const user = {
                          email: decoded.email as string,
                          name: (decoded.name as string) || (decoded.given_name as string) || "User",
                        };
                        void handleLoginViaBackend(user, authMode);
                      } catch (err) {
                        console.error(err);
                        showToast("Google decode failed");
                      }
                    }}
                    onError={() => {
                      showToast("Google login failed");
                    }}
                  />
                </div>
              </GoogleOAuthProvider>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              Authenticated
            </div>
          )}
        </div>

        <nav className="mb-6 flex flex-wrap gap-2">
          {role === "company" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={cx(
                "rounded-full border px-4 py-1.5 text-sm transition",
                activeTab === "admin"
                  ? "border-transparent bg-white/15 text-white shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              Company Admin
            </button>
          )}
          {role !== "company" && (
            <>
              <button
                onClick={() => setActiveTab("roles")}
                className={cx(
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  activeTab === "roles"
                    ? "border-transparent bg-white/15 text-white shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                Explore Roles
              </button>
              <button
                onClick={() => setActiveTab("companies")}
                className={cx(
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  activeTab === "companies"
                    ? "border-transparent bg-white/15 text-white shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                Companies
              </button>
            </>
          )}
          {role !== "company" && (
            <>
              <button
                onClick={() => setActiveTab("resumes")}
                className={cx(
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  activeTab === "resumes"
                    ? "border-transparent bg-white/15 text-white shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                Resumes
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={cx(
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  activeTab === "applications"
                    ? "border-transparent bg-white/15 text-white shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                Applications
              </button>
            </>
          )}
        </nav>

        {activeTab === "roles" ? (
          <section>
            <SectionHeader
              title="Explore roles"
              subtitle="Filter by company or search descriptions, locations, and pay."
            />
            <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                placeholder="Search roles"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:ring-2 focus:ring-fuchsia-500/60"
              />
              <select
                value={roleCompanyFilter}
                onChange={(e) => setRoleCompanyFilter(e.target.value)}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/60"
              >
                <option value="">All companies</option>
                {uniqueCompanyNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            {rolesLoading ? (
              <div className="text-white/70">Loading roles…</div>
            ) : rolesError ? (
              <div className="text-rose-300">{rolesError}</div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-white/60">No roles match your filters.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRoles.map((r) => (
                  <div
                    key={r.role_id}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-medium text-white/90">
                        {r.company_name}
                      </div>
                      <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-white/70">
                        {r.location || "Remote"}
                      </span>
                    </div>
                    <div className="mb-3 line-clamp-3 text-sm text-white/70">
                      {r.job_description}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-emerald-300/90">
                        {r.pay || "Pay TBD"}
                      </div>
                      <button
                        onClick={() => openApply(r)}
                        className="rounded-md bg-gradient-to-r from-emerald-500 to-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "companies" ? (
          <section>
            <SectionHeader title="Companies" subtitle="Discover employers and their locations." />
            {companiesLoading ? (
              <div className="text-white/70">Loading companies…</div>
            ) : companiesError ? (
              <div className="text-rose-300">{companiesError}</div>
            ) : companies.length === 0 ? (
              <div className="text-white/60">No companies found.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((c) => (
                  <a
                    key={c.company_id}
                    href={c.linkedin_url || "#"}
            target="_blank"
                    rel="noreferrer"
                    className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="mb-1 text-base font-medium text-white/90">
                      {c.name}
                    </div>
                    <div className="text-sm text-white/60">{c.location || "—"}</div>
                  </a>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "resumes" ? (
          <section>
            <SectionHeader
              title="Resumes"
              subtitle={token ? "Manage your resume URLs." : "Sign in to manage your resumes."}
            />
            {!token ? (
              <div className="text-white/60">Authentication required.</div>
            ) : (
              <>
                <form onSubmit={handleAddResume} className="mb-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    placeholder="https://..."
                    value={newResumeUrl}
                    onChange={(e) => setNewResumeUrl(e.target.value)}
                    className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/60"
                  />
                  <input
                    placeholder="Resume name"
                    value={newResumeName}
                    onChange={(e) => setNewResumeName(e.target.value)}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:ring-2 focus:ring-emerald-500/60"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-gradient-to-r from-emerald-500 to-fuchsia-500 px-3 py-2 text-sm font-semibold shadow-[0_0_24px_rgba(16,185,129,0.5)] hover:brightness-110 transition"
                  >
                    Add resume URL
                  </button>
                </form>
                {resumesLoading ? (
                  <div className="text-white/70">Loading resumes…</div>
                ) : resumesError ? (
                  <div className="text-rose-300">{resumesError}</div>
                ) : resumes.length === 0 ? (
                  <div className="text-white/60">No resumes yet.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {resumes.map((r) => (
                      <div key={r.resume_id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="mb-1 text-sm font-medium text-white/90">
                          {r.resume_name || "Resume"} #{r.resume_id}
                        </div>
                        <a href={r.resume_url} target="_blank" rel="noreferrer" className="truncate text-xs text-blue-300 hover:underline">
                          {r.resume_url}
          </a>
        </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        ) : null}

        {activeTab === "applications" ? (
          <section>
            <SectionHeader
              title="Applications"
              subtitle={token ? "Track your application statuses." : "Sign in to view applications."}
            />
            {!token ? (
              <div className="text-white/60">Authentication required.</div>
            ) : applicationsLoading ? (
              <div className="text-white/70">Loading applications…</div>
            ) : applicationsError ? (
              <div className="text-rose-300">{applicationsError}</div>
            ) : applications.length === 0 ? (
              <div className="text-white/60">No applications yet.</div>
            ) : (
              <div className="space-y-3">
                {applications.map((a) => (
                  <div key={a.application_id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-white/90">
                        {a.company_name}
                      </div>
                      <div
                        className={cx(
                          "rounded-full px-2.5 py-1 text-xs",
                          a.status === "applied" && "bg-white/10 text-white/80",
                          a.status === "reviewing" && "bg-blue-500/20 text-blue-200",
                          a.status === "interviewing" && "bg-amber-500/20 text-amber-200",
                          a.status === "rejected" && "bg-rose-500/20 text-rose-200",
                          a.status === "hired" && "bg-emerald-500/20 text-emerald-200"
                        )}
                      >
                        {a.status}
                      </div>
                    </div>
                    <div className="text-sm text-white/70 line-clamp-2">{a.job_description}</div>
                    <div className="mt-2 text-xs text-white/50">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "admin" ? (
          <section>
            <SectionHeader
              title="Company Admin"
              subtitle={token ? "Post roles and review applications for your company." : "Sign in to manage roles and applications."}
            />
            {!token ? (
              <div className="text-white/60">Authentication required.</div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex gap-2">
                  {(["postRole", "reviewApps"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setAdminTab(t)}
                      className={cx(
                        "rounded-full border px-3 py-1.5 text-sm transition",
                        adminTab === t
                          ? "border-transparent bg-white/15 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {t === "postRole" ? "Post Role" : "Review Applications"}
                    </button>
                  ))}
                </div>

                {adminTab === "postRole" ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!token) return;
                      if (!postRoleForm.job_description) {
                        return showToast("Description required");
                      }
                      setPostSubmitting(true);
                      try {
                        await apiFetch(
                          "/api/roles",
                          {
                            method: "POST",
                            body: JSON.stringify({
                              job_description: postRoleForm.job_description,
                              pay: postRoleForm.pay || null,
                              location: postRoleForm.location || null,
                              start_date: postRoleForm.start_date || null,
                              application_end_date: postRoleForm.application_end_date || null,
                              hours_per_week: postRoleForm.hours_per_week ? Number(postRoleForm.hours_per_week) : null,
                            }),
                          },
                          true
                        );
                        showToast("Role posted");
                        setPostRoleForm({
                          job_description: "",
                          pay: "",
                          location: "",
                          start_date: "",
                          application_end_date: "",
                          hours_per_week: "",
                        });
                      } catch (err) {
                        showToast("Failed to post role");
                      } finally {
                        setPostSubmitting(false);
                      }
                    }}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    {/* Company inferred from token; no selection */}
                    <input
                      placeholder="Location"
                      value={postRoleForm.location}
                      onChange={(e) => setPostRoleForm({ ...postRoleForm, location: e.target.value })}
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    />
                    <input
                      placeholder="Pay (e.g. $120k-$150k)"
                      value={postRoleForm.pay}
                      onChange={(e) => setPostRoleForm({ ...postRoleForm, pay: e.target.value })}
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    />
                    <input
                      type="date"
                      placeholder="Start date"
                      value={postRoleForm.start_date}
                      onChange={(e) => setPostRoleForm({ ...postRoleForm, start_date: e.target.value })}
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    />
                    <input
                      type="date"
                      placeholder="Application end date"
                      value={postRoleForm.application_end_date}
                      onChange={(e) => setPostRoleForm({ ...postRoleForm, application_end_date: e.target.value })}
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Hours per week"
                      value={postRoleForm.hours_per_week}
                      onChange={(e) => setPostRoleForm({ ...postRoleForm, hours_per_week: e.target.value })}
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    />
                    <textarea
                      placeholder="Job description"
                      value={postRoleForm.job_description}
                      onChange={(e) => setPostRoleForm({ ...postRoleForm, job_description: e.target.value })}
                      className="sm:col-span-2 h-28 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    />
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={postSubmitting}
                        className={cx(
                          "rounded-md bg-gradient-to-r from-blue-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold",
                          postSubmitting ? "opacity-60" : "hover:brightness-110"
                        )}
                      >
                        {postSubmitting ? "Posting…" : "Post Role"}
                      </button>
                    </div>
                  </form>
                ) : null}

                {adminTab === "reviewApps" ? (
                  <div className="mt-4">
                    <div className="mb-3 flex gap-2">
                      <button
                        onClick={async () => {
                          setCompanyAppsLoading(true);
                          setCompanyAppsError(null);
                          try {
                            const data = await apiFetch<CompanyApplication[]>(
                              `/api/applications/company/${(jwtDecode(token!) as any).company_id}`,
                              {},
                              true
                            );
                            setCompanyApps(data);
                          } catch (err) {
                            setCompanyAppsError("Failed to load applications");
                          } finally {
                            setCompanyAppsLoading(false);
                          }
                        }}
                        className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                      >
                        Load
                      </button>
                    </div>

                    <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="mb-2 text-xs text-white/70">Update Company Profile</div>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = new FormData(e.currentTarget as HTMLFormElement);
                          const name = String(form.get("name") || "").trim() || undefined;
                          const location = String(form.get("location") || "").trim() || undefined;
                          const linkedin_url = String(form.get("linkedin_url") || "").trim() || undefined;
                          try {
                            await apiFetch(
                              `/api/companies/me`,
                              { method: "PATCH", body: JSON.stringify({ name, location, linkedin_url }) },
                              true
                            );
                            showToast("Company updated");
                          } catch {
                            showToast("Update failed");
                          }
                        }}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                      >
                        <input name="name" placeholder="Name" className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none" />
                        <input name="location" placeholder="Location" className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none" />
                        <input name="linkedin_url" placeholder="Contact/LinkedIn" className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none" />
                        <div className="sm:col-span-3 flex justify-end">
                          <button type="submit" className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/15">Save</button>
                        </div>
                      </form>
                    </div>

                    {companyAppsLoading ? (
                      <div className="text-white/70">Loading…</div>
                    ) : companyAppsError ? (
                      <div className="text-rose-300">{companyAppsError}</div>
                    ) : companyApps.length === 0 ? (
                      <div className="text-white/60">No applications.</div>
                    ) : (
                      <div className="space-y-3">
                        {companyApps.map((a) => (
                          <div key={a.application_id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                              <div className="text-sm font-medium text-white/90">
                                {a.user_name} <span className="text-white/50">({a.user_email})</span>
                              </div>
                              <div className="text-xs text-white/60">{new Date(a.created_at).toLocaleString()}</div>
                            </div>
                            <div className="mb-2 text-sm text-white/70 line-clamp-2">{a.job_description}</div>
                            <div className="flex items-center gap-2">
                              <select
                                value={a.status}
                                onChange={async (e) => {
                                  const next = e.target.value as CompanyApplication["status"];
                                  try {
                                    await apiFetch(
                                      `/api/applications/${a.application_id}/status`,
                                      {
                                        method: "PATCH",
                                        body: JSON.stringify({ status: next }),
                                      },
                                      true
                                    );
                                    setCompanyApps((prev) => prev.map((x) => (x.application_id === a.application_id ? { ...x, status: next } : x)));
                                  } catch (err) {
                                    showToast("Failed to update status");
                                  }
                                }}
                                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs"
                              >
                                {["applied", "reviewing", "interviewing", "rejected", "hired"].map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <a
                                href="#"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  window.open(`/api/resume/${a.resume_id}`, "_blank");
                                }}
                                className="text-xs text-blue-300 hover:underline"
                              >
                                View resume #{a.resume_id}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </section>
        ) : null}
      </main>

      {applyOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-black/80 p-5 shadow-[0_0_60px_rgba(59,130,246,0.25)]">
            <div className="mb-4 text-base font-semibold text-white/90">Apply to {applyRole?.company_name}</div>
            {!token ? (
              <div className="text-white/70">Sign in to apply.</div>
            ) : resumesLoading ? (
              <div className="text-white/70">Loading resumes…</div>
            ) : resumes.length === 0 ? (
              <div className="text-white/70">Add a resume first.</div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm text-white/80">Choose resume</label>
                <select
                  value={selectedResumeId ?? undefined}
                  onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
                >
                  {resumes.map((r) => (
                    <option key={r.resume_id} value={r.resume_id}>
                      {(r.resume_name || "Resume")} #{r.resume_id}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setApplyOpen(false)}
                className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitApplication}
                disabled={!token || !selectedResumeId || applySubmitting}
                className={cx(
                  "rounded-md px-3 py-2 text-sm font-semibold transition",
                  "bg-gradient-to-r from-emerald-500 to-blue-500 text-white",
                  applySubmitting ? "opacity-60" : "hover:brightness-110"
                )}
              >
                {applySubmitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 transform rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90 shadow-lg backdrop-blur">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
