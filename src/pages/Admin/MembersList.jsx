import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/fetchData";
import { jsPDF } from "jspdf";

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingHistoryIndex, setEditingHistoryIndex] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payMember, setPayMember] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "",
    membershipType: "",
    personalTrainer: "",
    minRemaining: "",
    maxRemaining: "",
    minFee: "",
    maxFee: "",
    minPaid: "",
    maxPaid: "",
    startFrom: "",
    startTo: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        ...filters,
        page,
        limit,
      };
      const res = await axios.get(`${BASE_URL}/api/v1/members`, { params });
      if (res.data?.success) {
        setMembers(res.data.members || []);
        setTotal(res.data.total || 0);
      } else {
        setError(res.data?.message || "Failed to fetch members");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/members/${memberId}`);
      if (res.data?.success) {
        toast.success("Member deleted");
        setMembers((prev) => prev.filter((m) => m._id !== memberId));
      } else {
        toast.error(res.data?.message || "Failed to delete member");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete member");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [filters, page, limit]);

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil(total / limit), 1);
  }, [total, limit]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      paymentStatus: "",
      membershipType: "",
      personalTrainer: "",
      minRemaining: "",
      maxRemaining: "",
      minFee: "",
      maxFee: "",
      minPaid: "",
      maxPaid: "",
      startFrom: "",
      startTo: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPage(1);
    setLimit(20);
  };

  const openHistory = (member) => {
    setSelectedMember(member);
    setIsHistoryOpen(true);
  };

  const closeHistory = () => {
    setIsHistoryOpen(false);
    setSelectedMember(null);
    setEditingHistoryIndex(null);
    setEditAmount("");
    setEditNote("");
  };

  const openPay = (member) => {
    setPayMember(member);
    setPayAmount("");
    setPayNote("");
    setIsPayOpen(true);
  };

  const closePay = () => {
    setIsPayOpen(false);
    setPayMember(null);
    setPayAmount("");
    setPayNote("");
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  const formatMonthRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "-";
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";
    const startLabel = start.toLocaleString(undefined, { month: "short", year: "numeric" });
    const endLabel = end.toLocaleString(undefined, { month: "short", year: "numeric" });
    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
  };

  const formatAllocationRanges = (allocations) => {
    if (!Array.isArray(allocations) || allocations.length === 0) return "-";
    const labels = allocations
      .map((a) => formatMonthRange(a.startDate, a.endDate))
      .filter((v) => v && v !== "-");
    return labels.length ? labels.join(", ") : "-";
  };

  const gymInfo = {
    name: import.meta.env.VITE_GYM_NAME || "SR Fitness Gym",
    address: import.meta.env.VITE_GYM_ADDRESS || "",
    phone: import.meta.env.VITE_GYM_PHONE || "",
  };

  const buildPayslip = (member, payment) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const left = 14;
  const right = pageWidth - 14;
  let y = 16;

  // ===== Header =====
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(gymInfo.name, left, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (gymInfo.address) doc.text(gymInfo.address, left, y + 6);
  if (gymInfo.phone) doc.text(`Phone: ${gymInfo.phone}`, left, y + 11);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", right, y, { align: "right" });

  y += 18;

  // Divider
  doc.setDrawColor(180);
  doc.line(left, y, right, y);
  y += 10;

  // ===== Data preparation =====
  const cycleLabel = formatAllocationRanges(payment.allocations);
  const paymentDate = formatDateTime(payment.at);
  const receivedBy = payment.by?.name || "Unknown";

  const cycles = Array.isArray(member.paymentCycles) ? member.paymentCycles : [];
  const currentCycle = cycles.length ? cycles[cycles.length - 1] : null;

  const totalOutstanding = Number(member.remainingAmount || 0);
  const currentRemaining = currentCycle
    ? Number(currentCycle.remainingAmount || 0)
    : 0;

  const carryForward = Math.max(totalOutstanding - currentRemaining, 0);

  // ===== Section helper =====
  const labelValue = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, left, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value ?? "-"), left + 50, y);
    y += 7;
  };

  // ===== Member Details =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Member Details", left, y);
  y += 6;

  doc.setFontSize(11);
  labelValue("Name:", member.name);
  labelValue("Phone:", member.phone);
  labelValue("Email:", member.email);

  y += 4;
  doc.line(left, y, right, y);
  y += 8;

  // ===== Payment Details =====
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", left, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  labelValue("Cycle Period:", cycleLabel);
  // labelValue("Amount Paid:", `₹${payment.amount ?? 0}`);
  labelValue("Amount Paid:", `Rs.${payment.amount ?? 0}`);
  labelValue("Payment Date:", paymentDate);
  labelValue("Received By:", receivedBy);

  y += 4;
  doc.line(left, y, right, y);
  y += 8;

  // ===== Outstanding Summary =====
  doc.setFont("helvetica", "bold");
  doc.text("Outstanding Summary", left, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  labelValue("Previous Due:", `Rs.${carryForward ?? 0}`);
  labelValue("Current Outstanding:", `Rs.${currentRemaining}`);
  labelValue("Total Outstanding:", `Rs.${totalOutstanding}`);

  // ===== Footer =====
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "Thank you for your payment. Please keep this receipt for your records.",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // Reset color
  doc.setTextColor(0);

  // ===== Save =====
  const filename = `payslip_${member.name || "member"}_${payment.at || "date"}.pdf`;
    doc.save(filename.replace(/\s+/g, "_"));
  };

  const normalizePhone = (phone) => {
    if (!phone) return "";
    let digits = String(phone).replace(/[^\d]/g, "");
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (digits.startsWith("91") && digits.length === 12) return digits;
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const openWhatsApp = (member, payment) => {
    const phone = normalizePhone(member?.phone);
    if (!phone) {
      toast.error("Member phone number not available");
      return;
    }
    const cycleLabel = formatAllocationRanges(payment.allocations);
    const paymentDate = formatDateTime(payment.at);
    const receivedBy = payment.by?.name || "Unknown";
    const totalOutstanding = Number(member.remainingAmount || 0);
    const message =
      `Payment Receipt\n` +
      `Member: ${member.name || "-"}\n` +
      `Cycle: ${cycleLabel}\n` +
      `Amount: ${payment.amount ?? 0}\n` +
      `Date: ${paymentDate}\n` +
      `Received By: ${receivedBy}\n` +
      `Outstanding: ${totalOutstanding}\n\n` +
      `Please attach the PDF payslip in WhatsApp.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };


  const startEditHistory = (index, amount) => {
    setEditingHistoryIndex(index);
    setEditAmount(amount ?? 0);
    setEditNote("");
  };

  const cancelEditHistory = () => {
    setEditingHistoryIndex(null);
    setEditAmount("");
    setEditNote("");
  };

  const saveEditHistory = async (index) => {
    if (!selectedMember?._id) return;
    try {
      const payload = {
        historyIndex: index,
        newAmount: Number(editAmount || 0),
        note: editNote,
      };
      const res = await axios.put(
        `${BASE_URL}/api/v1/members/${selectedMember._id}/payment-history`,
        payload
      );
      if (res.data?.success) {
        toast.success("Payment updated");
        setSelectedMember(res.data.member);
        setMembers((prev) =>
          prev.map((m) => (m._id === res.data.member._id ? res.data.member : m))
        );
        cancelEditHistory();
      } else {
        toast.error(res.data?.message || "Failed to update payment");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payment");
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!payMember?._id) return;
    try {
      const payload = { amount: Number(payAmount || 0), note: payNote };
      const res = await axios.post(
        `${BASE_URL}/api/v1/members/${payMember._id}/pay`,
        payload
      );
      if (res.data?.success) {
        toast.success("Payment added");
        setMembers((prev) =>
          prev.map((m) => (m._id === res.data.member._id ? res.data.member : m))
        );
        closePay();
      } else {
        toast.error(res.data?.message || "Failed to add payment");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add payment");
    }
  };

  return (
    <section className="py-16 bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Members</h2>
          <Link
            to="/dashboard/admin/add-member"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            Add Member
          </Link>
        </div>

        <div className="bg-gray-800 p-4 rounded-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              id="search"
              type="text"
              placeholder="Search name/email/phone/trainer"
              value={filters.search}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <select
              id="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            >
              <option value="">Payment Status (All)</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Free Trial">Free Trial</option>
            </select>
            <select
              id="membershipType"
              value={filters.membershipType}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            >
              <option value="">Membership Type (All)</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
            <select
              id="personalTrainer"
              value={filters.personalTrainer}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            >
              <option value="">Trainer (All)</option>
              <option value="Assigned">Assigned</option>
              <option value="Not Assigned">Not Assigned</option>
            </select>

            <input
              id="minFee"
              type="number"
              placeholder="Min Fee"
              value={filters.minFee}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <input
              id="maxFee"
              type="number"
              placeholder="Max Fee"
              value={filters.maxFee}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <input
              id="minPaid"
              type="number"
              placeholder="Min Paid"
              value={filters.minPaid}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <input
              id="maxPaid"
              type="number"
              placeholder="Max Paid"
              value={filters.maxPaid}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />

            <input
              id="minRemaining"
              type="number"
              placeholder="Min Remaining"
              value={filters.minRemaining}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <input
              id="maxRemaining"
              type="number"
              placeholder="Max Remaining"
              value={filters.maxRemaining}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <input
              id="startFrom"
              type="date"
              value={filters.startFrom}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />
            <input
              id="startTo"
              type="date"
              value={filters.startTo}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            />

            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            >
              <option value="createdAt">Sort By (Created)</option>
              <option value="name">Name</option>
              <option value="fee">Fee</option>
              <option value="paidAmount">Paid</option>
              <option value="remainingAmount">Remaining</option>
              <option value="startDate">Start Date</option>
            </select>
            <select
              id="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            >
              <option value="desc">Sort Order (Desc)</option>
              <option value="asc">Asc</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-200 text-sm">
              Total: {total}
            </div>
            <div className="space-x-2">
              <button
                onClick={resetFilters}
                className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading && <p className="text-white">Loading members...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-gray-800 rounded-md">
            <table className="min-w-full text-left text-sm text-gray-200">
              <thead className="bg-gray-700 text-gray-100">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">Cycle</th>
                  <th className="px-4 py-3">Last Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-300" colSpan={12}>
                      No members found
                    </td>
                  </tr>
                )}
                {members.map((m) => (
                  (() => {
                    const lastPayment =
                      m.lastPayment ||
                      (Array.isArray(m.paymentHistory) && m.paymentHistory.length
                        ? m.paymentHistory[m.paymentHistory.length - 1]
                        : null);
                    const lastPaymentLabel = lastPayment
                      ? `${lastPayment.amount ?? 0} • ${formatDateTime(lastPayment.at)} • ${lastPayment.by?.name || "Unknown"} • ${formatAllocationRanges(lastPayment.allocations)}`
                      : "-";
                    const cycles = Array.isArray(m.paymentCycles) ? m.paymentCycles : [];
                    const currentCycle = cycles.length ? cycles[cycles.length - 1] : null;
                    const cycleLabel = currentCycle
                      ? formatMonthRange(currentCycle.startDate, currentCycle.endDate)
                      : "-";
                    return (
                  <tr key={m._id} className="border-b border-gray-700">
                    <td className="px-4 py-3">{m.name}</td>
                    <td className="px-4 py-3">{m.phone}</td>
                    <td className="px-4 py-3">{m.email || "-"}</td>
                    <td className="px-4 py-3">{m.membershipType}</td>
                    <td className="px-4 py-3">{m.fee ?? 0}</td>
                    <td className="px-4 py-3">{m.paidAmount ?? 0}</td>
                    <td className="px-4 py-3">
                      {m.remainingAmount ?? Math.max((m.fee || 0) - (m.paidAmount || 0), 0)}
                    </td>
                    <td className="px-4 py-3">{m.paymentStatus}</td>
                    <td className="px-4 py-3">
                      {m.startDate ? new Date(m.startDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">{cycleLabel}</td>
                    <td className="px-4 py-3">{lastPaymentLabel}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        to={`/dashboard/admin/members/${m._id}`}
                        className="inline-block px-3 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-400 transition-all"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => openPay(m)}
                        className="inline-block px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                      >
                        Pay
                      </button>
                      <button
                        onClick={() => openHistory(m)}
                        className="inline-block px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-all"
                      >
                        History
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="inline-block px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                    );
                  })()
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

      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 text-gray-100 w-full max-w-3xl rounded-lg shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4">
              <div className="text-lg font-semibold">
                Payment History {selectedMember?.name ? `• ${selectedMember.name}` : ""}
              </div>
              <button
                onClick={closeHistory}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {(!selectedMember?.paymentHistory || selectedMember.paymentHistory.length === 0) && (
                <div className="text-gray-300">No payment history</div>
              )}
              {selectedMember?.paymentHistory && selectedMember.paymentHistory.length > 0 && (
                <table className="min-w-full text-left text-sm text-gray-200">
                  <thead className="bg-gray-800 text-gray-100">
                    <tr>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Cycle</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Received By</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Note</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMember.paymentHistory.map((p, idx) => (
                      <tr key={`${p.at || "row"}-${idx}`} className="border-b border-gray-800">
                        <td className="px-3 py-2">
                          {editingHistoryIndex === idx ? (
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="p-1 rounded bg-gray-800 border border-gray-700 w-24"
                            />
                          ) : (
                            p.amount ?? 0
                          )}
                        </td>
                        <td className="px-3 py-2">{formatAllocationRanges(p.allocations)}</td>
                        <td className="px-3 py-2">{formatDateTime(p.at)}</td>
                        <td className="px-3 py-2">{p.by?.name || "Unknown"}</td>
                        <td className="px-3 py-2">{p.paymentStatus || "-"}</td>
                        <td className="px-3 py-2">
                          {editingHistoryIndex === idx ? (
                            <input
                              type="text"
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="p-1 rounded bg-gray-800 border border-gray-700 w-40"
                              placeholder="Note"
                            />
                          ) : (
                            p.note || "-"
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {p.type === "payment" && (
                            <>
                              {editingHistoryIndex === idx ? (
                                <div className="space-x-2">
                                  <button
                                    onClick={() => saveEditHistory(idx)}
                                    className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditHistory}
                                    className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="space-x-2">
                                  <button
                                    onClick={() => startEditHistory(idx, p.amount)}
                                    className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-all"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => buildPayslip(selectedMember, p)}
                                    className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
                                  >
                                    Payslip
                                  </button>
                                  <button
                                    onClick={() => openWhatsApp(selectedMember, p)}
                                    className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                                  >
                                    WhatsApp
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {isPayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 text-gray-100 w-full max-w-md rounded-lg shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4">
              <div className="text-lg font-semibold">
                Add Payment {payMember?.name ? `• ${payMember.name}` : ""}
              </div>
              <button
                onClick={closePay}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
            <form onSubmit={submitPayment} className="p-5 space-y-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="p-2 rounded bg-gray-800 border border-gray-700"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-300 mb-1">Note</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="p-2 rounded bg-gray-800 border border-gray-700"
                  placeholder="Optional"
                />
              </div>
              <button
                type="submit"
                className="w-full px-3 py-2 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
              >
                Submit Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default MembersList;
