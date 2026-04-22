import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Building2, ChartColumnIncreasing, IndianRupee, KeyRound } from "lucide-react";
import { dashboardApi } from "../api";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/charts/ChartCard";
import CustomTooltip from "../components/charts/CustomTooltip";
import { formatCompactCurrency, formatNumber } from "../utils/formatters";

const pieColors = ["#d5794b", "#0e7490", "#4d6b3f", "#9f1239", "#7c3aed"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await dashboardApi.getStats();
      setData(response);
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
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="skeleton h-[420px]" />
          <div className="skeleton h-[420px]" />
        </div>
        <div className="skeleton h-[420px]" />
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
      <section className="panel overflow-hidden p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Portfolio Command Center</p>
            <h2 className="mt-2 font-display text-4xl text-[var(--ink)]">
              Measure supply, rent flow, and appreciation across the portfolio.
            </h2>
          </div>
          <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(213,121,75,0.18),_rgba(14,116,144,0.18))] px-5 py-4 text-sm text-[var(--ink)]">
            <p className="font-semibold">Live portfolio metrics</p>
            <p className="mt-1 text-[var(--muted)]">
              Properties: {data.total_properties} | Active rentals: {data.active_rentals}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Properties"
          value={formatNumber(data.total_properties)}
          subtitle={`${data.available} currently available`}
          icon={Building2}
          accent="#d5794b"
        />
        <MetricCard
          title="Active Rentals"
          value={formatNumber(data.active_rentals)}
          subtitle={`${data.rented} properties marked rented`}
          icon={KeyRound}
          accent="#0e7490"
        />
        <MetricCard
          title="Monthly Income"
          value={formatCompactCurrency(data.total_monthly_income)}
          subtitle={`Average rent ${formatCompactCurrency(data.avg_rent)}`}
          icon={IndianRupee}
          accent="#4d6b3f"
        />
        <MetricCard
          title="Avg Appreciation"
          value={`${data.avg_appreciation}%`}
          subtitle={`${data.sold} sold properties recorded`}
          icon={ChartColumnIncreasing}
          accent="#9f1239"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Property Count by City" subtitle="Top portfolio markets by inventory size">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.top_cities}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="city" tick={{ fill: "#475467", fontSize: 12 }} />
              <YAxis tick={{ fill: "#475467", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#d5794b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Property Type Distribution" subtitle="A quick view of the property mix">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.property_type_distribution}
                dataKey="count"
                nameKey="type"
                innerRadius={72}
                outerRadius={112}
                paddingAngle={4}
              >
                {data.property_type_distribution.map((entry, index) => (
                  <Cell key={entry.type} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ChartCard title="Monthly Rental Income" subtitle="Last 12 recorded months from payment history">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthly_rental_income}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: "#475467", fontSize: 12 }} />
              <YAxis tick={{ fill: "#475467", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip currency />} />
              <Line
                type="monotone"
                dataKey="total_income"
                stroke="#0e7490"
                strokeWidth={3}
                dot={{ fill: "#0e7490", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="panel p-6">
          <h3 className="text-lg font-semibold text-[var(--ink)]">Snapshot Stats</h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-[22px] bg-white/80 p-4">
              <p className="text-sm text-[var(--muted)]">Open maintenance requests</p>
              <p className="mt-2 text-2xl font-bold text-[var(--ink)]">
                {formatNumber(data.open_maintenance_requests)}
              </p>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <p className="text-sm text-[var(--muted)]">Properties under maintenance</p>
              <p className="mt-2 text-2xl font-bold text-[var(--ink)]">
                {formatNumber(data.under_maintenance)}
              </p>
            </div>
            <div className="rounded-[22px] bg-white/80 p-4">
              <p className="text-sm text-[var(--muted)]">Average rent</p>
              <p className="mt-2 text-2xl font-bold text-[var(--ink)]">
                {formatCompactCurrency(data.avg_rent)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
