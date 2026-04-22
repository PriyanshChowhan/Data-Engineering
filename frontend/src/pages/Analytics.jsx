import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { dashboardApi } from "../api";
import ChartCard from "../components/charts/ChartCard";
import CustomTooltip from "../components/charts/CustomTooltip";
import { formatCompactCurrency } from "../utils/formatters";

const pieColors = ["#0e7490", "#d5794b", "#4d6b3f", "#9f1239"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await dashboardApi.getAnalytics();
      setData(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="skeleton h-[860px]" />;
  }

  if (error) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-lg font-semibold text-rose-700">{error}</p>
        <button type="button" onClick={loadAnalytics} className="button-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <p className="eyebrow">Analytics</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">
          Portfolio-wide trends on appreciation, rent yield, and maintenance load.
        </h1>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="City-wise Average Appreciation" subtitle="Where valuation growth is strongest">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.appreciation_by_city}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="city" tick={{ fill: "#475467", fontSize: 12 }} />
              <YAxis tick={{ fill: "#475467", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_appreciation" fill="#d5794b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Rental Yield by Property Type" subtitle="Grouped view of rent and yield metrics">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.rental_yield_by_type}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="type" tick={{ fill: "#475467", fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fill: "#475467", fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#475467", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="avg_rent" fill="#0e7490" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="yield_percent" fill="#4d6b3f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Price per Sqft by City" subtitle="Horizontal comparison of city-level pricing">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.price_per_sqft_by_city} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fill: "#475467", fontSize: 12 }} />
              <YAxis type="category" dataKey="city" width={92} tick={{ fill: "#475467", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_price_per_sqft" fill="#9f1239" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Maintenance Cost Analysis" subtitle="Open vs resolved vs pending request distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.maintenance_status_breakdown}
                dataKey="total_cost"
                nameKey="status"
                innerRadius={72}
                outerRadius={112}
              >
                {data.maintenance_status_breakdown.map((entry, index) => (
                  <Cell key={entry.status} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip currency />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Top 10 Highest Appreciation Properties</h2>
        </div>
        <div className="overflow-x-auto p-6">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[var(--muted)]">
              <tr>
                <th className="pb-3 font-semibold">Property</th>
                <th className="pb-3 font-semibold">City</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Price</th>
                <th className="pb-3 font-semibold">Appreciation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {data.top_appreciation_properties.map((property) => (
                <tr key={property.property_id}>
                  <td className="py-4">
                    <div className="font-semibold text-[var(--ink)]">{property.title}</div>
                    <div className="text-xs text-[var(--muted)]">{property.property_id}</div>
                  </td>
                  <td className="py-4 text-[var(--muted)]">{property.location.city}</td>
                  <td className="py-4 text-[var(--muted)] capitalize">{property.type}</td>
                  <td className="py-4 text-[var(--muted)]">{formatCompactCurrency(property.price)}</td>
                  <td className="py-4 font-semibold text-[var(--ink)]">
                    {property.investment_details.appreciation_percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
