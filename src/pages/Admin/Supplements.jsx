import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/fetchData";
import { LoadingButton } from "../../components";

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

  useEffect(() => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 30);
    const start = startDate.toISOString().slice(0, 10);
    setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
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
    if (!filters.startDate || !filters.endDate) return;
    fetchSupplements();
  }, [filters, page, limit]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        totalAmount: Number(form.totalAmount || 0),
        paidAmount: Number(form.paidAmount || 0),
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
      const payload = {
        ...editForm,
        totalAmount: Number(editForm.totalAmount || 0),
        paidAmount: Number(editForm.paidAmount || 0),
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
    <section className="py-16 bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold text-white">Supplements</h2>
            <p className="text-gray-300 text-sm mt-1">
              Track supplement sales, buy date, due date, later payments, and WhatsApp reminders.
            </p>
          </div>
        </div>

        <div className="bg-blue-950/40 border border-blue-700 rounded-md p-4 mb-6 text-sm text-blue-100">
          <p className="font-semibold mb-2">How status works</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
            <p><span className="font-semibold">Paid:</span> full amount received</p>
            <p><span className="font-semibold">No Due Date:</span> pending amount, but due date not set</p>
            <p><span className="font-semibold">Upcoming:</span> pending amount, due date is in future</p>
            <p><span className="font-semibold">Due Today:</span> pending amount, due today</p>
            <p><span className="font-semibold">Overdue:</span> pending amount and due date already passed</p>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Due Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }));
                }}
                className="p-2 rounded-md outline-none w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Due End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }));
                }}
                className="p-2 rounded-md outline-none w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                placeholder="Member or supplement"
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, search: e.target.value }));
                }}
                className="p-2 rounded-md outline-none w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                }}
                className="p-2 rounded-md outline-none w-full"
              >
                <option value="">All</option>
                <option value="Paid">Paid</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Due Today">Due Today</option>
                <option value="Overdue">Overdue</option>
                <option value="No Due Date">No Due Date</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-md mb-6">
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold">Add Supplement Sale</h3>
            <p className="text-gray-400 text-sm">
              Fill sale details here. Use paid amount only for money received now, and due date for later collection.
            </p>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label htmlFor="supplementName" className="text-gray-300 text-sm mb-1">Supplement Name</label>
              <input
                id="supplementName"
                type="text"
                placeholder="Example: Whey Protein 1kg"
                value={form.supplementName}
                onChange={handleChange}
                className="p-2 rounded-md outline-none w-full"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="memberName" className="text-gray-300 text-sm mb-1">Member Name</label>
              <input
                id="memberName"
                type="text"
                placeholder="Enter member full name"
                value={form.memberName}
                onChange={handleChange}
                className="p-2 rounded-md outline-none w-full"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="memberPhone" className="text-gray-300 text-sm mb-1">Member Phone</label>
              <input
                id="memberPhone"
                type="text"
                placeholder="Used for WhatsApp reminders"
                value={form.memberPhone}
                onChange={handleChange}
                className="p-2 rounded-md outline-none w-full"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="buyDate" className="text-gray-300 text-sm mb-1">Buy Date</label>
              <input
                id="buyDate"
                type="date"
                value={form.buyDate}
                onChange={handleChange}
                className="p-2 rounded-md outline-none w-full"
                required
              />
              <span className="text-xs text-gray-400 mt-1">The date the member took the supplement.</span>
            </div>
            <div className="flex flex-col">
              <label htmlFor="totalAmount" className="text-gray-300 text-sm mb-1">Total Price</label>
              <input
                id="totalAmount"
                type="number"
                placeholder="Full supplement amount"
                value={form.totalAmount}
                onChange={handleChange}
                className="p-2 rounded-md outline-none w-full"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="paidAmount" className="text-gray-300 text-sm mb-1">Paid Amount</label>
              <input
                id="paidAmount"
                type="number"
                placeholder="Amount received now"
                value={form.paidAmount}
                onChange={handleChange}
                className="p-2 rounded-md outline-none w-full"
              />
              <span className="text-xs text-gray-400 mt-1">Leave `0` if member will pay later.</span>
            </div>
            <div className="flex flex-col">
              <label htmlFor="paymentDueDate" className="text-gray-300 text-sm mb-1">Due Date</label>
              <input
                id="paymentDueDate"
                type="date"
                value={form.paymentDueDate}
                onChange={handleChange}
                className="p-2 rounded-md outline-none w-full"
              />
              <span className="text-xs text-gray-400 mt-1">Set when the remaining payment should be collected.</span>
            </div>
            <div className="flex flex-col">
              <label htmlFor="note" className="text-gray-300 text-sm mb-1">Note</label>
              <input
                id="note"
                type="text"
                placeholder="Optional note"
                value={form.note}
                onChange={handleChange}
                className="p-2 rounded-md outline-none w-full"
              />
            </div>
            <LoadingButton
              type="submit"
              loading={submitting}
              loadingText="Adding..."
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              Add Supplement
            </LoadingButton>
          </form>
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
                    <td className="px-4 py-3">
                      {editingId === sale._id ? (
                        <input
                          type="text"
                          value={editForm.supplementName}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, supplementName: e.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        />
                      ) : (
                        sale.supplementName
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === sale._id ? (
                        <input
                          type="text"
                          value={editForm.memberName}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, memberName: e.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        />
                      ) : (
                        sale.memberName
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === sale._id ? (
                        <input
                          type="text"
                          value={editForm.memberPhone}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, memberPhone: e.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        />
                      ) : (
                        sale.memberPhone || "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === sale._id ? (
                        <input
                          type="date"
                          value={editForm.buyDate}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, buyDate: e.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700"
                        />
                      ) : sale.buyDate ? (
                        new Date(sale.buyDate).toLocaleDateString("en-GB")
                      ) : (
                        "-"
                      )}
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
                    <td className="px-4 py-3">
                      {editingId === sale._id ? (
                        <input
                          type="number"
                          value={editForm.totalAmount}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, totalAmount: e.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-28"
                        />
                      ) : (
                        `Rs.${Number(sale.totalAmount || 0)}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === sale._id ? (
                        <input
                          type="number"
                          value={editForm.paidAmount}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, paidAmount: e.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-28"
                        />
                      ) : (
                        `Rs.${Number(sale.paidAmount || 0)}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === sale._id ? (
                        <input
                          type="date"
                          value={editForm.paymentDueDate}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, paymentDueDate: e.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700"
                        />
                      ) : sale.paymentDueDate ? (
                        new Date(sale.paymentDueDate).toLocaleDateString("en-GB")
                      ) : (
                        "-"
                      )}
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
                    <td className="px-4 py-3">
                      {editingId === sale._id ? (
                        <input
                          type="text"
                          value={editForm.note}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, note: e.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        />
                      ) : (
                        sale.note || "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === sale._id ? (
                        <div className="flex justify-end gap-2">
                          <LoadingButton
                            type="button"
                            onClick={saveEdit}
                            loading={savingId === sale._id}
                            loadingText="Saving..."
                            className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                          >
                            Save
                          </LoadingButton>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
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
                      )}
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
      </div>
    </section>
  );
};

export default Supplements;
