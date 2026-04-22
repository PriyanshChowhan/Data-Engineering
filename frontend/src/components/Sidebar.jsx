import {
  BarChart3,
  Building2,
  Home,
  Search,
  WalletCards
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/properties", label: "Live Query Explorer", icon: Building2 },
  { to: "/rentals", label: "Rental Tracker", icon: WalletCards },
  { to: "/search", label: "Text Search", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3 }
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
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/20 bg-[linear-gradient(180deg,_rgba(23,32,51,0.97),_rgba(23,32,51,0.92))] px-5 py-6 text-white shadow-2xl transition duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              Portfolio Workspace
            </p>
            <h2 className="mt-3 font-display text-2xl leading-tight text-white">
              Real-Estate Tracker
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Investment analytics, live property discovery, and rental operations in one
              place.
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
                        ? "bg-[rgba(213,121,75,0.22)] text-white"
                        : "text-white/72 hover:bg-white/8 hover:text-white"
                    }`
                  }
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Icon size={18} />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="rounded-[24px] border border-[rgba(255,255,255,0.1)] bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">Market Focus</p>
            <p className="mt-2 text-sm text-white/80">
              Portfolio health, rental flow, pricing signals, and market movement at a glance.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
