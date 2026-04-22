import { Play, Printer, Sparkles } from "lucide-react";
import { categoryStyles } from "../constants/options";
import CodeBlock from "./CodeBlock";

export default function QueryPanel({
  query,
  selectedTopic,
  onTopicClick,
  onClearTopic,
  onRunQuery,
  onPrintSummary,
  running,
  result,
  error
}) {
  if (!query) {
    return (
      <div className="panel flex min-h-[420px] items-center justify-center p-8 text-center text-[var(--muted)]">
        Select a query from the left panel to inspect and run it.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[rgba(213,121,75,0.12)] px-3 py-1 text-sm font-semibold text-[var(--accent-strong)]">
                {query.query_id}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyles[query.category]}`}>
                {query.category}
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl text-[var(--ink)]">{query.query_name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{query.description}</p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onPrintSummary} className="button-secondary">
              <Printer size={16} className="mr-2" />
              Print / Export
            </button>
            <button type="button" onClick={() => onRunQuery(query.query_id)} className="button-primary">
              <Play size={16} className="mr-2" />
              {running ? "Running..." : "Run Query"}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-[var(--ink)]">Topics Covered</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {query.topics_covered.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => onTopicClick(topic)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selectedTopic === topic
                    ? "border-[var(--accent)] bg-[rgba(213,121,75,0.12)] text-[var(--accent-strong)]"
                    : "border-[var(--line)] bg-white/80 text-[var(--ink)] hover:border-[var(--accent)]"
                }`}
              >
                {topic}
              </button>
            ))}
            {selectedTopic && (
              <button type="button" onClick={onClearTopic} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Clear Filter
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-[var(--ink)]">Lecture Reference</p>
          <div className="mt-3">
            <span className="stat-chip">{query.lecture_reference}</span>
          </div>
        </div>
      </div>

      <CodeBlock code={result?.mongo_query_string || query.mongo_query_string || ""} />

      {result && (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 font-semibold">
              <Sparkles size={16} />
              Query ran successfully
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold">
              Executed in {result.execution_time_ms}ms
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold">
              {result.result_count} results
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="panel overflow-hidden">
          <div className="border-b border-[var(--line)] px-6 py-4">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Results</h3>
            <p className="text-sm text-[var(--muted)]">Showing the first 10 formatted JSON results.</p>
          </div>
          <div className="max-h-[420px] overflow-auto bg-[#111827] p-6 font-mono text-xs leading-6 text-slate-200">
            <pre>{JSON.stringify(result?.results || [], null, 2)}</pre>
          </div>
        </div>

        <div className="panel p-6">
          <h3 className="text-lg font-semibold text-[var(--ink)]">This query demonstrates</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
            {query.demonstrates?.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
