import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, ArrowRight, Bookmark, FileText, Library, Menu, Plus, Search, Settings2, Sparkles, X, Zap } from "lucide-react";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@ui-sdk/react/dialog";
import { toast } from "@ui-sdk/react/toast";
import type { ReportKind } from "@contracts/report";
import { PROMPT_EXAMPLES } from "@contracts/report";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Composer } from "@/components/Composer";
import { Jim } from "@/components/Jim";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";

const ReportView = lazy(() => import("@/components/ReportView").then((module) => ({ default: module.ReportView })));

const generationSteps = [
  { title: "Reading between the lines", detail: "Jim is framing the decision behind your question." },
  { title: "Mapping commercial signals", detail: "Connecting growth, behavior, and operating context." },
  { title: "Building the evidence", detail: "Comparing patterns and pressure-testing the story." },
  { title: "Giving the brief some polish", detail: "Turning analysis into something you can act on." },
];

const WELCOME_NOTES = [
  "Curious. Precise.\nSlightly obsessed with your business.",
  "Poke me anytime.\nOr drop a messy growth question below.",
  "I turn hunches into\ndecision-ready briefs.",
  "Revenue, retention, or new markets —\npick a thread.",
];

function GenerationView({ prompt, step }: { prompt: string; step: number }) {
  return (
    <motion.div className="generation-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
      <div className="generation-question"><span>YOUR BRIEF</span><p>{prompt}</p></div>
      <div className="generation-center">
        <div className="thinking-space"><span className="thinking-ring thinking-ring--one" /><span className="thinking-ring thinking-ring--two" /><Jim size="large" mood="thinking" /></div>
        <AnimatePresence mode="wait">
          <motion.div key={step} className="generation-copy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <span className="section-label">JIM IS THINKING · 0{step + 1}/04</span>
            <h1>{generationSteps[step].title}</h1>
            <p>{generationSteps[step].detail}</p>
          </motion.div>
        </AnimatePresence>
        <div className="generation-progress">{generationSteps.map((_, index) => <i key={index} className={index <= step ? "is-active" : ""} />)}</div>
      </div>
      <div className="generation-skeleton" aria-hidden="true"><i /><i /><i /><div><span /><span /><span /><span /><span /></div></div>
    </motion.div>
  );
}

function Welcome({ name, isListening, reports, onPrompt, onOpen }: { name: string; isListening: boolean; reports: { id: number; title: string; category: string }[]; onPrompt: (prompt: string) => void; onOpen: (id: number) => void }) {
  const firstName = name.split(" ")[0] || "there";
  const reduceMotion = useReducedMotion();
  const [noteIdx, setNoteIdx] = useState(0);
  const noteText = isListening ? "Listening closely.\nHit Enter whenever it’s ready." : WELCOME_NOTES[noteIdx];
  return (
    <div className="welcome-view">
      <motion.div className="welcome-hero" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div className="welcome-jim">
          <Jim
            size="large"
            mood={isListening ? "listening" : "idle"}
            interactive
            onPoke={() => setNoteIdx((current) => (current + 1) % WELCOME_NOTES.length)}
          />
          <span className="jim-note">{noteText}</span>
        </div>
        <span className="section-label">YOUR AI BUSINESS ANALYST</span>
        <h1>What are we figuring out, {firstName}?</h1>
        <p>Bring Jim a question, a hunch, or a slightly messy business problem.</p>
      </motion.div>
      <div className="prompt-list">
        {PROMPT_EXAMPLES.map((example, index) => (
          <motion.button key={example.label} type="button" onClick={() => onPrompt(example.prompt)} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + index * 0.08 }}>
            <span className="prompt-index">0{index + 1}</span><strong>{example.label}</strong><p>{example.prompt}</p><ArrowRight size={18} aria-hidden="true" />
          </motion.button>
        ))}
      </div>
      {reports.length > 0 && <div className="jump-back"><div className="sidebar-label"><span>Jump back in</span><Zap size={14} /></div><div>{reports.slice(0, 2).map((report) => <button key={report.id} type="button" onClick={() => onOpen(report.id)}><FileText size={17} /><span><strong>{report.title}</strong><small>{report.category} report</small></span><ArrowRight size={16} /></button>)}</div></div>}
    </div>
  );
}

