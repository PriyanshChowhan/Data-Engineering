import { useEffect, useMemo, useState } from "react";
import { Check, Database, Play, RotateCcw, Sparkles } from "lucide-react";
import { propertiesApi } from "../api";
import CodeBlock from "../components/CodeBlock";
import PropertyCard from "../components/PropertyCard";
import { amenities, cities, propertyStatuses, propertyTypes } from "../constants/options";
import { formatCompactCurrency } from "../utils/formatters";

const budgetOptions = [
  { label: "50L", value: 5000000 },
  { label: "1Cr", value: 10000000 },
  { label: "2Cr", value: 20000000 },
  { label: "3Cr", value: 30000000 },
  { label: "5Cr", value: 50000000 }
];

const bedroomOptions = [1, 2, 3, 4, 5];

const featuredFilters = {
  city: ["Mumbai", "Delhi"],
  type: [],
  status: [],
  maxPrice: 20000000,
  minBedrooms: 3,
  amenities: []
};

const emptyFilters = {
  city: [],
  type: [],
  status: [],
  maxPrice: null,
  minBedrooms: null,
  amenities: []
};

const presetQueries = [
  {
    id: "metro-budget",
    label: "Metro value hunt",
    description: "Mumbai + Delhi under 2Cr with 3+ bedrooms",
    filters: featuredFilters
  },
  {
    id: "ready-rent",
    label: "Ready-to-rent",
    description: "Available apartments with parking and security",
    filters: {
      city: [],
      type: ["apartment"],
      status: ["available"],
      maxPrice: 30000000,
      minBedrooms: 2,
      amenities: ["parking", "security"]
    }
  },
  {
    id: "family-villas",
    label: "Family villas",
    description: "Bangalore + Pune villas with 4+ bedrooms",
    filters: {
      city: ["Bangalore", "Pune"],
      type: ["villa"],
      status: [],
      maxPrice: null,
      minBedrooms: 4,
      amenities: []
    }
  }
];

const cloneFilters = (filters) => ({
  city: [...filters.city],
  type: [...filters.type],
  status: [...filters.status],
  maxPrice: filters.maxPrice,
  minBedrooms: filters.minBedrooms,
  amenities: [...filters.amenities]
});

const buildHeadline = (filters) => {
  const parts = [];

  if (filters.city.length > 0) {
    parts.push(filters.city.join(" or "));
  }

  if (filters.type.length > 0) {
    parts.push(filters.type.join(" / "));
  } else {
    parts.push("properties");
  }

  if (filters.maxPrice) {
    parts.push(`under ${formatCompactCurrency(filters.maxPrice)}`);
  }

  if (filters.minBedrooms) {
    parts.push(`with ${filters.minBedrooms}+ bedrooms`);
  }

  if (filters.status.length > 0) {
    parts.push(`status: ${filters.status.join(", ")}`);
  }

  if (filters.amenities.length > 0) {
    parts.push(`including ${filters.amenities.join(", ")}`);
  }

  return parts.join(" ");
};

const filterCount = (filters) =>
  filters.city.length +
  filters.type.length +
  filters.status.length +
  filters.amenities.length +
  Number(Boolean(filters.maxPrice)) +
  Number(Boolean(filters.minBedrooms));

