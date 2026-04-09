import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/fetchData";
import { LoadingButton } from "../../components";

const dashboardFilterFieldClass = "flex flex-col gap-1";
const dashboardFilterInputClass =
  "h-10 rounded-xl border border-gray-700 bg-gray-900 px-3 text-sm text-white outline-none transition-all focus:border-blue-500";

const Expenses = () => {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: "",
    note: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    amount: "",
    date: "",
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
    setRange({ startDate: start, endDate: end });
    setForm((prev) => ({ ...prev, date: end }));
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil(total / limit), 1);
  }, [total, limit]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        startDate: range.startDate,
        endDate: range.endDate,
        page,
        limit,
      };
      const res = await axios.get(`${BASE_URL}/api/v1/expenses`, { params });
      if (res.data?.success) {
        setExpenses(res.data.expenses || []);
        setTotal(res.data.total || 0);
      } else {
        setError(res.data?.message || "Failed to fetch expenses");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!range.startDate || !range.endDate) return;
    fetchExpenses();
  }, [range, page, limit]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        amount: Number(form.amount || 0),
        date: form.date,
        note: form.note,
      };
      const res = await axios.post(`${BASE_URL}/api/v1/expenses`, payload);
      if (res.data?.success) {
        toast.success("Expense added");
        setForm((prev) => ({ ...prev, name: "", amount: "", note: "" }));
        fetchExpenses();
      } else {
        toast.error(res.data?.message || "Failed to add expense");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      name: expense.name || "",
      amount: expense.amount || "",
      date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : "",
      note: expense.note || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", amount: "", date: "", note: "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingId(editingId);
    try {
      const payload = {
        name: editForm.name,
        amount: Number(editForm.amount || 0),
        date: editForm.date,
        note: editForm.note,
      };
      const res = await axios.put(`${BASE_URL}/api/v1/expenses/${editingId}`, payload);
      if (res.data?.success) {
        toast.success("Expense updated");
        setExpenses((prev) =>
          prev.map((e) => (e._id === editingId ? res.data.expense : e))
        );
        cancelEdit();
      } else {
        toast.error(res.data?.message || "Failed to update expense");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update expense");
    } finally {
      setSavingId("");
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    setDeletingId(expenseId);
    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/expenses/${expenseId}`);
      if (res.data?.success) {
        toast.success("Expense deleted");
        setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
      } else {
        toast.error(res.data?.message || "Failed to delete expense");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="py-16 bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Expenses</h2>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-800/95 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,0.9fr)_minmax(180px,0.9fr)] xl:items-end">
            <div className={dashboardFilterFieldClass}>
              <label className="text-gray-300 text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={range.startDate}
                onChange={(e) =>
                  setRange((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className={dashboardFilterInputClass}
              />
            </div>
            <div className={dashboardFilterFieldClass}>
              <label className="text-gray-300 text-sm mb-1">End Date</label>
              <input
                type="date"
                value={range.endDate}
                onChange={(e) =>
                  setRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className={dashboardFilterInputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-md mb-6">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" onSubmit={handleSubmit}>
            <input
              id="name"
              type="text"
              placeholder="Expense name"
              value={form.name}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
              required
            />
            <input
              id="amount"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
              required
            />
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
              required
            />
            <input
              id="note"
              type="text"
              placeholder="Note"
              value={form.note}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <LoadingButton
              type="submit"
              loading={submitting}
              loadingText="Adding..."
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              Add Expense
            </LoadingButton>
          </form>
        </div>

        {loading && <p className="text-white">Loading expenses...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-gray-800 rounded-md">
            <table className="min-w-full text-left text-sm text-gray-200">
              <thead className="bg-gray-700 text-gray-100">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3">Added By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-300" colSpan={6}>
                      No expenses found
                    </td>
                  </tr>
                )}
                {expenses.map((e) => (
                  <tr key={e._id} className="border-b border-gray-700">
                    <td className="px-4 py-3">
                      {editingId === e._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, name: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        />
                      ) : (
                        e.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === e._id ? (
                        <input
                          type="number"
                          value={editForm.amount}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, amount: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-28"
                        />
                      ) : (
                        e.amount
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === e._id ? (
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, date: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700"
                        />
                      ) : (
                        e.date ? new Date(e.date).toLocaleDateString() : "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === e._id ? (
                        <input
                          type="text"
                          value={editForm.note}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, note: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        />
                      ) : (
                        e.note || "-"
                      )}
                    </td>
                    <td className="px-4 py-3">{e.createdBy?.name || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      {editingId === e._id ? (
                        <div className="space-x-2">
                          <LoadingButton
                            type="button"
                            onClick={saveEdit}
                            loading={savingId === e._id}
                            loadingText="Saving..."
                            className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                          >
                            Save
                          </LoadingButton>
                          <button
                            onClick={cancelEdit}
                            type="button"
                            className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="space-x-2">
                          <button
                            onClick={() => startEdit(e)}
                            className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-all"
                          >
                            Edit
                          </button>
                          <LoadingButton
                            type="button"
                            onClick={() => handleDelete(e._id)}
                            loading={deletingId === e._id}
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

export default Expenses;
