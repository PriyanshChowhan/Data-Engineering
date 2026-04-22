import { useState } from "react";
import { Search as SearchIcon, Sparkles } from "lucide-react";
import { propertiesApi } from "../api";
import PropertyCard from "../components/PropertyCard";
import { cities, propertyTypes } from "../constants/options";

const initialFilters = {
  q: "",
  city: "",
  type: "",
  minPrice: "",
  maxPrice: ""
};

export default function Search() {
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState({ result_count: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await propertiesApi.searchText({
        ...filters,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined
      });

      setResults(response.data);
      setMeta({
        result_count: response.result_count
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to run text search.");
    } finally {
      setLoading(false);
    }
  };

  const retrySearch = () => runSearch({ preventDefault: () => {} });

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="eyebrow">Smart Property Search</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">
          Search portfolio inventory with fast keyword matching.
        </h1>

        <form onSubmit={runSearch} className="mt-8 space-y-5">
          <div className="relative">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
            <input
              className="field pl-12 text-base"
              placeholder="Search properties by keyword..."
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[rgba(14,116,144,0.12)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
              Keyword search enabled
            </span>
            <span className="text-sm text-[var(--muted)]">
              Match across title, area, and tags with relevance scoring.
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <select
              className="field"
              value={filters.city}
              onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              className="field"
              value={filters.type}
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            >
              <option value="">All property types</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              className="field"
              type="number"
              placeholder="Minimum price"
              value={filters.minPrice}
              onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))}
            />
            <input
              className="field"
              type="number"
              placeholder="Maximum price"
              value={filters.maxPrice}
              onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))}
            />
          </div>

          <button type="submit" className="button-primary">
            Run Text Search
          </button>
        </form>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-72" />
          ))}
        </div>
      ) : error ? (
        <div className="panel p-10 text-center">
          <p className="text-lg font-semibold text-rose-700">{error}</p>
          <button type="button" onClick={retrySearch} className="button-primary mt-4">
            Retry
          </button>
        </div>
      ) : hasSearched ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="stat-chip">{meta.result_count} matches</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(213,121,75,0.12)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
              <Sparkles size={14} />
              Query: {filters.q || "browse all"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {results.map((property) => (
              <PropertyCard key={property._id} property={property} highlightText={filters.q} />
            ))}
          </div>
        </section>
      ) : (
        <div className="panel p-10 text-center text-[var(--muted)]">
          Enter keywords to run a text search across property titles, areas, and tags.
        </div>
      )}
    </div>
  );
}
