import { ArrowUpRight } from "lucide-react";

export default function MetricCard({ title, value, subtitle, icon: Icon, accent = "var(--accent)" }) {
  return (
    <div className="panel relative overflow-hidden p-5">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">{title}</p>
          <p className="mt-3 text-3xl font-bold text-[var(--ink)]">{value}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white/85 p-3">
          {Icon ? <Icon size={20} style={{ color: accent }} /> : <ArrowUpRight size={20} />}
        </div>
      </div>
    </div>
  );
}
