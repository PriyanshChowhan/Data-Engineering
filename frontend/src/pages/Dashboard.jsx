import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChartColumnIncreasing,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  KeyRound,
  Wrench
} from "lucide-react";
import { dashboardApi, queriesApi } from "../api";
import MetricCard from "../components/MetricCard";
import { formatCompactCurrency, formatNumber } from "../utils/formatters";

const conceptLabels = {
  Q1: "Opportunity Filter",
  Q2: "Metro Availability",
  Q8: "Text Search",
  Q18: "High Appreciation",
  Q19: "Maintenance Risk",
  Q20: "Market Strength",
  Q9: "Budget Watch"
};

const buildInsightSummary = (insight) => {
  const firstResult = insight.results?.find((item) => item && !item.operation);

  switch (insight.query_id) {
    case "Q1":
      return `${insight.result_count} premium unsold opportunities in Mumbai or Delhi below Rs 2Cr with 3+ bedrooms.`;
    case "Q2":
      return `${insight.result_count} apartments and villas remain available across the top metro shortlist.`;
    case "Q8":
      return `${insight.result_count} furnished premium listings surfaced by keyword relevance.`;
    case "Q18":
      if (firstResult?.location?.city) {
        return `High-ROI shortlist led by ${firstResult.location.city}, with ${firstResult.investment_details?.appreciation_percent}% appreciation at the top.`;
      }
      return `${insight.result_count} high-ROI available apartments identified across major cities.`;
    case "Q19":
      return `${insight.result_count} rentals currently show unresolved high-priority maintenance above Rs 3,000.`;
    case "Q20":
      if (firstResult?.city) {
        return `${insight.result_count} premium market zones meet both yield and rent-threshold conditions, led by ${firstResult.city}.`;
      }
      return `${insight.result_count} premium market zones qualify on both yield and rent activity.`;
    case "Q9":
      return `${insight.result_count} under-maintenance properties would receive a renovation budget uplift if actioned today.`;
    default:
      return insight.description;
  }
};

const buildInsightSubtext = (insight) => {
  const firstResult = insight.results?.find((item) => item && !item.operation);

  switch (insight.query_id) {
    case "Q2":
      return firstResult?.title || "Metro-ready inventory";
    case "Q18":
      return firstResult?.title || "Available apartment shortlist";
    case "Q19":
      return "Pending operational risk across the active rental base";
    case "Q20":
      return firstResult ? `${firstResult.area}, ${firstResult.city}` : "Premium demand pockets";
    case "Q8":
      return firstResult?.title || "Keyword-ranked discovery set";
    case "Q9":
      return "Operational budget scenario";
    default:
      return insight.query_name;
  }
};

function InsightCard({ insight }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-[rgba(15,23,42,0.04)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
            {conceptLabels[insight.query_id] || "Portfolio Insight"}
          </span>
          <p className="mt-4 text-base font-semibold leading-7 text-[var(--ink)]">
            {buildInsightSummary(insight)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">{buildInsightSubtext(insight)}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4">
        <span className="rounded-full bg-[rgba(14,116,144,0.08)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
          {insight.result_count} results
        </span>
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

  const snapshotCards = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        title: "Available Inventory",
        value: formatNumber(stats.available),
        subtitle: "Ready for immediate review",
        icon: Building2
      },
      {
        title: "Rented Properties",
        value: formatNumber(stats.rented),
        subtitle: "Income-generating assets",
        icon: KeyRound
      },
      {
        title: "Open Maintenance",
        value: formatNumber(stats.open_maintenance_requests),
        subtitle: "Operational items needing attention",
        icon: Wrench
      },
      {
        title: "Average Rent",
        value: formatCompactCurrency(stats.avg_rent),
        subtitle: "Portfolio-wide monthly baseline",
        icon: IndianRupee
      },
      {
        title: "Under Maintenance",
        value: formatNumber(stats.under_maintenance),
        subtitle: "Assets in active upkeep",
        icon: Wrench
      },
      {
        title: "Sold",
        value: formatNumber(stats.sold),
        subtitle: "Completed exits on record",
        icon: ChartColumnIncreasing
      }
    ];
  }, [stats]);

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-36" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-40" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 7 }).map((_, index) => (
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
              Stay close to what matters across pricing, income, and portfolio risk.
            </h2>
          </div>
          <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(15,23,42,0.02)] px-5 py-4 text-sm text-[var(--muted)]">
            <p className="font-semibold text-[var(--ink)]">Portfolio at a glance</p>
            <p className="mt-1">
              {stats.total_properties} properties | {stats.active_rentals} active rentals
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Properties"
          value={formatNumber(stats.total_properties)}
          subtitle={`${stats.available} currently available`}
          icon={Building2}
          accent="#b96a41"
        />
        <MetricCard
          title="Active Rentals"
          value={formatNumber(stats.active_rentals)}
          subtitle={`${stats.rented} properties marked rented`}
          icon={KeyRound}
          accent="#336b75"
        />
        <MetricCard
          title="Monthly Income"
          value={formatCompactCurrency(stats.total_monthly_income)}
          subtitle={`Average rent ${formatCompactCurrency(stats.avg_rent)}`}
          icon={IndianRupee}
          accent="#627652"
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
          <p className="eyebrow">Portfolio Snapshot</p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
            Quiet, useful numbers for the day-to-day view
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshotCards.map((item) => (
            <div key={item.title} className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--muted)]">{item.title}</p>
                <div className="rounded-2xl bg-[rgba(15,23,42,0.04)] p-3 text-[var(--ink)]">
                  <item.icon size={18} />
                </div>
              </div>
              <p className="mt-5 text-3xl font-bold text-[var(--ink)]">{item.value}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Portfolio Intelligence</p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
            Useful findings surfaced from the same queries driving the app
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
