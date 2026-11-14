import { Files, MessageSquarePlus, Moon, Plus, Settings2, Sparkles, LogOut, Sun, ChevronUp } from "lucide-react";
import { Popover, PopoverClose, PopoverContent, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover";
import type { Report, User } from "@contracts/types";
import { useTheme } from "@/hooks/useTheme";
import { Jim } from "./Jim";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function WorkspaceSidebar({ reports, currentId, isLibrary = false, usage, user, onNew, onLibrary, onSelect, onSettings, onLogout }: {
  reports: Report[];
  currentId?: number;
  isLibrary?: boolean;
  usage: { used: number; limit: number; daysRemaining: number };
  user: User;
  onNew: () => void;
  onLibrary: () => void;
  onSelect: (id: number) => void;
  onSettings: () => void;
  onLogout: () => void;
}) {
  const isChatActive = !isLibrary && !currentId;
  const { theme, toggleTheme } = useTheme();
  return (
    <aside className="workspace-sidebar">
      <div className="sidebar-brand"><Jim size="tiny" /><span>jimvis</span><span className="beta-tag">BETA</span></div>
      <button className="new-report-button" type="button" onClick={onNew}><Plus size={18} aria-hidden="true" />New report<span>{isMac ? "⌘ N" : "Ctrl N"}</span></button>
      <nav className="sidebar-nav" aria-label="Workspace">
        <button type="button" className={isChatActive ? "is-active" : ""} aria-current={isChatActive ? "page" : undefined} onClick={onNew}><MessageSquarePlus size={17} aria-hidden="true" />Chat with Jim</button>
        <button type="button" className={isLibrary ? "is-active" : ""} aria-current={isLibrary ? "page" : undefined} onClick={onLibrary}><Files size={17} aria-hidden="true" />Report library<span>{reports.length}</span></button>
      </nav>
      <div className="recent-block">
        <div className="sidebar-label"><span>Recent thinking</span><Sparkles size={13} aria-hidden="true" /></div>
        <div className="recent-list">
          {reports.length === 0 ? <p className="recent-empty">Your first report will appear here.</p> : reports.slice(0, 5).map((report) => (
            <button type="button" key={report.id} className={`recent-report ${currentId === report.id ? "is-active" : ""}`} onClick={() => onSelect(report.id)}>
              <i aria-hidden="true" />
              <span><strong>{report.title}</strong><small>{report.category} · {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(report.createdAt)}</small></span>
            </button>
          ))}
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="trial-meter">
          <div><span>Free trial</span><strong>{Math.max(0, usage.limit - usage.used)} reports left</strong></div>
          <div className="trial-track"><i style={{ transform: `scaleX(${Math.min(1, usage.used / usage.limit)})` }} /></div>
          <small>{usage.daysRemaining} days to explore. No card required.</small>
        </div>
        <Popover>
          <PopoverTrigger className="account-trigger">
            <span className="account-avatar">{user.name?.slice(0, 1).toUpperCase() ?? "A"}</span>
            <span><strong>{user.name ?? "Your workspace"}</strong><small>Personal workspace</small></span>
            <ChevronUp size={15} aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent side="top" align="start" sideOffset={10} className="account-menu">
            <PopoverTitle>{user.email ?? "Project Jimvis account"}</PopoverTitle>
            <PopoverClose className="account-menu__item" onClick={onSettings}><Settings2 size={16} />Workspace settings</PopoverClose>
            <PopoverClose className="account-menu__item" onClick={toggleTheme}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}{theme === "dark" ? "Light mode" : "Dark mode"}</PopoverClose>
            <PopoverClose className="account-menu__item" onClick={onLogout}><LogOut size={16} />Sign out</PopoverClose>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
}
