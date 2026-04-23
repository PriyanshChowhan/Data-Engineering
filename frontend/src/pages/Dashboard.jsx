import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChartColumnIncreasing,
  ChevronDown,
  ChevronUp,
  Wrench
} from "lucide-react";
import { dashboardApi, queriesApi } from "../api";
import MetricCard from "../components/MetricCard";
import { formatNumber } from "../utils/formatters";

const buildInsightSummary = (insight) => {
  const firstResult = insight.results?.find((item) => item && !item.operation);

  switch (insight.query_id) {
    case "Q1":
      return `${insight.result_count} properties in Mumbai or Delhi priced under ₹2Cr with 3+ bedrooms and over 10% appreciation — still available.`;
    case "Q2":
      return `${insight.result_count} properties match the keywords "luxury", "furnished", and "premium".`;
    case "Q3":
      return `${insight.result_count} market areas recorded a single month with both avg rent above ₹65k and over 65 transactions.`;
    case "Q4":
      return `${insight.result_count} apartments and villas are currently available across Mumbai, Bangalore, Hyderabad, and Pune.`;
    case "Q5":
      return `${insight.result_count} market segments saw strong summer demand — a month between Apr–Jun with avg rent above ₹55k and 70+ transactions.`;
    case "Q6":
      return `${insight.result_count} available villas under ₹3Cr carry a premium view or investment tag (excluding resale) and hold a 4+ rating.`;
    default:
      return "Helpful insight summary goes here.";
  }
};

function InsightCard({ insight }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
      <p className="text-base font-semibold leading-7 text-[var(--ink)]">
        {buildInsightSummary(insight)}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)]"
        >
          Query used
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <pre className="mt-4 overflow-x-auto rounded-[20px] bg-[rgba(15,23,42,0.96)] p-4 font-mono text-xs leading-6 text-slate-100">
          {insight.mongo_query_string}
        </pre>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, insightsResponse] = await Promise.all([
        dashboardApi.getStats(),
        queriesApi.insights()
      ]);
      setStats(statsResponse);
      setInsights(insightsResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="skeleton h-36" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-40" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-56" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-lg font-semibold text-rose-700">{error}</p>
        <button type="button" onClick={loadDashboard} className="button-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Portfolio Command Center</p>
            <h2 className="mt-2 font-display text-4xl text-[var(--ink)]">
              Stay close to what matters across pricing, appreciation, and portfolio health.
            </h2>
          </div>
          <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(15,23,42,0.02)] px-5 py-4 text-sm text-[var(--muted)]">
            <p className="font-semibold text-[var(--ink)]">Portfolio at a glance</p>
            <p className="mt-1">
              {stats.total_properties} properties tracked
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Total Properties"
          value={formatNumber(stats.total_properties)}
          subtitle={`${stats.available} currently available`}
          icon={Building2}
          accent="#b96a41"
        />
        <MetricCard
          title="Avg Appreciation"
          value={`${stats.avg_appreciation}%`}
          subtitle={`${stats.sold} sold properties recorded`}
          icon={ChartColumnIncreasing}
          accent="#93544a"
        />
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Portfolio Intelligence</p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
            Useful findings for your real estate strategy, based on the latest data across your portfolio.
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((insight) => (
            <InsightCard key={`${insight.query_name}-${insight.result_count}`} insight={insight} />
          ))}
        </div>
      </section>
    </div>
  );
}
