import {
  Building2,
  Home,
  Search
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/properties", label: "Property Explorer", icon: Building2 },
  { to: "/search", label: "Text Search", icon: Search }
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm transition lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[rgba(15,23,42,0.06)] bg-[rgba(255,255,255,0.94)] px-5 py-6 text-[var(--ink)] shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
              Daily Workspace
            </p>
            <h2 className="mt-3 font-display text-2xl leading-tight text-[var(--ink)]">
              Real-Estate Tracker
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              A clean workspace for portfolio visibility, property discovery, and quick search.
            </p>
          </div>

          <nav className="mt-8 flex-1 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[rgba(213,121,75,0.12)] text-[var(--accent-strong)]"
                        : "text-[var(--muted)] hover:bg-[rgba(15,23,42,0.03)] hover:text-[var(--ink)]"
                    }`
                  }
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(15,23,42,0.04)]">
                    <Icon size={18} />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
