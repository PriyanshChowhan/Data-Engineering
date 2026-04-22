import { formatCompactCurrency, formatNumber } from "../../utils/formatters";

export default function CustomTooltip({ active, payload, label, currency = false }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/95 px-4 py-3 shadow-lg">
      {label !== undefined ? <p className="text-sm font-semibold text-[var(--ink)]">{label}</p> : null}
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <p key={entry.dataKey} className="text-sm text-[var(--muted)]">
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.name || entry.dataKey}:
            </span>{" "}
            {currency ? formatCompactCurrency(entry.value) : formatNumber(entry.value)}
          </p>
        ))}
      </div>
    </div>
  );
}
