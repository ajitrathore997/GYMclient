import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/fetchData";

const statusOptions = [
  "New",
  "Contacted",
  "Interested",
  "Not Interested",
  "Joined",
  "Follow Up",
];

const Inquiries = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "",
    status: "New",
    nextFollowUpDate: "",
    note: "",
  });
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "",
    status: "New",
    nextFollowUpDate: "",
    note: "",
    lastContactedAt: "",
  });
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpInquiry, setFollowUpInquiry] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({
    date: "",
    note: "",
    status: "Planned",
  });

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil(total / limit), 1);
  }, [total, limit]);

  const fetchInquiries = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        status: filters.status,
        search: filters.search,
        page,
        limit,
      };
      const res = await axios.get(`${BASE_URL}/api/v1/inquiries`, { params });
      if (res.data?.success) {
        setInquiries(res.data.inquiries || []);
        setTotal(res.data.total || 0);
      } else {
        setError(res.data?.message || "Failed to fetch inquiries");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [filters, page, limit]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        nextFollowUpDate: form.nextFollowUpDate || undefined,
      };
      const res = await axios.post(`${BASE_URL}/api/v1/inquiries`, payload);
      if (res.data?.success) {
        toast.success("Inquiry added");
        setForm({
          name: "",
          phone: "",
          email: "",
          source: "",
          status: "New",
          nextFollowUpDate: "",
          note: "",
        });
        fetchInquiries();
      } else {
        toast.error(res.data?.message || "Failed to add inquiry");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add inquiry");
    }
  };

  const startEdit = (inq) => {
    setEditingId(inq._id);
    setEditForm({
      name: inq.name || "",
      phone: inq.phone || "",
      email: inq.email || "",
      source: inq.source || "",
      status: inq.status || "New",
      nextFollowUpDate: inq.nextFollowUpDate
        ? new Date(inq.nextFollowUpDate).toISOString().slice(0, 10)
        : "",
      note: inq.note || "",
      lastContactedAt: inq.lastContactedAt
        ? new Date(inq.lastContactedAt).toISOString().slice(0, 10)
        : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      phone: "",
      email: "",
      source: "",
      status: "New",
      nextFollowUpDate: "",
      note: "",
      lastContactedAt: "",
    });
  };

  const saveEdit = async () => {
    try {
      const payload = {
        ...editForm,
        nextFollowUpDate: editForm.nextFollowUpDate || undefined,
        lastContactedAt: editForm.lastContactedAt || undefined,
      };
      const res = await axios.put(`${BASE_URL}/api/v1/inquiries/${editingId}`, payload);
      if (res.data?.success) {
        toast.success("Inquiry updated");
        setInquiries((prev) =>
          prev.map((i) => (i._id === editingId ? res.data.inquiry : i))
        );
        cancelEdit();
      } else {
        toast.error(res.data?.message || "Failed to update inquiry");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update inquiry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/inquiries/${id}`);
      if (res.data?.success) {
        toast.success("Inquiry deleted");
        setInquiries((prev) => prev.filter((i) => i._id !== id));
      } else {
        toast.error(res.data?.message || "Failed to delete inquiry");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete inquiry");
    }
  };

  const openFollowUps = (inq) => {
    setFollowUpInquiry(inq);
    setIsFollowUpOpen(true);
    const today = new Date().toISOString().slice(0, 10);
    setFollowUpForm({ date: today, note: "", status: "Planned" });
  };

  const closeFollowUps = () => {
    setIsFollowUpOpen(false);
    setFollowUpInquiry(null);
  };

  const addFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpInquiry?._id) return;
    try {
      const payload = {
        followUp: {
          date: followUpForm.date,
          note: followUpForm.note,
          status: followUpForm.status,
        },
      };
      const res = await axios.put(
        `${BASE_URL}/api/v1/inquiries/${followUpInquiry._id}`,
        payload
      );
      if (res.data?.success) {
        toast.success("Follow-up added");
        setInquiries((prev) =>
          prev.map((i) => (i._id === followUpInquiry._id ? res.data.inquiry : i))
        );
        setFollowUpInquiry(res.data.inquiry);
        setFollowUpForm({ date: followUpForm.date, note: "", status: "Planned" });
      } else {
        toast.error(res.data?.message || "Failed to add follow-up");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add follow-up");
    }
  };

  return (
    <section className="py-16 bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Inquiries</h2>
        </div>

        <div className="bg-gray-800 p-4 rounded-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              id="search"
              type="text"
              placeholder="Search name/phone/email"
              value={filters.search}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <select
              id="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            >
              <option value="">Status (All)</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-md mb-6">
          <form
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            onSubmit={handleSubmit}
          >
            <input
              id="name"
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
              required
            />
            <input
              id="phone"
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
              required
            />
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <input
              id="source"
              type="text"
              placeholder="Source (walk-in, call, social)"
              value={form.source}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <select
              id="status"
              value={form.status}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              id="nextFollowUpDate"
              type="date"
              value={form.nextFollowUpDate}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <input
              id="note"
              type="text"
              placeholder="Note"
              value={form.note}
              onChange={handleChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              Add Inquiry
            </button>
          </form>
        </div>

        {loading && <p className="text-white">Loading inquiries...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-gray-800 rounded-md">
            <table className="min-w-full text-left text-sm text-gray-200">
              <thead className="bg-gray-700 text-gray-100">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Next Follow-up</th>
                  <th className="px-4 py-3">Last Contacted</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-300" colSpan={7}>
                      No inquiries found
                    </td>
                  </tr>
                )}
                {inquiries.map((i) => (
                  <tr key={i._id} className="border-b border-gray-700">
                    <td className="px-4 py-3">
                      {editingId === i._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, name: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        />
                      ) : (
                        i.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === i._id ? (
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, phone: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        />
                      ) : (
                        i.phone
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === i._id ? (
                        <select
                          value={editForm.status}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, status: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        i.status
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === i._id ? (
                        <input
                          type="date"
                          value={editForm.nextFollowUpDate}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, nextFollowUpDate: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700"
                        />
                      ) : i.nextFollowUpDate ? (
                        new Date(i.nextFollowUpDate).toLocaleDateString()
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === i._id ? (
                        <input
                          type="date"
                          value={editForm.lastContactedAt}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, lastContactedAt: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700"
                        />
                      ) : i.lastContactedAt ? (
                        new Date(i.lastContactedAt).toLocaleDateString()
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === i._id ? (
                        <input
                          type="text"
                          value={editForm.note}
                          onChange={(ev) =>
                            setEditForm((prev) => ({ ...prev, note: ev.target.value }))
                          }
                          className="p-1 rounded bg-gray-800 border border-gray-700 w-full"
                        />
                      ) : (
                        i.note || "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === i._id ? (
                        <div className="space-x-2">
                          <button
                            onClick={saveEdit}
                            className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="space-x-2">
                          <button
                            onClick={() => startEdit(i)}
                            className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openFollowUps(i)}
                            className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
                          >
                            Follow Ups
                          </button>
                          <button
                            onClick={() => handleDelete(i._id)}
                            className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition-all"
                          >
                            Delete
                          </button>
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

      {isFollowUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 text-gray-100 w-full max-w-3xl rounded-lg shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4">
              <div className="text-lg font-semibold">
                Follow Ups {followUpInquiry?.name ? `• ${followUpInquiry.name}` : ""}
              </div>
              <button
                onClick={closeFollowUps}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
            <div className="p-5 space-y-5">
              <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={addFollowUp}>
                <input
                  type="date"
                  value={followUpForm.date}
                  onChange={(e) =>
                    setFollowUpForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="p-2 rounded bg-gray-800 border border-gray-700"
                  required
                />
                <select
                  value={followUpForm.status}
                  onChange={(e) =>
                    setFollowUpForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="p-2 rounded bg-gray-800 border border-gray-700"
                >
                  <option>Planned</option>
                  <option>Done</option>
                  <option>Missed</option>
                </select>
                <input
                  type="text"
                  placeholder="Note"
                  value={followUpForm.note}
                  onChange={(e) =>
                    setFollowUpForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="p-2 rounded bg-gray-800 border border-gray-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-all"
                >
                  Add Follow Up
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-200">
                  <thead className="bg-gray-800 text-gray-100">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Note</th>
                      <th className="px-3 py-2">By</th>
                      <th className="px-3 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(followUpInquiry?.followUps || []).length === 0 && (
                      <tr>
                        <td className="px-3 py-4 text-center text-gray-300" colSpan={5}>
                          No follow ups
                        </td>
                      </tr>
                    )}
                    {(followUpInquiry?.followUps || [])
                      .slice()
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((f, idx) => (
                        <tr key={`${f.createdAt || "row"}-${idx}`} className="border-b border-gray-800">
                          <td className="px-3 py-2">
                            {f.date ? new Date(f.date).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-3 py-2">{f.status || "-"}</td>
                          <td className="px-3 py-2">{f.note || "-"}</td>
                          <td className="px-3 py-2">{f.by?.name || "-"}</td>
                          <td className="px-3 py-2">
                            {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Inquiries;
