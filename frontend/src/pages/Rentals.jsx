import { useEffect, useState } from "react";
import { CalendarRange } from "lucide-react";
import { rentalsApi } from "../api";
import RentalTable from "../components/RentalTable";
import { rentalStatuses } from "../constants/options";

export default function Rentals() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadRentals = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await rentalsApi.list({
        page,
        limit: 12,
        status: status === "all" ? undefined : status
      });
      setResponse(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load rentals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, [page, status]);

  const handleAddPayment = async (id, payload) => {
    setSubmitting(true);

    try {
      await rentalsApi.addPayment(id, payload);
      await loadRentals();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to add payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Rental Tracker</p>
            <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">
              Stay on top of leases, payment behavior, and tenant operations.
            </h1>
          </div>

          <div className="rounded-[24px] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <CalendarRange size={16} />
              <span>{response.pagination?.total || 0} rentals matched</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setStatus("all");
            setPage(1);
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            status === "all" ? "bg-[var(--accent)] text-white" : "bg-white/80 text-[var(--ink)]"
          }`}
        >
          All
        </button>
        {rentalStatuses.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              status === tab ? "bg-[var(--accent)] text-white" : "bg-white/80 text-[var(--ink)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton h-[520px]" />
      ) : error ? (
        <div className="panel p-10 text-center">
          <p className="text-lg font-semibold text-rose-700">{error}</p>
          <button type="button" onClick={loadRentals} className="button-primary mt-4">
            Retry
          </button>
        </div>
      ) : (
        <>
          <RentalTable rentals={response.data} onAddPayment={handleAddPayment} submitting={submitting} />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[var(--line)] bg-white/65 px-5 py-4">
            <p className="text-sm text-[var(--muted)]">
              Page {response.pagination?.page} of {response.pagination?.totalPages}
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
    </div>
  );
}