function LibraryView({ reports, onOpen, onNew }: { reports: { id: number; title: string; category: string; summary: string; createdAt: Date; isSaved: boolean }[]; onOpen: (id: number) => void; onNew: () => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "saved">("all");
  const filtered = reports.filter((report) => (filter === "all" || report.isSaved) && `${report.title} ${report.summary}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="library-view">
      <header><span className="section-label">YOUR REPORT LIBRARY</span><h1>Your thinking,<br /><em>easy to find.</em></h1><p>Every brief Jim has prepared for this workspace.</p></header>
      <div className="library-controls">
        <label className="search-field"><Search size={18} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your reports…" aria-label="Search reports" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}</label>
        <div className="filter-control" aria-label="Filter reports"><button type="button" className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>All <span>{reports.length}</span></button><button type="button" className={filter === "saved" ? "is-active" : ""} onClick={() => setFilter("saved")}><Bookmark size={14} />Saved</button></div>
      </div>
      {filtered.length > 0 ? <div className="library-list">{filtered.map((report, index) => <motion.button layout type="button" key={report.id} className="library-row" onClick={() => onOpen(report.id)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}><span className="library-row__index">{String(index + 1).padStart(2, "0")}</span><span className="library-row__main"><span><i>{report.category}</i>{report.isSaved && <Bookmark size={14} fill="currentColor" />}</span><strong>{report.title}</strong><p>{report.summary}</p></span><span className="library-row__date">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(report.createdAt)}</span><ArrowRight size={20} /></motion.button>)}</div> : <div className="library-empty"><Jim size="medium" mood="idle" /><h2>{reports.length === 0 ? "A clean slate. A good sign." : "No reports match that search."}</h2><p>{reports.length === 0 ? "Your first piece of clarity is one good question away." : "Try another phrase, or switch back to all reports."}</p>{reports.length === 0 ? <button className="primary-button" type="button" onClick={onNew}><Plus size={16} />Create your first report</button> : <button className="secondary-action" type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Clear filters</button>}</div>}
    </div>
  );
}

export default function Workspace() {
  const { user, isAuthenticated, isLoading, logout } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [generationStep, setGenerationStep] = useState(0);
  const [createError, setCreateError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const reportsQuery = trpc.report.list.useQuery(undefined, { enabled: isAuthenticated, retry: 1 });
  const createReport = trpc.report.create.useMutation();
  const updateName = trpc.account.updateName.useMutation({
    onSuccess: async () => { await utils.auth.me.invalidate(); setSettingsOpen(false); toast.success("Workspace name updated"); },
    onError: (error) => toast.error(error.message),
  });

  const reports = reportsQuery.data?.items ?? [];
  const usage = reportsQuery.data?.usage ?? { used: 0, limit: 5, daysRemaining: 7 };
  const currentId = reportId ? Number(reportId) : undefined;
  const currentReport = currentId ? reports.find((report) => report.id === currentId) : undefined;
  const isLibrary = location.pathname === "/app/library";

  const openReport = useCallback((id: number) => { setDrawerOpen(false); setCreateError(""); navigate(`/app/report/${id}`); }, [navigate]);
  const newReport = useCallback(() => { setDrawerOpen(false); setCreateError(""); setPrompt(""); navigate("/app"); }, [navigate]);
  const openLibrary = useCallback(() => { setDrawerOpen(false); navigate("/app/library"); }, [navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [location.pathname, creating]);
  useEffect(() => { if (user?.name) setProfileName(user.name); }, [user?.name]);
  useEffect(() => {
    if (!creating) return;
    setGenerationStep(0);
    const timer = window.setInterval(() => setGenerationStep((step) => Math.min(3, step + 1)), 950);
    return () => window.clearInterval(timer);
  }, [creating]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") { event.preventDefault(); newReport(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [newReport]);

  const submitPrompt = async (kind: ReportKind | "auto") => {
    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length < 8 || creating) return;
    if (usage.used >= usage.limit) { setUpgradeOpen(true); return; }
    setCreating(true);
    setPendingPrompt(cleanPrompt);
    setCreateError("");
    setPrompt("");
    const started = Date.now();
    try {
      const created = await createReport.mutateAsync({ prompt: cleanPrompt, kind });
      const remaining = Math.max(0, 3850 - (Date.now() - started));
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
      await utils.report.list.invalidate();
      navigate(`/app/report/${created.id}`);
      toast.success("Your report is ready");
    } catch (error) {
      setPrompt(cleanPrompt);
      setCreateError(error instanceof Error ? error.message : "Jim lost the thread. Please try again.");
      if (error instanceof Error && error.message.includes("five free")) setUpgradeOpen(true);
    } finally {
      setCreating(false);
    }
  };

  const followUp = (nextPrompt: string) => {
    setPrompt(nextPrompt);
    window.setTimeout(() => document.querySelector<HTMLTextAreaElement>(".composer textarea")?.focus(), 50);
  };

  if (isLoading || !user) return <div className="app-loading"><Jim size="medium" mood="thinking" /><span>Opening your workspace…</span></div>;

  const sidebar = <WorkspaceSidebar reports={reports} currentId={currentId} isLibrary={isLibrary} usage={usage} user={user} onNew={newReport} onLibrary={openLibrary} onSelect={openReport} onSettings={() => { setDrawerOpen(false); setSettingsOpen(true); }} onLogout={logout} />;

  return (
    <div className="workspace">
      <div className="desktop-sidebar">{sidebar}</div>
      <AnimatePresence>
        {drawerOpen && <><motion.button className="drawer-backdrop" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /><motion.div className="mobile-drawer" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}><button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation"><X size={20} /></button>{sidebar}</motion.div></>}
      </AnimatePresence>
      <main className="workspace-main">
        <header className="workspace-topbar">
          <button className="mobile-menu-button" type="button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="topbar-context">{isLibrary ? <><Library size={16} /><span>Library</span></> : currentReport ? <><button type="button" onClick={newReport}><ArrowLeft size={15} />Chat</button><span>/</span><strong>{currentReport.title}</strong></> : <><span className="status-pulse" /><strong>Jim is ready</strong></>}</div>
          <button className="topbar-trial" type="button" onClick={() => setUpgradeOpen(true)}><Sparkles size={14} /><span>{Math.max(0, usage.limit - usage.used)} free reports left</span></button>
          <button className="topbar-settings" type="button" onClick={() => setSettingsOpen(true)} aria-label="Workspace settings"><Settings2 size={18} /></button>
        </header>
        <div className="workspace-scroll" ref={scrollRef}>
          {reportsQuery.isLoading ? <div className="content-loading"><Jim size="medium" mood="thinking" /><p>Gathering your previous thinking…</p></div> : reportsQuery.isError ? <div className="content-error"><Jim size="medium" mood="idle" /><h1>Jim lost the connection.</h1><p>Your reports are safe. Try loading this workspace again.</p><button className="primary-button" type="button" onClick={() => reportsQuery.refetch()}>Reconnect</button></div> : <AnimatePresence mode="wait">{creating ? <GenerationView key="generating" prompt={pendingPrompt} step={generationStep} /> : isLibrary ? <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LibraryView reports={reports} onOpen={openReport} onNew={newReport} /></motion.div> : currentReport ? <Suspense key={currentReport.id} fallback={<div className="content-loading"><Jim size="medium" mood="thinking" /><p>Opening your brief…</p></div>}><ReportView key={currentReport.id} report={currentReport} onFollowUp={followUp} /></Suspense> : currentId ? <div className="content-error" key="not-found"><Jim size="medium" /><h1>That brief isn’t here.</h1><p>It may belong to another workspace or no longer exist.</p><button className="primary-button" type="button" onClick={newReport}>Start a new report</button></div> : <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Welcome name={user.name ?? "there"} isListening={prompt.trim().length > 0} reports={reports} onPrompt={(value) => { setPrompt(value); window.setTimeout(() => document.querySelector<HTMLTextAreaElement>(".composer textarea")?.focus(), 30); }} onOpen={openReport} /></motion.div>}</AnimatePresence>}
          {createError && <div className="create-error" role="alert"><span>{createError}</span><button type="button" onClick={() => setCreateError("")} aria-label="Dismiss error"><X size={16} /></button></div>}
        </div>
        {!isLibrary && !creating && !reportsQuery.isLoading && !reportsQuery.isError && <Composer value={prompt} onChange={setPrompt} onSubmit={submitPrompt} disabled={createReport.isPending} compact={!!currentReport} />}
      </main>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogBackdrop className="dialog-backdrop" />
        <DialogContent className="settings-dialog">
          <DialogTitle>Your workspace</DialogTitle>
          <DialogDescription>Make Jim feel a little more like yours.</DialogDescription>
          <form onSubmit={(event) => { event.preventDefault(); updateName.mutate({ name: profileName }); }}>
            <label className="field-label" htmlFor="profile-name">Display name</label>
            <input id="profile-name" className="text-input" value={profileName} onChange={(event) => setProfileName(event.target.value)} minLength={2} maxLength={60} required />
            <div className="settings-plan"><span>Free trial</span><strong>{usage.used} of {usage.limit} reports created</strong><small>{usage.daysRemaining} days remaining · no payment method connected</small></div>
            <div className="dialog-actions"><DialogClose className="secondary-action">Cancel</DialogClose><button className="primary-button" type="submit" disabled={updateName.isPending || profileName.trim().length < 2}>{updateName.isPending ? "Saving…" : "Save changes"}</button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogBackdrop className="dialog-backdrop" />
        <DialogContent className="upgrade-dialog">
          <button className="dialog-x" onClick={() => setUpgradeOpen(false)} aria-label="Close plan details"><X size={18} /></button>
          <Jim size="medium" mood="success" />
          <span className="section-label">JIMVIS PRO</span><DialogTitle>Keep the good questions coming.</DialogTitle><DialogDescription>Pro includes unlimited reports, saved history, interactive analysis, and exports for $24 per person per month.</DialogDescription>
          <div className="upgrade-note">This is a product prototype, so checkout is intentionally not connected.</div>
          <DialogClose className="primary-button">Back to my workspace<ArrowRight size={16} /></DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
