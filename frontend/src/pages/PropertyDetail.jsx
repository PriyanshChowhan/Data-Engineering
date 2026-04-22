import { useEffect, useState } from "react";
import {
  Bath,
  BedDouble,
  Building2,
  ChartLine,
  LandPlot,
  Mail,
  MapPin,
  Phone,
  Ruler
} from "lucide-react";
import { useParams } from "react-router-dom";
import { propertiesApi } from "../api";
import { formatCurrency, formatDate, getStatusClasses } from "../utils/formatters";

const amenityIcons = {
  parking: Building2,
  gym: ChartLine,
  pool: Bath,
  security: Building2,
  lift: Building2,
  garden: LandPlot,
  club_house: Building2,
  power_backup: Building2,
  cctv: Building2,
  kids_play_area: LandPlot,
  intercom: Phone,
  rainwater_harvesting: LandPlot
};

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProperty = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await propertiesApi.getById(id);
      setProperty(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load property.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperty();
  }, [id]);

  if (loading) {
    return <div className="skeleton h-[760px]" />;
  }

  if (error) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-lg font-semibold text-rose-700">{error}</p>
        <button type="button" onClick={loadProperty} className="button-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  const profit =
    property.investment_details.current_valuation -
    property.investment_details.purchase_price -
    property.investment_details.renovation_cost;

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`status-badge ${getStatusClasses(property.status)}`}>
                {property.status.replaceAll("_", " ")}
              </span>
              <span className="rounded-full bg-[rgba(14,116,144,0.1)] px-3 py-1 text-sm font-semibold text-[var(--teal)]">
                {property.listed_by}
              </span>
            </div>
            <h1 className="mt-4 font-display text-5xl text-[var(--ink)]">{property.title}</h1>
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
              <MapPin size={16} />
              <span>
                {property.location.area}, {property.location.city}, {property.location.state}
              </span>
            </div>
          </div>

          <div className="rounded-[28px] bg-[linear-gradient(135deg,_rgba(213,121,75,0.18),_rgba(14,116,144,0.1))] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Investment Signal
            </p>
            <p className="mt-4 text-3xl font-bold text-[var(--ink)]">
              {property.investment_details.appreciation_percent}%
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Appreciation as of {formatDate(property.investment_details.last_updated)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="panel p-6">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Property Info</h2>
              <div className="mt-5 grid gap-4 text-sm text-[var(--muted)]">
                <div className="flex items-center gap-3">
                  <Ruler size={18} />
                  <span>{property.area_sqft} sqft</span>
                </div>
                <div className="flex items-center gap-3">
                  <BedDouble size={18} />
                  <span>{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-3">
                  <Bath size={18} />
                  <span>{property.bathrooms} bathrooms</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 size={18} />
                  <span className="capitalize">{property.type}</span>
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Investment Info</h2>
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-[var(--muted)]">Purchase Price</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    {formatCurrency(property.investment_details.purchase_price)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--muted)]">Current Valuation</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    {formatCurrency(property.investment_details.current_valuation)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--muted)]">Profit After Renovation</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    {formatCurrency(profit)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--muted)]">Appreciation</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    {property.investment_details.appreciation_percent}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Amenities</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {property.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Building2;

                return (
                  <div key={amenity} className="panel-soft flex items-center gap-3 px-4 py-3">
                    <div className="rounded-2xl bg-[rgba(213,121,75,0.12)] p-2 text-[var(--accent-strong)]">
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-[var(--ink)]">
                      {amenity.replaceAll("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--ink)]">Tags</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[var(--soft)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="border-b border-[var(--line)] px-6 py-4">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Rental History</h2>
            </div>
            <div className="overflow-x-auto p-6">
              <table className="min-w-full text-sm">
                <thead className="text-left text-[var(--muted)]">
                  <tr>
                    <th className="pb-3 font-semibold">Rental ID</th>
                    <th className="pb-3 font-semibold">Tenant</th>
                    <th className="pb-3 font-semibold">Rent</th>
                    <th className="pb-3 font-semibold">Lease Period</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {property.rentals.map((rental) => (
                    <tr key={rental._id}>
                      <td className="py-4 font-medium text-[var(--ink)]">{rental.rental_id}</td>
                      <td className="py-4 text-[var(--muted)]">{rental.tenant.name}</td>
                      <td className="py-4 text-[var(--muted)]">{formatCurrency(rental.rent_amount)}</td>
                      <td className="py-4 text-[var(--muted)]">
                        {formatDate(rental.lease_start)} - {formatDate(rental.lease_end)}
                      </td>
                      <td className="py-4">
                        <span className={`status-badge ${getStatusClasses(rental.status)}`}>
                          {rental.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {property.rentals.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-[var(--muted)]">
                        No rental history available for this property.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="panel h-fit p-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Owner Contact</h2>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Name</p>
              <p className="mt-1 font-semibold text-[var(--ink)]">{property.owner.name}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <Phone size={16} />
              <span>{property.owner.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <Mail size={16} />
              <span>{property.owner.email}</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
