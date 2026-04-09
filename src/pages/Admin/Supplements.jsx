import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/fetchData";
import { LoadingButton } from "../../components";

const dashboardFilterFieldClass = "flex flex-col gap-1";
const dashboardFilterInputClass =
  "h-10 rounded-xl border border-gray-700 bg-gray-900 px-3 text-sm text-white outline-none transition-all focus:border-blue-500";

const normalizePhone = (phone) => {
  if (!phone) return "";
  let digits = String(phone).replace(/[^\d]/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const Supplements = () => {
  const [form, setForm] = useState({
    supplementName: "",
    memberName: "",
    memberPhone: "",
    buyDate: "",
    totalAmount: "",
    paidAmount: "",
    paymentDueDate: "",
    note: "",
  });
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    search: "",
    status: "",
    pendingOnly: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    supplementName: "",
    memberName: "",
    memberPhone: "",
    buyDate: "",
    totalAmount: "",
    paidAmount: "",
    paymentDueDate: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [summaryStats, setSummaryStats] = useState(null);
  const formRemainingAmount = Math.max(
    Number(form.totalAmount || 0) - Number(form.paidAmount || 0),
    0
  );
  const editRemainingAmount = Math.max(
    Number(editForm.totalAmount || 0) - Number(editForm.paidAmount || 0),
    0
  );

  useEffect(() => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    setForm((prev) => ({ ...prev, buyDate: end, paymentDueDate: end }));
  }, []);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit]);
  const fetchSupplements = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search,
        status: filters.status,
        pendingOnly: filters.pendingOnly,
        page,
        limit,
      };
      const res = await axios.get(`${BASE_URL}/api/v1/supplements`, { params });
      if (res.data?.success) {
        setSupplements(res.data.supplements || []);
        setTotal(res.data.total || 0);
      } else {
        setError(res.data?.message || "Failed to fetch supplements");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch supplements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplements();
  }, [filters, page, limit]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/supplements/dashboard`);
        if (res.data?.success) {
          setSummaryStats(res.data.stats || null);
        }
      } catch (_err) {
        setSummaryStats(null);
      }
    };

    fetchSummary();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditChange = (e) => {
    const { id, value } = e.target;
    setEditForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formRemainingAmount > 0 && !form.paymentDueDate) {
        toast.error("Due Date is required when payment is pending");
        setSubmitting(false);
        return;
      }

      const payload = {
        ...form,
        totalAmount: Number(form.totalAmount || 0),
        paidAmount: Number(form.paidAmount || 0),
        paymentDueDate: formRemainingAmount > 0 ? form.paymentDueDate : "",
      };
      const res = await axios.post(`${BASE_URL}/api/v1/supplements`, payload);
      if (res.data?.success) {
        toast.success("Supplement entry added");
        setForm((prev) => ({
          ...prev,
          supplementName: "",
          memberName: "",
          memberPhone: "",
          buyDate: form.buyDate,
          totalAmount: "",
          paidAmount: "",
          note: "",
        }));
        setIsFormOpen(false);
        setPage(1);
        fetchSupplements();
      } else {
        toast.error(res.data?.message || "Failed to add supplement entry");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add supplement entry");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (sale) => {
    setEditingId(sale._id);
    setEditForm({
      supplementName: sale.supplementName || "",
      memberName: sale.memberName || "",
      memberPhone: sale.memberPhone || "",
      buyDate: sale.buyDate ? new Date(sale.buyDate).toISOString().slice(0, 10) : "",
      totalAmount: sale.totalAmount || "",
      paidAmount: sale.paidAmount || "",
      paymentDueDate: sale.paymentDueDate
        ? new Date(sale.paymentDueDate).toISOString().slice(0, 10)
        : "",
      note: sale.note || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      supplementName: "",
      memberName: "",
      memberPhone: "",
      buyDate: "",
      totalAmount: "",
      paidAmount: "",
      paymentDueDate: "",
      note: "",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingId(editingId);
    try {
      if (editRemainingAmount > 0 && !editForm.paymentDueDate) {
        toast.error("Due Date is required when payment is pending");
        setSavingId("");
        return;
      }

      const payload = {
        ...editForm,
        totalAmount: Number(editForm.totalAmount || 0),
        paidAmount: Number(editForm.paidAmount || 0),
        paymentDueDate: editRemainingAmount > 0 ? editForm.paymentDueDate : "",
      };
      const res = await axios.put(`${BASE_URL}/api/v1/supplements/${editingId}`, payload);
      if (res.data?.success) {
        toast.success("Supplement entry updated");
        setSupplements((prev) =>
          prev.map((sale) => (sale._id === editingId ? res.data.supplement : sale))
        );
        cancelEdit();
      } else {
        toast.error(res.data?.message || "Failed to update supplement entry");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update supplement entry");
    } finally {
      setSavingId("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplement entry?")) return;
    setDeletingId(id);
    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/supplements/${id}`);
      if (res.data?.success) {
        toast.success("Supplement entry deleted");
        setSupplements((prev) => prev.filter((sale) => sale._id !== id));
        setTotal((prev) => Math.max(prev - 1, 0));
      } else {
        toast.error(res.data?.message || "Failed to delete supplement entry");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete supplement entry");
    } finally {
      setDeletingId("");
    }
  };

  const openWhatsApp = (sale) => {
    const phone = normalizePhone(sale?.memberPhone);
    if (!phone) {
      toast.error("Member phone number not available");
      return;
    }
    const dueLabel = sale?.paymentDueDate
      ? new Date(sale.paymentDueDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "not set";
    const buyLabel = sale?.buyDate
      ? new Date(sale.buyDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";
    const message = `Hi ${sale.memberName || "Member"}, supplement payment reminder.\nSupplement: ${sale.supplementName}\nTotal: Rs.${Number(
      sale.totalAmount || 0
    )}\nBought on: ${buyLabel}\nPaid: Rs.${Number(sale.paidAmount || 0)}\nRemaining: Rs.${Number(
      sale.remainingAmount || 0
    )}\nStatus: ${sale.paymentStatus}\nDue date: ${dueLabel}\nPlease clear the pending amount when possible.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section className="pt-6 pb-16 bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold text-white">Supplements</h2>
            <p className="text-gray-400 text-sm mt-1">
              Track sales, pending collections, and reminders in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen((prev) => !prev)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              {isFormOpen ? "Close Sale Form" : "Add Sale"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-5">
          <div className="rounded-xl border border-gray-800 bg-gray-800 p-3">
            <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Pending</div>
            <div className="mt-1 text-xl font-semibold text-orange-300">
              Rs.{Number(summaryStats?.totalOutstanding || 0)}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-800 p-3">
            <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Overdue</div>
            <div className="mt-1 text-xl font-semibold text-red-300">
              {Number(summaryStats?.overdueCount || 0)}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-800 p-3">
            <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Due Today</div>
            <div className="mt-1 text-xl font-semibold text-blue-300">
              {Number(summaryStats?.dueTodayCount || 0)}
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-gray-800 bg-gray-800/95 px-3 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.18)] space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "All", value: "" },
              { label: "Overdue", value: "Overdue" },
              { label: "Due Today", value: "Due Today" },
              { label: "Pending", value: "Pending" },
              { label: "Paid", value: "Paid" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    status: option.value === "Pending" ? "" : option.value,
                    pendingOnly: option.value === "Pending",
                  }));
                }}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  (option.value === "Pending" && filters.pendingOnly) ||
                  (option.value !== "Pending" && filters.status === option.value && !filters.pendingOnly)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(150px,0.9fr)_minmax(150px,0.9fr)_minmax(240px,1.4fr)_auto] gap-2 border-t border-gray-700 pt-3">
            <div className={dashboardFilterFieldClass}>
              <label className="text-gray-300 text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }));
                }}
                className={dashboardFilterInputClass}
              />
            </div>
            <div className={dashboardFilterFieldClass}>
              <label className="text-gray-300 text-sm mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }));
                }}
                className={dashboardFilterInputClass}
              />
            </div>
            <div className={`${dashboardFilterFieldClass} sm:col-span-2 xl:col-span-1`}>
              <label className="text-gray-300 text-sm mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                placeholder="Member or supplement"
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, search: e.target.value }));
                }}
                className={dashboardFilterInputClass}
              />
            </div>
            <div className="flex items-end sm:col-span-2 xl:col-span-1">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    search: "",
                    startDate: "",
                    endDate: "",
                    status: "",
                    pendingOnly: false,
                  }));
                }}
                className="h-10 w-full rounded-xl bg-gray-700 px-4 text-sm font-medium text-white hover:bg-gray-600 transition-all whitespace-nowrap xl:w-auto"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-950/30 border border-blue-800/60 rounded-2xl px-4 py-3 mb-6 text-xs text-blue-100">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span><span className="font-semibold">Paid:</span> fully received</span>
            <span><span className="font-semibold">Upcoming:</span> due date in future</span>
            <span><span className="font-semibold">Due Today:</span> collect now</span>
            <span><span className="font-semibold">Overdue:</span> date already passed</span>
            <span><span className="font-semibold">No Due Date:</span> pending without schedule</span>
          </div>
        </div>

        {loading && <p className="text-white">Loading supplement entries...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-gray-800 rounded-md">
            <table className="min-w-full text-left text-sm text-gray-200">
              <thead className="bg-gray-700 text-gray-100">
                <tr>
                  <th className="px-4 py-3">Supplement</th>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Buy Date</th>
                  <th className="px-4 py-3">Remaining Payment</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplements.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-300" colSpan={11}>
                      No supplement entries found
                    </td>
                  </tr>
                )}
                {supplements.map((sale) => (
                  <tr key={sale._id} className="border-b border-gray-700 align-top">
                    <td className="px-4 py-3">{sale.supplementName}</td>
                    <td className="px-4 py-3">{sale.memberName}</td>
                    <td className="px-4 py-3">{sale.memberPhone || "-"}</td>
                    <td className="px-4 py-3">
                      {sale.buyDate ? new Date(sale.buyDate).toLocaleDateString("en-GB") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          Number(sale.remainingAmount || 0) > 0 ? "text-orange-300" : "text-green-300"
                        }`}
                      >
                        Rs.{Number(sale.remainingAmount || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{`Rs.${Number(sale.totalAmount || 0)}`}</td>
                    <td className="px-4 py-3">{`Rs.${Number(sale.paidAmount || 0)}`}</td>
                    <td className="px-4 py-3">
                      {sale.paymentDueDate
                        ? new Date(sale.paymentDueDate).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          sale.paymentStatus === "Paid"
                            ? "bg-green-700 text-green-100"
                            : sale.paymentStatus === "Due Today"
                            ? "bg-blue-700 text-blue-100"
                            : sale.paymentStatus === "Overdue"
                            ? "bg-red-700 text-red-100"
                            : sale.paymentStatus === "No Due Date"
                            ? "bg-gray-700 text-gray-100"
                            : "bg-yellow-700 text-yellow-100"
                        }`}
                        title={sale.statusNote || ""}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">{sale.note || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => startEdit(sale)}
                          className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openWhatsApp(sale)}
                          className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                        >
                          WhatsApp
                        </button>
                        <LoadingButton
                          type="button"
                          onClick={() => handleDelete(sale._id)}
                          loading={deletingId === sale._id}
                          loadingText="Deleting..."
                          className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition-all"
                        >
                          Delete
                        </LoadingButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && total > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-gray-200 text-sm">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Next
              </button>
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
                className="p-2 rounded-md outline-none"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 p-4 md:p-6">
            <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center">
              <div className="w-full max-h-[90vh] overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
                  <div>
                    <div className="text-lg font-semibold">Add Supplement Sale</div>
                    <div className="text-sm text-gray-400">Capture sale details without cluttering the list.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700 transition-all"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-[calc(90vh-74px)] overflow-y-auto p-5">
                  <div className="mb-4 rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-300">
                    <div>Total: Rs.{Number(form.totalAmount || 0)}</div>
                    <div>Paid: Rs.{Number(form.paidAmount || 0)}</div>
                    <div className="font-semibold text-orange-300">
                      Due: Rs.{formRemainingAmount}
                    </div>
                  </div>
                  <form className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                      <label htmlFor="supplementName" className="text-gray-300 text-sm mb-1">Supplement Name</label>
                      <input id="supplementName" type="text" placeholder="Example: Whey Protein 1kg" value={form.supplementName} onChange={handleChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" required />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="memberName" className="text-gray-300 text-sm mb-1">Member Name</label>
                      <input id="memberName" type="text" placeholder="Enter member full name" value={form.memberName} onChange={handleChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" required />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="memberPhone" className="text-gray-300 text-sm mb-1">Member Phone</label>
                      <input id="memberPhone" type="text" placeholder="Used for WhatsApp reminders" value={form.memberPhone} onChange={handleChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="buyDate" className="text-gray-300 text-sm mb-1">Buy Date</label>
                      <input id="buyDate" type="date" value={form.buyDate} onChange={handleChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" required />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="totalAmount" className="text-gray-300 text-sm mb-1">Total Price</label>
                      <input id="totalAmount" type="number" placeholder="Full supplement amount" value={form.totalAmount} onChange={handleChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" required />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="paidAmount" className="text-gray-300 text-sm mb-1">Paid Amount</label>
                      <input id="paidAmount" type="number" placeholder="Amount received now" value={form.paidAmount} onChange={handleChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="paymentDueDate" className="text-gray-300 text-sm mb-1">Due Date</label>
                      <input id="paymentDueDate" type="date" value={form.paymentDueDate} onChange={handleChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" required={formRemainingAmount > 0} />
                      <span className="mt-1 text-xs text-gray-400">
                        {formRemainingAmount > 0 ? "Required while any amount is pending." : "Optional for fully paid sales."}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="note" className="text-gray-300 text-sm mb-1">Note</label>
                      <input id="note" type="text" placeholder="Optional note" value={form.note} onChange={handleChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="md:col-span-2 xl:col-span-4 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-all"
                      >
                        Cancel
                      </button>
                      <LoadingButton
                        type="submit"
                        loading={submitting}
                        loadingText="Adding..."
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
                      >
                        Add Supplement
                      </LoadingButton>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingId && (
          <div className="fixed inset-0 z-50 bg-black/70 p-4 md:p-6">
            <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center">
              <div className="w-full max-h-[90vh] overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
                  <div>
                    <div className="text-lg font-semibold">Edit Supplement Sale</div>
                    <div className="text-sm text-gray-400">Update amounts, due date, and note without disturbing the list.</div>
                  </div>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700 transition-all"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-[calc(90vh-74px)] overflow-y-auto p-5">
                  <div className="mb-4 rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-300">
                    <div>Total: Rs.{Number(editForm.totalAmount || 0)}</div>
                    <div>Paid: Rs.{Number(editForm.paidAmount || 0)}</div>
                    <div className="font-semibold text-orange-300">
                      Due: Rs.{editRemainingAmount}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="flex flex-col">
                      <label htmlFor="supplementName" className="text-gray-300 text-sm mb-1">Supplement Name</label>
                      <input id="supplementName" type="text" value={editForm.supplementName} onChange={handleEditChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="memberName" className="text-gray-300 text-sm mb-1">Member Name</label>
                      <input id="memberName" type="text" value={editForm.memberName} onChange={handleEditChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="memberPhone" className="text-gray-300 text-sm mb-1">Member Phone</label>
                      <input id="memberPhone" type="text" value={editForm.memberPhone} onChange={handleEditChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="buyDate" className="text-gray-300 text-sm mb-1">Buy Date</label>
                      <input id="buyDate" type="date" value={editForm.buyDate} onChange={handleEditChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="totalAmount" className="text-gray-300 text-sm mb-1">Total Price</label>
                      <input id="totalAmount" type="number" value={editForm.totalAmount} onChange={handleEditChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="paidAmount" className="text-gray-300 text-sm mb-1">Paid Amount</label>
                      <input id="paidAmount" type="number" value={editForm.paidAmount} onChange={handleEditChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="paymentDueDate" className="text-gray-300 text-sm mb-1">Due Date</label>
                      <input id="paymentDueDate" type="date" value={editForm.paymentDueDate} onChange={handleEditChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" required={editRemainingAmount > 0} />
                      <span className="mt-1 text-xs text-gray-400">
                        {editRemainingAmount > 0 ? "Required while any amount is pending." : "Optional for fully paid sales."}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="note" className="text-gray-300 text-sm mb-1">Note</label>
                      <input id="note" type="text" value={editForm.note} onChange={handleEditChange} className="h-10 rounded-md px-3 outline-none w-full text-sm text-black" />
                    </div>
                    <div className="md:col-span-2 xl:col-span-4 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-all"
                      >
                        Cancel
                      </button>
                      <LoadingButton
                        type="button"
                        onClick={saveEdit}
                        loading={savingId === editingId}
                        loadingText="Saving..."
                        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500 transition-all"
                      >
                        Save Changes
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Supplements;
