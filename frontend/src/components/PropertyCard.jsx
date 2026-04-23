import { BedDouble, ChartLine, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCompactCurrency, getStatusClasses } from "../utils/formatters";

export default function PropertyCard({ property, highlightText }) {
  const safePattern = highlightText
    ? highlightText
        .split(" ")
        .filter(Boolean)
        .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|")
    : "";
  const highlightedTitle = safePattern
    ? property.title.replace(new RegExp(`(${safePattern})`, "gi"), "<mark>$1</mark>")
    : property.title;

  return (
    <Link
      to={`/properties/${property._id || property.property_id}`}
      className="panel group block overflow-hidden p-5 transition hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`status-badge ${getStatusClasses(property.status)}`}>
            {property.status.replaceAll("_", " ")}
          </span>
          <h3
            className="mt-4 text-xl font-bold text-[var(--ink)]"
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />
        </div>
        <div className="rounded-full bg-[rgba(213,121,75,0.12)] px-3 py-1 text-sm font-semibold text-[var(--accent-strong)]">
          {property.type}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
        <MapPin size={16} />
        <span>
          {property.location.area}, {property.location.city}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Asking Price</p>
          <p className="mt-2 text-2xl font-bold text-[var(--ink)]">
            {formatCompactCurrency(property.price)}
          </p>
        </div>
        <div className="rounded-2xl bg-[rgba(14,116,144,0.1)] px-3 py-2 text-sm font-semibold text-[var(--teal)]">
          Rating {property.rating}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-[var(--muted)]">
        <div className="panel-soft px-3 py-2">
          <div className="flex items-center gap-2">
            <BedDouble size={16} />
            <span>{property.bedrooms} beds</span>
          </div>
        </div>
        <div className="panel-soft px-3 py-2">
          <div className="flex items-center gap-2">
            <ChartLine size={16} />
            <span>{property.investment_details.appreciation_percent}% growth</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {property.amenities.slice(0, 3).map((amenity) => (
          <span key={amenity} className="rounded-full bg-[var(--soft)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
            {amenity.replaceAll("_", " ")}
          </span>
        ))}
      </div>
    </Link>
  );
}
