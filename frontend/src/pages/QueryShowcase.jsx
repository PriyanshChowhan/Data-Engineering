import { startTransition, useEffect, useMemo, useState } from "react";
import { Database, PlayCircle } from "lucide-react";
import { queriesApi } from "../api";
import QueryPanel from "../components/QueryPanel";
import { categoryStyles } from "../constants/options";

export default function QueryShowcase() {
  const [queries, setQueries] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [runningQueryId, setRunningQueryId] = useState("");
  const [resultsById, setResultsById] = useState({});
  const [queryErrors, setQueryErrors] = useState({});
  const [runAllProgress, setRunAllProgress] = useState(0);
  const [runAllActive, setRunAllActive] = useState(false);
  const [runAllSummary, setRunAllSummary] = useState([]);

  const loadQueries = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await queriesApi.list();
      setQueries(response.data);
      startTransition(() => {
        setSelectedQueryId(response.data[0]?.query_id || "");
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load query showcase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const filteredQueries = useMemo(
    () =>
      selectedTopic
        ? queries.filter((query) => query.topics_covered.includes(selectedTopic))
        : queries,
    [queries, selectedTopic]
  );

  useEffect(() => {
    if (!filteredQueries.length) {
      return;
    }

    const selectedStillVisible = filteredQueries.some((query) => query.query_id === selectedQueryId);

    if (!selectedStillVisible) {
      startTransition(() => {
        setSelectedQueryId(filteredQueries[0].query_id);
      });
    }
  }, [filteredQueries, selectedQueryId]);

  const selectedQuery =
    queries.find((query) => query.query_id === selectedQueryId) || filteredQueries[0] || null;

  const handleRunQuery = async (queryId) => {
    setRunningQueryId(queryId);
    setQueryErrors((current) => ({ ...current, [queryId]: "" }));

    try {
      const response = await queriesApi.run(queryId);
      setResultsById((current) => ({ ...current, [queryId]: response }));
    } catch (requestError) {
      setQueryErrors((current) => ({
        ...current,
        [queryId]: requestError.response?.data?.message || "Failed to run query."
      }));
    } finally {
      setRunningQueryId("");
    }
  };

  const handleRunAll = async () => {
    setRunAllActive(true);
    setRunAllProgress(0);
    setRunAllSummary([]);

    for (let index = 0; index < queries.length; index += 1) {
      const query = queries[index];

      try {
        const response = await queriesApi.run(query.query_id);
        setResultsById((current) => ({ ...current, [query.query_id]: response }));
        setRunAllSummary((current) => [
          ...current,
          {
            query_id: query.query_id,
            query_name: query.query_name,
            status: "Success",
            result_count: response.result_count,
            execution_time_ms: response.execution_time_ms
          }
        ]);
      } catch (requestError) {
        setRunAllSummary((current) => [
          ...current,
          {
            query_id: query.query_id,
            query_name: query.query_name,
            status: "Failed",
            result_count: 0,
            execution_time_ms: "-"
          }
        ]);
      } finally {
        setRunAllProgress(Math.round(((index + 1) / queries.length) * 100));
      }
    }

    setRunAllActive(false);
  };

  const handlePrintSummary = () => {
    const printWindow = window.open("", "_blank", "width=980,height=720");

    if (!printWindow) {
      return;
    }

    const rows = queries
      .map(
        (query) => `
          <tr>
            <td>${query.query_id}</td>
            <td>${query.query_name}</td>
            <td>${query.description}</td>
            <td>${query.topics_covered.join(", ")}</td>
            <td>${query.lecture_reference}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Real-Estate Query Showcase Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
            h1 { margin-bottom: 8px; }
            p { color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Real-Estate Investment & Rental Profitability Tracker</h1>
          <p>Live query summary.</p>
          <table>
            <thead>
              <tr>
                <th>Query ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Topics</th>
                <th>Lecture</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) {
    return <div className="skeleton h-[860px]" />;
  }

  if (error) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-lg font-semibold text-rose-700">{error}</p>
        <button type="button" onClick={loadQueries} className="button-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="panel flex h-[calc(100vh-160px)] flex-col overflow-hidden">
        <div className="border-b border-[var(--line)] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[rgba(213,121,75,0.12)] p-3 text-[var(--accent-strong)]">
              <Database size={18} />
            </div>
            <div>
              <p className="eyebrow">Query Library</p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">All 20 showcase queries</h2>
            </div>
          </div>
          {selectedTopic && (
            <div className="mt-4 rounded-2xl bg-[rgba(213,121,75,0.12)] px-4 py-3 text-sm text-[var(--accent-strong)]">
              Filtering by topic: <strong>{selectedTopic}</strong>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {filteredQueries.map((query) => (
            <button
              key={query.query_id}
              type="button"
              onClick={() => setSelectedQueryId(query.query_id)}
              className={`w-full rounded-[24px] border p-4 text-left transition ${
                selectedQuery?.query_id === query.query_id
                  ? "border-[var(--accent)] bg-[rgba(213,121,75,0.1)]"
                  : "border-[var(--line)] bg-white/70 hover:bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white">
                  {query.query_id}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyles[query.category]}`}>
                  {query.category}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--ink)]">{query.query_name}</h3>
              <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {query.lecture_reference}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-6">
        <QueryPanel
          query={selectedQuery}
          selectedTopic={selectedTopic}
          onTopicClick={(topic) => setSelectedTopic(topic)}
          onClearTopic={() => setSelectedTopic("")}
          onRunQuery={handleRunQuery}
          onPrintSummary={handlePrintSummary}
          running={runningQueryId === selectedQuery?.query_id}
          result={selectedQuery ? resultsById[selectedQuery.query_id] : null}
          error={selectedQuery ? queryErrors[selectedQuery.query_id] : ""}
        />

        <div className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Run All</p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Execute all 20 queries sequentially
              </h3>
            </div>

            <button type="button" onClick={handleRunAll} className="button-primary" disabled={runAllActive}>
              <PlayCircle size={16} className="mr-2" />
              {runAllActive ? "Running All..." : "Run All 20 Queries"}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-3 rounded-full bg-[linear-gradient(90deg,_#0e7490,_#d5794b)] transition-all"
              style={{ width: `${runAllProgress}%` }}
            />
          </div>

          <div className="mt-2 text-sm text-[var(--muted)]">{runAllProgress}% complete</div>

          {runAllSummary.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-[var(--line)] bg-white/70">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/80 text-left text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Query</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Result Count</th>
                      <th className="px-4 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {runAllSummary.map((item) => (
                      <tr key={item.query_id}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[var(--ink)]">{item.query_id}</div>
                          <div className="text-xs text-[var(--muted)]">{item.query_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.status === "Success"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--muted)]">{item.result_count}</td>
                        <td className="px-4 py-3 text-[var(--muted)]">{item.execution_time_ms}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