const SelectionGroup = ({ title, items, selected, onToggle, formatter }) => (
  <div>
    <p className="mb-3 text-sm font-semibold text-[var(--ink)]">{title}</p>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const value = typeof item === "string" ? item : item.value;
        const label = formatter ? formatter(item) : typeof item === "string" ? item : item.label;
        const active = selected.includes(value);

        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
              active
                ? "border-[var(--accent)] bg-[rgba(213,121,75,0.14)] text-[var(--accent-strong)]"
                : "border-[var(--line)] bg-white/80 text-[var(--ink)] hover:border-[var(--accent)]"
            }`}
          >
            {active ? <Check size={14} /> : null}
            {label}
          </button>
        );
      })}
    </div>
  </div>
);

export default function Properties() {
  const [draftFilters, setDraftFilters] = useState(cloneFilters(featuredFilters));
  const [appliedFilters, setAppliedFilters] = useState(cloneFilters(featuredFilters));
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState({
    data: [],
    pagination: null,
    mongo_query_string: "",
    execution_time_ms: 0,
    result_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit: 12,
      city: appliedFilters.city.join(",") || undefined,
      type: appliedFilters.type.join(",") || undefined,
      status: appliedFilters.status.join(",") || undefined,
      maxPrice: appliedFilters.maxPrice || undefined,
      minBedrooms: appliedFilters.minBedrooms || undefined,
      amenities: appliedFilters.amenities.join(",") || undefined
    }),
    [appliedFilters, page]
  );

  const loadProperties = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await propertiesApi.list(params);
      setResponse(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to run the property query.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [params]);

  const toggleMultiSelect = (key, value) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value]
    }));
  };

  const runQuery = () => {
    setPage(1);
    setAppliedFilters(cloneFilters(draftFilters));
  };

  const clearFilters = () => {
    const cleared = cloneFilters(emptyFilters);
    setDraftFilters(cleared);
    setPage(1);
    setAppliedFilters(cleared);
  };

  const applyPreset = (filters) => {
    const next = cloneFilters(filters);
    setDraftFilters(next);
    setPage(1);
    setAppliedFilters(next);
  };

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="eyebrow">Live Query Explorer</p>
            <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">
              Pick filters, run the query, and see both the exact statement and the matching
              properties together.
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Start with values like Mumbai, Delhi, or 2Cr, then run the query to inspect the
              executed filter and browse the result set below.
            </p>
          </div>

          <div className="rounded-[28px] bg-[linear-gradient(135deg,_rgba(213,121,75,0.18),_rgba(14,116,144,0.16))] px-5 py-4 text-sm text-[var(--ink)]">
            <p className="font-semibold">Current query</p>
            <p className="mt-2 max-w-sm leading-6 text-[var(--muted)]">
              {buildHeadline(appliedFilters)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {presetQueries.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.filters)}
              className="rounded-[24px] border border-[var(--line)] bg-white/72 p-4 text-left transition hover:bg-white"
            >
              <p className="text-sm font-semibold text-[var(--ink)]">{preset.label}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{preset.description}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="panel h-fit p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[rgba(213,121,75,0.12)] p-3 text-[var(--accent-strong)]">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="eyebrow">Filter Builder</p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">
                Build a property query with checkboxes
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <SelectionGroup
              title="Cities"
              items={cities}
              selected={draftFilters.city}
              onToggle={(value) => toggleMultiSelect("city", value)}
            />

            <SelectionGroup
              title="Property Type"
              items={propertyTypes}
              selected={draftFilters.type}
              onToggle={(value) => toggleMultiSelect("type", value)}
              formatter={(value) => value}
            />

            <SelectionGroup
              title="Status"
              items={propertyStatuses}
              selected={draftFilters.status}
              onToggle={(value) => toggleMultiSelect("status", value)}
              formatter={(value) => value.replaceAll("_", " ")}
            />

            <div>
              <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Max Budget</p>
              <div className="flex flex-wrap gap-2">
                {budgetOptions.map((option) => {
                  const active = draftFilters.maxPrice === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDraftFilters((current) => ({
                          ...current,
                          maxPrice: current.maxPrice === option.value ? null : option.value
                        }))
                      }
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-[var(--teal)] bg-[rgba(14,116,144,0.12)] text-[var(--teal)]"
                          : "border-[var(--line)] bg-white/80 text-[var(--ink)] hover:border-[var(--teal)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Minimum Bedrooms</p>
              <div className="flex flex-wrap gap-2">
                {bedroomOptions.map((value) => {
                  const active = draftFilters.minBedrooms === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setDraftFilters((current) => ({
                          ...current,
                          minBedrooms: current.minBedrooms === value ? null : value
                        }))
                      }
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-[var(--olive)] bg-[rgba(77,107,63,0.14)] text-[var(--olive)]"
                          : "border-[var(--line)] bg-white/80 text-[var(--ink)] hover:border-[var(--olive)]"
                      }`}
                    >
                      {value}+ beds
                    </button>
                  );
                })}
              </div>
            </div>

            <SelectionGroup
              title="Amenities"
              items={amenities}
              selected={draftFilters.amenities}
              onToggle={(value) => toggleMultiSelect("amenities", value)}
              formatter={(value) => value.replaceAll("_", " ")}
            />

            <div className="rounded-[24px] border border-[var(--line)] bg-white/70 p-4 text-sm text-[var(--muted)]">
              {filterCount(draftFilters)} filters selected
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={runQuery} className="button-primary flex-1">
                <Play size={16} className="mr-2" />
                Run Query
              </button>
              <button type="button" onClick={clearFilters} className="button-secondary">
                <RotateCcw size={16} className="mr-2" />
                Clear
              </button>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[rgba(14,116,144,0.12)] p-3 text-[var(--teal)]">
                    <Database size={18} />
                  </div>
                  <div>
                    <p className="eyebrow">Executed Query</p>
                    <h2 className="mt-1 text-2xl font-semibold text-[var(--ink)]">
                      {buildHeadline(appliedFilters)}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="stat-chip">{response.result_count || 0} matches</span>
                <span className="stat-chip">{response.execution_time_ms || 0}ms</span>
                <span className="stat-chip">
                  Page {response.pagination?.page || 1} / {response.pagination?.totalPages || 1}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              The statement below reflects the filters currently applied to the results grid.
            </p>
          </div>

          <CodeBlock code={response.mongo_query_string || 'db.properties.find({})'} />

          {error ? (
            <div className="panel p-10 text-center">
              <p className="text-lg font-semibold text-rose-700">{error}</p>
              <button type="button" onClick={loadProperties} className="button-primary mt-4">
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="skeleton h-72" />
              ))}
            </div>
          ) : (
            <>
              {response.data.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {response.data.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="panel p-10 text-center text-[var(--muted)]">
                  No properties matched this query. Try broadening the city, budget, or bedroom
                  filters and run it again.
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[var(--line)] bg-white/65 px-5 py-4">
                <p className="text-sm text-[var(--muted)]">
                  Showing {response.data.length} properties on this page
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    disabled={page === 1}
                    className="button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(current + 1, response.pagination?.totalPages || current)
                      )
                    }
                    disabled={page >= (response.pagination?.totalPages || 1)}
                    className="button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
