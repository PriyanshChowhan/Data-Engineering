import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { formatCurrency, formatDate, getStatusClasses } from "../utils/formatters";

const initialForm = {
  month: "",
  amount_paid: "",
  paid_on: "",
  late_fee: 0,
  payment_mode: "UPI",
  status: "paid"
};

export default function RentalTable({ rentals, onAddPayment, submitting }) {
  const [expandedId, setExpandedId] = useState(null);
  const [modalRental, setModalRental] = useState(null);
  const [form, setForm] = useState(initialForm);

  const lateFeeTotals = useMemo(
    () =>
      rentals.reduce((accumulator, rental) => {
        accumulator[rental._id] = rental.payment_history.reduce(
          (sum, payment) => sum + (payment.late_fee || 0),
          0
        );
        return accumulator;
      }, {}),
    [rentals]
  );

  const submitPayment = async (event) => {
    event.preventDefault();

    if (!modalRental) {
      return;
    }

    await onAddPayment(modalRental._id, {
      ...form,
      amount_paid: Number(form.amount_paid),
      late_fee: Number(form.late_fee),
      paid_on: form.paid_on
    });

    setModalRental(null);
    setForm(initialForm);
  };

  return (
    <>
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--line)] text-sm">
            <thead className="bg-white/60 text-left text-[var(--muted)]">
              <tr>
                <th className="px-4 py-4 font-semibold">Tenant</th>
                <th className="px-4 py-4 font-semibold">Property ID</th>
                <th className="px-4 py-4 font-semibold">Rent Amount</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Lease</th>
                <th className="px-4 py-4 font-semibold">Payments</th>
                <th className="px-4 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rentals.map((rental) => {
                const expanded = expandedId === rental._id;

                return (
                  <Fragment key={rental._id}>
                    <tr className="bg-white/50">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[var(--ink)]">{rental.tenant.name}</div>
                        <div className="text-xs text-[var(--muted)]">
                          {rental.tenant.phone || rental.tenant.contact || rental.tenant.email}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-[var(--ink)]">{rental.property_id}</td>
                      <td className="px-4 py-4 font-semibold text-[var(--ink)]">
                        {formatCurrency(rental.rent_amount)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`status-badge ${getStatusClasses(rental.status)}`}>
                          {rental.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[var(--muted)]">
                        {formatDate(rental.lease_start)} - {formatDate(rental.lease_end)}
                      </td>
                      <td className="px-4 py-4 text-[var(--muted)]">{rental.payment_history.length}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setModalRental(rental)}
                            className="button-secondary px-3 py-2 text-xs"
                          >
                            <PlusCircle size={14} className="mr-2" />
                            Add Payment
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : rental._id)}
                            className="button-secondary px-3 py-2 text-xs"
                          >
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan="7" className="bg-[rgba(255,255,255,0.6)] px-4 py-5">
                          <div className="rounded-[22px] border border-[var(--line)] bg-white/85 p-4">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                              <h4 className="text-base font-semibold text-[var(--ink)]">Payment History</h4>
                              <span className="stat-chip">
                                Total late fees collected: {formatCurrency(lateFeeTotals[rental._id])}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="text-left text-[var(--muted)]">
                                  <tr>
                                    <th className="pb-3 font-semibold">Month</th>
                                    <th className="pb-3 font-semibold">Amount</th>
                                    <th className="pb-3 font-semibold">Paid On</th>
                                    <th className="pb-3 font-semibold">Late Fee</th>
                                    <th className="pb-3 font-semibold">Mode</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--line)]">
                                  {rental.payment_history.map((payment) => (
                                    <tr key={`${rental._id}-${payment.month}-${payment.paid_on}`}>
                                      <td className="py-3 font-medium text-[var(--ink)]">{payment.month}</td>
                                      <td className="py-3 text-[var(--muted)]">
                                        {formatCurrency(payment.amount_paid)}
                                      </td>
                                      <td className="py-3 text-[var(--muted)]">{formatDate(payment.paid_on)}</td>
                                      <td className="py-3 text-[var(--muted)]">{formatCurrency(payment.late_fee)}</td>
                                      <td className="py-3 text-[var(--muted)]">{payment.payment_mode}</td>
                                      <td className="py-3">
                                        <span className={`status-badge ${getStatusClasses(payment.status)}`}>
                                          {payment.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="panel w-full max-w-xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">New Payment Entry</p>
                <h3 className="mt-2 font-display text-2xl text-[var(--ink)]">
                  {modalRental.tenant.name} - {modalRental.property_id}
                </h3>
              </div>
              <button type="button" onClick={() => setModalRental(null)} className="button-secondary px-3 py-2">
                Close
              </button>
            </div>

            <form onSubmit={submitPayment} className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className="field"
                type="month"
                value={form.month}
                onChange={(event) => setForm((current) => ({ ...current, month: event.target.value }))}
                required
              />
              <input
                className="field"
                type="number"
                placeholder="Amount paid"
                value={form.amount_paid}
                onChange={(event) => setForm((current) => ({ ...current, amount_paid: event.target.value }))}
                required
              />
              <input
                className="field"
                type="date"
                value={form.paid_on}
                onChange={(event) => setForm((current) => ({ ...current, paid_on: event.target.value }))}
                required
              />
              <input
                className="field"
                type="number"
                placeholder="Late fee"
                value={form.late_fee}
                onChange={(event) => setForm((current) => ({ ...current, late_fee: event.target.value }))}
              />
              <select
                className="field"
                value={form.payment_mode}
                onChange={(event) => setForm((current) => ({ ...current, payment_mode: event.target.value }))}
              >
                <option value="UPI">UPI</option>
                <option value="bank_transfer">bank_transfer</option>
                <option value="cash">cash</option>
              </select>
              <select
                className="field"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="paid">paid</option>
                <option value="late">late</option>
                <option value="pending">pending</option>
              </select>

              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="button-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
