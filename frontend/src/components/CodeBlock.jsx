import { Copy, Check } from "lucide-react";
import { useMemo, useState } from "react";

const tokenRegex =
  /("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\$[A-Za-z_]+|\b(?:db|find|updateMany|updateOne|sort|limit|new|Date|true|false|null)\b|\b\d+(?:\.\d+)?\b)/g;

const getTokenClass = (token) => {
  if (token.startsWith('"') || token.startsWith("'")) {
    return "text-amber-300";
  }

  if (token.startsWith("$")) {
    return "text-sky-300";
  }

  if (["db", "find", "updateMany", "updateOne", "sort", "limit", "new", "Date"].includes(token)) {
    return "text-violet-300";
  }

  if (["true", "false", "null"].includes(token)) {
    return "text-emerald-300";
  }

  if (!Number.isNaN(Number(token))) {
    return "text-orange-300";
  }

  return "text-slate-100";
};

const renderLine = (line) => {
  const parts = line.split(tokenRegex).filter(Boolean);

  return parts.map((part, index) => (
    <span key={`${part}-${index}`} className={getTokenClass(part)}>
      {part}
    </span>
  ));
};

export default function CodeBlock({ code, label = "Executed Query" }) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => code.split("\n"), [code]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#1e1e1e] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          {label}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="overflow-x-auto p-4 font-mono text-sm leading-7 text-slate-100">
        {lines.map((line, index) => (
          <div key={`${index + 1}-${line}`} className="grid grid-cols-[48px_1fr] gap-4 whitespace-pre">
            <span className="select-none text-right text-slate-500">{index + 1}</span>
            <code>{renderLine(line)}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
