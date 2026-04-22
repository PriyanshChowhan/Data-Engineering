export default function ChartCard({ title, subtitle, children }) {
  return (
    <div className="panel p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      <div className="h-80">{children}</div>
    </div>
  );
}
