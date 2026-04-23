export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

export const formatCompactCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value || 0);

export const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(value || 0);

export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date(value))
    : "-";

export const getStatusClasses = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (["available", "active", "paid", "resolved"].includes(normalized)) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (["under_maintenance", "pending"].includes(normalized)) {
    return "bg-amber-100 text-amber-700";
  }

  if (["late", "terminated", "sold"].includes(normalized)) {
    return "bg-rose-100 text-rose-700";
  }

  if (["expired", "open"].includes(normalized)) {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-slate-100 text-slate-700";
};
