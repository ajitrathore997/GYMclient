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
  const [isCycleOpen, setIsCycleOpen] = useState(false);
  const [editingHistoryIndex, setEditingHistoryIndex] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editMonth, setEditMonth] = useState("");
  const [editMode, setEditMode] = useState("Cash");
  const [editDate, setEditDate] = useState("");
  const [editPromiseDate, setEditPromiseDate] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustMonth, setAdjustMonth] = useState("");
  const [adjustMode, setAdjustMode] = useState("Cash");
  const [editingStatusIndex, setEditingStatusIndex] = useState(null);
  const [editStatus, setEditStatus] = useState("Paid");
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payMember, setPayMember] = useState(null);
  const [isMember360Open, setIsMember360Open] = useState(false);
  const [member360Loading, setMember360Loading] = useState(false);
  const [member360Data, setMember360Data] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [payDate, setPayDate] = useState("");
  const [payMonth, setPayMonth] = useState("");
  const [payMode, setPayMode] = useState("Cash");
  const [promiseDate, setPromiseDate] = useState("");
  const [payMonthOptions, setPayMonthOptions] = useState([]);
  const [listType, setListType] = useState("all");

  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "",
    memberStatus: "",
    reminderStatus: "",
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
        listType,
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
  }, [filters, listType, page, limit]);

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil(total / limit), 1);
  }, [total, limit]);

  const parseMonthLabel = (label) => {
    if (!label) return null;
    const parsed = new Date(`01 ${label}`);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  };

  const formatMonthLabel = (d) =>
    d.toLocaleString(undefined, { month: "long", year: "numeric" });

  const toInputDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const buildMonthOptionsForMember = (member) => {
    const now = new Date();
    const activation = member?.activationDate || member?.startDate;
    const start = activation ? new Date(activation) : new Date(now.getFullYear(), now.getMonth() - 24, 1);
    if (Number.isNaN(start.getTime())) {
      return [];
    }
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const horizon = new Date(now.getFullYear(), now.getMonth() + 12, 1);
    const out = [];
    const cursor = new Date(startMonth);
    while (cursor <= horizon) {
      out.push(formatMonthLabel(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return out;
  };

  const getSelectedMonthCycleDue = (member, monthLabel) => {
    if (!member || !monthLabel) return null;
    const target = parseMonthLabel(monthLabel);
    if (!target) return null;
    const activationBase = member.activationDate || member.startDate;
    if (activationBase) {
      const activation = new Date(activationBase);
      if (!Number.isNaN(activation.getTime())) {
        const activationMonth = new Date(activation.getFullYear(), activation.getMonth(), 1);
        if (target < activationMonth) {
          return null;
        }
      }
    }
    const cycles = Array.isArray(member.paymentCycles) ? member.paymentCycles : [];
    const cycle = cycles.find((c) => {
      const s = c?.startDate ? new Date(c.startDate) : null;
      const e = c?.endDate ? new Date(c.endDate) : null;
      if (!s || !e || Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return false;
      const startMonth = new Date(s.getFullYear(), s.getMonth(), 1);
      const endMonth = new Date(e.getFullYear(), e.getMonth(), 1);
      return target >= startMonth && target < endMonth;
    });
    if (cycle) return Number(cycle.remainingAmount || 0);

    // For historical/backfill month entries where future cycles are not materialized yet,
    // use one-cycle fee as due instead of falling back to total outstanding.
    return Number(member.fee || 0);
  };

  const getExpectedFeeForMonth = (member, monthLabel) => {
    if (!member || !monthLabel) return Number(member?.fee || 0);
    const target = parseMonthLabel(monthLabel);
    if (!target) return Number(member?.fee || 0);
    const cycles = Array.isArray(member.paymentCycles) ? member.paymentCycles : [];
    const cycle = cycles.find((c) => {
      const s = c?.startDate ? new Date(c.startDate) : null;
      const e = c?.endDate ? new Date(c.endDate) : null;
      if (!s || !e || Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return false;
      const startMonth = new Date(s.getFullYear(), s.getMonth(), 1);
      const endMonth = new Date(e.getFullYear(), e.getMonth(), 1);
      return target >= startMonth && target < endMonth;
    });
    return Number(cycle?.fee ?? member?.fee ?? 0);
  };

  const getMonthPaymentSummary = (member, monthLabel) => {
    const expectedFee = Number(getExpectedFeeForMonth(member, monthLabel) || 0);
    const history = Array.isArray(member?.paymentHistory) ? member.paymentHistory : [];
    let paid = 0;
    let adjustments = 0;

    const getEntryMonthLabel = (entry) => {
      if (entry?.paymentMonth) return entry.paymentMonth;
      if (entry?.at) {
        const d = new Date(entry.at);
        if (!Number.isNaN(d.getTime())) {
          return d.toLocaleString(undefined, { month: "long", year: "numeric" });
        }
      }
      return "";
    };

    for (const entry of history) {
      if (getEntryMonthLabel(entry) !== monthLabel) continue;
      const amount = Number(entry?.amount || 0);
      if (entry?.type === "adjustment") adjustments += amount;
      if (entry?.type === "payment") paid += amount;
    }

    const settled = paid + adjustments;
    const balance = Math.max(expectedFee - settled, 0);
    return { expectedFee, paid, adjustments, settled, balance };
  };

  const buildMemberLedger = (member) => {
    if (!member) return [];
    const monthSet = new Set();
    const activation = member?.activationDate || member?.startDate || member?.registrationDate || member?.createdAt;
    if (activation) {
      const d = new Date(activation);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        const cursor = new Date(start);
        while (cursor <= end) {
          monthSet.add(formatMonthLabel(cursor));
          cursor.setMonth(cursor.getMonth() + 1);
        }
      }
    }

    const cycles = Array.isArray(member.paymentCycles) ? member.paymentCycles : [];
    for (const c of cycles) {
      const s = c?.startDate ? new Date(c.startDate) : null;
      const e = c?.endDate ? new Date(c.endDate) : null;
      if (!s || !e || Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) continue;
      const cursor = new Date(s.getFullYear(), s.getMonth(), 1);
      const endMonth = new Date(e.getFullYear(), e.getMonth(), 1);
      while (cursor < endMonth) {
        monthSet.add(formatMonthLabel(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    const history = Array.isArray(member.paymentHistory) ? member.paymentHistory : [];
    for (const p of history) {
      if (p?.paymentMonth) monthSet.add(p.paymentMonth);
      else if (p?.at) {
        const d = new Date(p.at);
        if (!Number.isNaN(d.getTime())) {
          monthSet.add(formatMonthLabel(new Date(d.getFullYear(), d.getMonth(), 1)));
        }
      }
    }

    const months = [...monthSet]
      .map((label) => ({ label, date: parseMonthLabel(label) }))
      .filter((x) => x.date)
      .sort((a, b) => a.date - b.date)
      .map((x) => x.label);

    const ledger = [];
    let carryDue = 0;
    for (const month of months) {
      const summary = getMonthPaymentSummary(member, month);
      const dueBefore = Number(summary.expectedFee || 0) + Number(carryDue || 0);
      const settled = Number(summary.paid || 0) + Number(summary.adjustments || 0);
      carryDue = Math.max(dueBefore - settled, 0);
      ledger.push({
        month,
        fee: Number(summary.expectedFee || 0),
        paid: Number(summary.paid || 0),
        adjustment: Number(summary.adjustments || 0),
        carryDue,
        status: carryDue <= 0 ? "Paid" : "Pending",
      });
    }
    return ledger;
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      paymentStatus: "",
      memberStatus: "",
      reminderStatus: "",
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
    const today = new Date().toISOString().slice(0, 10);
    setPayDate(today);
    const options = buildMonthOptionsForMember(member);
    setPayMonthOptions(options);
    setPayMonth(options.includes(new Date().toLocaleString(undefined, { month: "long", year: "numeric" }))
      ? new Date().toLocaleString(undefined, { month: "long", year: "numeric" })
      : (options[options.length - 1] || ""));
    setPayMode("Cash");
    setPromiseDate("");
    setIsPayOpen(true);
  };

  const openCycles = (member) => {
    setSelectedMember(member);
    setIsCycleOpen(true);
  };

  const closeCycles = () => {
    setIsCycleOpen(false);
    setSelectedMember(null);
  };

  const closePay = () => {
    setIsPayOpen(false);
    setPayMember(null);
    setPayAmount("");
    setPayNote("");
    setPayDate("");
    setPayMonth("");
    setPayMode("Cash");
    setPromiseDate("");
    setPayMonthOptions([]);
  };

  const openMember360 = async (member) => {
    if (!member?._id) return;
    setIsMember360Open(true);
    setMember360Loading(true);
    setMember360Data(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/members/${member._id}`);
      if (res.data?.success && res.data?.member) {
        setMember360Data(res.data.member);
      } else {
        toast.error(res.data?.message || "Failed to load member details");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load member details");
    } finally {
      setMember360Loading(false);
    }
  };

  const closeMember360 = () => {
    setIsMember360Open(false);
    setMember360Loading(false);
    setMember360Data(null);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return `${d.toLocaleDateString("en-GB")} ${d.toLocaleTimeString("en-GB")}`;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB");
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
  const cycleLabel = payment.paymentMonth || formatAllocationRanges(payment.allocations);
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
  labelValue("Payment Mode:", payment.paymentMode || "-");
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
    const cycleLabel = payment.paymentMonth || formatAllocationRanges(payment.allocations);
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
      `Outstanding: ${totalOutstanding}\n\n`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };


  const startEditHistory = (index, payment) => {
    setEditingHistoryIndex(index);
    setEditAmount(payment?.amount ?? 0);
    setEditNote(payment?.note || "");
    setEditMonth(payment?.paymentMonth || "");
    setEditMode(payment?.paymentMode || "Cash");
    setEditDate(toInputDate(payment?.at));
    setEditPromiseDate(toInputDate(payment?.promiseDate));
    setEditStatus(payment?.paymentStatus || "Paid");
  };

  const cancelEditHistory = () => {
    setEditingHistoryIndex(null);
    setEditAmount("");
    setEditNote("");
    setEditMonth("");
    setEditMode("Cash");
    setEditDate("");
    setEditPromiseDate("");
  };

  const startEditStatus = (index, status) => {
    setEditingStatusIndex(index);
    setEditStatus(status || "Paid");
  };

  const cancelEditStatus = () => {
    setEditingStatusIndex(null);
    setEditStatus("Paid");
  };

  const submitManualAdjustment = async () => {
    if (!selectedMember?._id) return;
    const delta = Number(adjustAmount || 0);
    if (!delta) {
      toast.error("Enter non-zero adjustment amount");
      return;
    }
    try {
      const res = await axios.put(
        `${BASE_URL}/api/v1/members/${selectedMember._id}/payment-history`,
        {
          adjustmentAmount: delta,
          note: adjustNote,
          paymentMonth: adjustMonth || undefined,
          paymentMode: adjustMode || "Cash",
        }
      );
      if (res.data?.success) {
        toast.success("Manual adjustment saved");
        setSelectedMember(res.data.member);
        setMembers((prev) =>
          prev.map((m) => (m._id === res.data.member._id ? res.data.member : m))
        );
        setAdjustAmount("");
        setAdjustNote("");
        setAdjustMonth("");
        setAdjustMode("Cash");
      } else {
        toast.error(res.data?.message || "Failed to save adjustment");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save adjustment");
    }
  };

  const saveEditHistory = async (index) => {
    if (!selectedMember?._id) return;
    try {
      const payload = {
        historyIndex: index,
        newAmount: Number(editAmount || 0),
        note: editNote,
        paymentMonth: editMonth || undefined,
        paymentMode: editMode || undefined,
        date: editDate || undefined,
        paymentStatus: editStatus || undefined,
        promiseDate: editPromiseDate || null,
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

  const saveEditStatus = async (index) => {
    if (!selectedMember?._id) return;
    try {
      const payload = { paymentStatus: editStatus };
      const res = await axios.put(
        `${BASE_URL}/api/v1/members/${selectedMember._id}/payment-history/${index}/status`,
        payload
      );
      if (res.data?.success) {
        toast.success("Status updated");
        setSelectedMember(res.data.member);
        setMembers((prev) =>
          prev.map((m) => (m._id === res.data.member._id ? res.data.member : m))
        );
        cancelEditStatus();
      } else {
        toast.error(res.data?.message || "Failed to update status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // const deletePaymentHistory = async (index) => {
  //   if (!selectedMember?._id) return;
  //   if (!window.confirm("Delete this payment entry?")) return;
  //   try {
  //     const res = await axios.delete(
  //       `${BASE_URL}/api/v1/members/${selectedMember._id}/payment-history/${index}`
  //     );
  //     if (res.data?.success) {
  //       toast.success("Payment deleted");
  //       setSelectedMember(res.data.member);
  //       setMembers((prev) =>
  //         prev.map((m) => (m._id === res.data.member._id ? res.data.member : m))
  //       );
  //     } else {
  //       toast.error(res.data?.message || "Failed to delete payment");
  //     }
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Failed to delete payment");
  //   }
  // };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!payMember?._id) return;
    const monthSummary = getMonthPaymentSummary(payMember, payMonth);
    const monthCycleDue = getSelectedMonthCycleDue(payMember, payMonth);
    const dueAmount = Number(
      monthSummary?.balance ??
      monthCycleDue ??
      payMember?.dueNowAmount ??
      payMember?.remainingAmount ??
      0
    );
    const enteredAmount = Number(payAmount || 0);
    const needsPromiseDate = enteredAmount > 0 && enteredAmount < dueAmount;
    try {
      const payload = {
        amount: enteredAmount,
        note: payNote,
        date: payDate,
        paymentMonth: payMonth,
        paymentMode: payMode,
        promiseDate: needsPromiseDate ? promiseDate || undefined : undefined,
      };
      const res = await axios.post(
        `${BASE_URL}/api/v1/members/${payMember._id}/pay`,
        payload
      );
      if (res.data?.success) {
        toast.success("Payment added");
        fetchMembers();
        closePay();
      } else {
        toast.error(res.data?.message || "Failed to add payment");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add payment");
    }
  };

  const updateMemberStatus = async (member, nextStatus) => {
    if (!member?._id) return;
    try {
      const res = await axios.put(`${BASE_URL}/api/v1/members/${member._id}/status`, {
        memberStatus: nextStatus,
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Member status updated");
        fetchMembers();
      } else {
        toast.error(res.data?.message || "Failed to update member status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update member status");
    }
  };

  const payMonthSummary = getMonthPaymentSummary(payMember, payMonth);
  const payBalanceAfter = Math.max(
    Number(payMonthSummary?.balance || 0) - Number(payAmount || 0),
    0
  );
  const memberLedger = buildMemberLedger(selectedMember);

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

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setPage(1);
              setListType("all");
            }}
            className={`px-3 py-2 rounded-md text-sm transition-all ${listType === "all" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
          >
            All Members
          </button>
          <button
            onClick={() => {
              setPage(1);
              setListType("active");
            }}
            className={`px-3 py-2 rounded-md text-sm transition-all ${listType === "active" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
          >
            Active Members
          </button>
          <button
            onClick={() => {
              setPage(1);
              setListType("reminder");
            }}
            className={`px-3 py-2 rounded-md text-sm transition-all ${listType === "reminder" ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
          >
            Payment Reminders
          </button>
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
              id="memberStatus"
              value={filters.memberStatus}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            >
              <option value="">Member Status (All)</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              id="reminderStatus"
              value={filters.reminderStatus}
              onChange={handleFilterChange}
              className="p-2 rounded-md outline-none w-full"
            >
              <option value="">Reminder (All)</option>
              <option value="None">None</option>
              <option value="Promised">Promised to Pay</option>
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
              <option value="activationDate">Activation Date</option>
              <option value="registrationDate">Registration Date</option>
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
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Activation</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Last Month</th>
                  <th className="px-4 py-3">Last Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-300" colSpan={16}>
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
                      ? `${lastPayment.amount ?? 0} • ${lastPayment.paymentMonth || "-"} • ${formatDateTime(lastPayment.at)} • ${lastPayment.by?.name || "Unknown"}`
                      : "-";
                    const cycles = Array.isArray(m.paymentCycles) ? m.paymentCycles : [];
                    const currentCycle = cycles.length ? cycles[cycles.length - 1] : null;
                    const expiryLabel = m.expiryDate
                      ? formatDate(m.expiryDate)
                      : formatDate(currentCycle?.endDate);
                    return (
                  <tr key={m._id} className="border-b border-gray-700">
                    <td className="px-4 py-3">
                      {m.profilePic ? (
                        <img
                          src={m.profilePic}
                          alt={m.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{m.name}</td>
                    <td className="px-4 py-3">{m.phone}</td>
                    <td className="px-4 py-3">{m.email || "-"}</td>
                    <td className="px-4 py-3">{m.membershipType}</td>
                    <td className="px-4 py-3">{m.fee ?? 0}</td>
                    <td className="px-4 py-3">{m.paidAmount ?? 0}</td>
                    <td className="px-4 py-3">
                      {m.dueNowAmount ?? m.remainingAmount ?? Math.max((m.fee || 0) - (m.paidAmount || 0), 0)}
                    </td>
                    <td className="px-4 py-3">{m.displayPaymentStatus || m.paymentStatus}</td>
                    <td className="px-4 py-3">{m.memberStatus || "Active"}</td>
                    <td className="px-4 py-3">
                      {formatDate(m.registrationDate)}
                    </td>
                    <td className="px-4 py-3">
                      {(m.activationDate || m.startDate)
                        ? formatDate(m.activationDate || m.startDate)
                        : "-"}
                    </td>
                    <td className="px-4 py-3">{expiryLabel}</td>
                    <td className="px-4 py-3">{m.lastPaymentMonth || "-"}</td>
                    <td className="px-4 py-3">{lastPaymentLabel}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          to={`/dashboard/admin/members/${m._id}`}
                          className="inline-flex items-center justify-center px-3 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-400 transition-all"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => openMember360(m)}
                          className="inline-flex items-center justify-center px-3 py-1 rounded bg-cyan-700 text-white hover:bg-cyan-600 transition-all"
                        >
                          360
                        </button>
                        <button
                          onClick={() => openPay(m)}
                          className="inline-flex items-center justify-center px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                        >
                          Pay
                        </button>
                        <button
                          onClick={() => openHistory(m)}
                          className="inline-flex items-center justify-center px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-all"
                        >
                          History
                        </button>
                        <button
                          onClick={() => openCycles(m)}
                          className="inline-flex items-center justify-center px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
                        >
                          Cycles
                        </button>
                        {m.memberStatus === "Inactive" ? (
                          <button
                            onClick={() => updateMemberStatus(m, "Active")}
                            className="inline-flex items-center justify-center px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-all"
                          >
                            Mark Active
                          </button>
                        ) : (
                          <button
                            onClick={() => updateMemberStatus(m, "Inactive")}
                            className="inline-flex items-center justify-center px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-500 transition-all"
                          >
                            Mark Inactive
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="inline-flex items-center justify-center px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition-all"
                        >
                          Delete
                        </button>
                      </div>
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
              <div className="mb-4 p-3 rounded border border-gray-700 bg-gray-800/60">
                <div className="text-sm font-semibold text-white mb-2">Member Ledger (Month-wise)</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs text-gray-200">
                    <thead className="bg-gray-800 text-gray-100">
                      <tr>
                        <th className="px-2 py-2">Month</th>
                        <th className="px-2 py-2">Month Fee</th>
                        <th className="px-2 py-2">Paid</th>
                        <th className="px-2 py-2">Adjustment</th>
                        <th className="px-2 py-2">Carry Due</th>
                        <th className="px-2 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberLedger.slice(-18).map((row) => (
                        <tr key={row.month} className="border-b border-gray-800">
                          <td className="px-2 py-2">{row.month}</td>
                          <td className="px-2 py-2">{row.fee}</td>
                          <td className="px-2 py-2">{row.paid}</td>
                          <td className="px-2 py-2">{row.adjustment}</td>
                          <td className="px-2 py-2">{row.carryDue}</td>
                          <td className="px-2 py-2">{row.status}</td>
                        </tr>
                      ))}
                      {memberLedger.length === 0 && (
                        <tr>
                          <td className="px-2 py-2 text-gray-400" colSpan={6}>
                            No ledger data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mb-4 p-3 rounded border border-gray-700 bg-gray-800/60">
                <div className="text-sm font-semibold text-white mb-2">Manual Adjustment</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="p-2 rounded bg-gray-900 border border-gray-700"
                    placeholder="+ credit / - debit"
                  />
                  <input
                    type="text"
                    value={adjustMonth}
                    onChange={(e) => setAdjustMonth(e.target.value)}
                    className="p-2 rounded bg-gray-900 border border-gray-700"
                    placeholder="January 2026"
                  />
                  <select
                    value={adjustMode}
                    onChange={(e) => setAdjustMode(e.target.value)}
                    className="p-2 rounded bg-gray-900 border border-gray-700"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                    <option>Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={submitManualAdjustment}
                    className="px-3 py-2 rounded bg-amber-600 text-white hover:bg-amber-500 transition-all"
                  >
                    Add Adjustment
                  </button>
                </div>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="mt-2 w-full p-2 rounded bg-gray-900 border border-gray-700"
                  placeholder="Adjustment note (optional)"
                />
              </div>
              {(!selectedMember?.paymentHistory || selectedMember.paymentHistory.length === 0) && (
                <div className="text-gray-300">No payment history</div>
              )}
              {selectedMember?.paymentHistory && selectedMember.paymentHistory.length > 0 && (
                <table className="min-w-full text-left text-sm text-gray-200">
                  <thead className="bg-gray-800 text-gray-100">
                    <tr>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Month</th>
                      <th className="px-3 py-2">Mode</th>
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
                        <td className="px-3 py-2">
                          {editingHistoryIndex === idx ? (
                            <input
                              type="text"
                              value={editMonth}
                              onChange={(e) => setEditMonth(e.target.value)}
                              className="p-1 rounded bg-gray-800 border border-gray-700 w-36"
                              placeholder="January 2026"
                            />
                          ) : (
                            p.paymentMonth || formatAllocationRanges(p.allocations)
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingHistoryIndex === idx ? (
                            <select
                              value={editMode}
                              onChange={(e) => setEditMode(e.target.value)}
                              className="p-1 rounded bg-gray-800 border border-gray-700"
                            >
                              <option>Cash</option>
                              <option>UPI</option>
                              <option>Card</option>
                              <option>Bank Transfer</option>
                              <option>Other</option>
                            </select>
                          ) : (
                            p.paymentMode || "-"
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingHistoryIndex === idx ? (
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="p-1 rounded bg-gray-800 border border-gray-700"
                            />
                          ) : (
                            formatDateTime(p.at)
                          )}
                        </td>
                        <td className="px-3 py-2">{p.by?.name || "Unknown"}</td>
                        <td className="px-3 py-2">
                          {editingStatusIndex === idx ? (
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="p-1 rounded bg-gray-800 border border-gray-700"
                            >
                              <option>Paid</option>
                              <option>Pending</option>
                              <option>Free Trial</option>
                            </select>
                          ) : (
                            p.paymentStatus || "-"
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingHistoryIndex === idx ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                className="p-1 rounded bg-gray-800 border border-gray-700 w-40"
                                placeholder="Note"
                              />
                              <input
                                type="date"
                                value={editPromiseDate}
                                onChange={(e) => setEditPromiseDate(e.target.value)}
                                className="p-1 rounded bg-gray-800 border border-gray-700 w-40"
                              />
                            </div>
                          ) : p.promiseDate ? (
                            `${p.note || "-"} | Promise: ${formatDate(p.promiseDate)}`
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
                                    onClick={() => startEditHistory(idx, p)}
                                    className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-all"
                                  >
                                    Edit
                                  </button>
                                  {editingStatusIndex === idx ? (
                                    <>
                                      <button
                                        onClick={() => saveEditStatus(idx)}
                                        className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                                      >
                                        Save Status
                                      </button>
                                      <button
                                        onClick={cancelEditStatus}
                                        className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => startEditStatus(idx, p.paymentStatus)}
                                      className="px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-500 transition-all"
                                    >
                                      Status
                                    </button>
                                  )}
                                  {/* <button
                                    onClick={() => deletePaymentHistory(idx)}
                                    className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition-all"
                                  >
                                    Delete
                                  </button> */}
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

      {isCycleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 text-gray-100 w-full max-w-4xl rounded-lg shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4">
              <div className="text-lg font-semibold">
                Cycle History {selectedMember?.name ? `• ${selectedMember.name}` : ""}
              </div>
              <button
                onClick={closeCycles}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {(!selectedMember?.paymentCycles || selectedMember.paymentCycles.length === 0) && (
                <div className="text-gray-300">No cycle history</div>
              )}
              {selectedMember?.paymentCycles && selectedMember.paymentCycles.length > 0 && (
                <table className="min-w-full text-left text-sm text-gray-200">
                  <thead className="bg-gray-800 text-gray-100">
                    <tr>
                      <th className="px-3 py-2">Start</th>
                      <th className="px-3 py-2">End</th>
                      <th className="px-3 py-2">Fee</th>
                      <th className="px-3 py-2">Paid</th>
                      <th className="px-3 py-2">Due</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Payments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedMember.paymentCycles].map((c, idx) => (
                      <tr key={`${c.startDate || "cycle"}-${idx}`} className="border-b border-gray-800">
                        <td className="px-3 py-2">{formatDate(c.startDate)}</td>
                        <td className="px-3 py-2">{formatDate(c.endDate)}</td>
                        <td className="px-3 py-2">{Number(c.fee || 0)}</td>
                        <td className="px-3 py-2">{Number(c.paidAmount || 0)}</td>
                        <td className="px-3 py-2">{Number(c.remainingAmount || 0)}</td>
                        <td className="px-3 py-2">{c.status || "-"}</td>
                        <td className="px-3 py-2">{Array.isArray(c.payments) ? c.payments.length : 0}</td>
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
              <div className="text-xs text-gray-300">
                Current Due: Rs.{Number(payMonthSummary?.balance || 0)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 bg-gray-800/50 border border-gray-700 rounded p-2">
                <div>Expected Fee ({payMonth || "-"})</div>
                <div className="text-right">Rs.{Number(payMonthSummary?.expectedFee || 0)}</div>
                <div>Already Paid</div>
                <div className="text-right">Rs.{Number(payMonthSummary?.paid || 0)}</div>
                <div>Adjustments</div>
                <div className="text-right">Rs.{Number(payMonthSummary?.adjustments || 0)}</div>
                <div>Balance Before Payment</div>
                <div className="text-right">Rs.{Number(payMonthSummary?.balance || 0)}</div>
                <div>Balance After This Payment</div>
                <div className="text-right">Rs.{payBalanceAfter}</div>
              </div>
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
                <label className="text-sm text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="p-2 rounded bg-gray-800 border border-gray-700"
                  required
                />
              </div>
              {Number(payAmount || 0) > 0 &&
                Number(payAmount || 0) < Number(
                  payMonthSummary?.balance || 0
                ) && (
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-300 mb-1">
                      Remaining will be paid on
                    </label>
                    <input
                      type="date"
                      value={promiseDate}
                      onChange={(e) => setPromiseDate(e.target.value)}
                      className="p-2 rounded bg-gray-800 border border-gray-700"
                    />
                  </div>
                )}
              <div className="flex flex-col">
                <label className="text-sm text-gray-300 mb-1">Month</label>
                <select
                  value={payMonth}
                  onChange={(e) => setPayMonth(e.target.value)}
                  className="p-2 rounded bg-gray-800 border border-gray-700"
                  required
                >
                  <option value="">Select month</option>
                  {payMonthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-300 mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="p-2 rounded bg-gray-800 border border-gray-700"
                  required
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                  <option>Other</option>
                </select>
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

      {isMember360Open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 text-gray-100 w-full max-w-5xl rounded-lg shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4">
              <div className="text-lg font-semibold">
                Member 360 {member360Data?.name ? `• ${member360Data.name}` : ""}
              </div>
              <button
                onClick={closeMember360}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
            <div className="p-5 max-h-[75vh] overflow-y-auto">
              {member360Loading && <div className="text-gray-300">Loading...</div>}
              {!member360Loading && !member360Data && (
                <div className="text-gray-300">No data found.</div>
              )}
              {!member360Loading && member360Data && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                      <div className="text-xs text-gray-400">Member Status</div>
                      <div className="text-lg font-semibold">{member360Data.memberStatus || "-"}</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                      <div className="text-xs text-gray-400">Payment Status</div>
                      <div className="text-lg font-semibold">{member360Data.displayPaymentStatus || member360Data.paymentStatus || "-"}</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                      <div className="text-xs text-gray-400">Total Due</div>
                      <div className="text-lg font-semibold">Rs.{Number(member360Data.dueNowAmount ?? member360Data.remainingAmount ?? 0)}</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                      <div className="text-xs text-gray-400">Current Fee</div>
                      <div className="text-lg font-semibold">Rs.{Number(member360Data.fee || 0)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="p-4 bg-gray-800 rounded border border-gray-700">
                      <div className="text-sm font-semibold mb-2">Profile</div>
                      <div className="text-sm text-gray-300">Phone: {member360Data.phone || "-"}</div>
                      <div className="text-sm text-gray-300">Email: {member360Data.email || "-"}</div>
                      <div className="text-sm text-gray-300">Plan: {member360Data.membershipType || "-"}</div>
                      <div className="text-sm text-gray-300">Registration: {formatDate(member360Data.registrationDate)}</div>
                      <div className="text-sm text-gray-300">Activation: {formatDate(member360Data.activationDate || member360Data.startDate)}</div>
                      <div className="text-sm text-gray-300">Reminder: {member360Data.reminderStatus || "None"}</div>
                      <div className="text-sm text-gray-300">
                        Promised Date: {member360Data.promisedPaymentDate ? formatDate(member360Data.promisedPaymentDate) : "-"}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-800 rounded border border-gray-700">
                      <div className="text-sm font-semibold mb-2">Current Cycle</div>
                      {(() => {
                        const cycles = Array.isArray(member360Data.paymentCycles) ? member360Data.paymentCycles : [];
                        const currentCycle = cycles.length ? cycles[cycles.length - 1] : null;
                        if (!currentCycle) return <div className="text-sm text-gray-300">No cycle found.</div>;
                        return (
                          <>
                            <div className="text-sm text-gray-300">Start: {formatDate(currentCycle.startDate)}</div>
                            <div className="text-sm text-gray-300">End: {formatDate(currentCycle.endDate)}</div>
                            <div className="text-sm text-gray-300">Fee: Rs.{Number(currentCycle.fee || 0)}</div>
                            <div className="text-sm text-gray-300">Paid: Rs.{Number(currentCycle.paidAmount || 0)}</div>
                            <div className="text-sm text-gray-300">Due: Rs.{Number(currentCycle.remainingAmount || 0)}</div>
                            <div className="text-sm text-gray-300">Status: {currentCycle.status || "-"}</div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-sm font-semibold mb-2">Recent Payments</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm text-gray-200">
                        <thead className="bg-gray-800 text-gray-100">
                          <tr>
                            <th className="px-3 py-2">Amount</th>
                            <th className="px-3 py-2">Month</th>
                            <th className="px-3 py-2">Mode</th>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(member360Data.paymentHistory) ? [...member360Data.paymentHistory].reverse().slice(0, 8) : []).map((p, idx) => (
                            <tr key={`${p.at || "p"}-${idx}`} className="border-b border-gray-800">
                              <td className="px-3 py-2">{Number(p.amount || 0)}</td>
                              <td className="px-3 py-2">{p.paymentMonth || "-"}</td>
                              <td className="px-3 py-2">{p.paymentMode || "-"}</td>
                              <td className="px-3 py-2">{formatDateTime(p.at)}</td>
                              <td className="px-3 py-2">{p.paymentStatus || "-"}</td>
                            </tr>
                          ))}
                          {(!Array.isArray(member360Data.paymentHistory) || member360Data.paymentHistory.length === 0) && (
                            <tr>
                              <td className="px-3 py-2 text-gray-400" colSpan={5}>No payment history</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-sm font-semibold mb-2">Recent Cycles</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm text-gray-200">
                        <thead className="bg-gray-800 text-gray-100">
                          <tr>
                            <th className="px-3 py-2">Start</th>
                            <th className="px-3 py-2">End</th>
                            <th className="px-3 py-2">Fee</th>
                            <th className="px-3 py-2">Paid</th>
                            <th className="px-3 py-2">Due</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(member360Data.paymentCycles) ? [...member360Data.paymentCycles].reverse().slice(0, 6) : []).map((c, idx) => (
                            <tr key={`${c.startDate || "c"}-${idx}`} className="border-b border-gray-800">
                              <td className="px-3 py-2">{formatDate(c.startDate)}</td>
                              <td className="px-3 py-2">{formatDate(c.endDate)}</td>
                              <td className="px-3 py-2">{Number(c.fee || 0)}</td>
                              <td className="px-3 py-2">{Number(c.paidAmount || 0)}</td>
                              <td className="px-3 py-2">{Number(c.remainingAmount || 0)}</td>
                              <td className="px-3 py-2">{c.status || "-"}</td>
                            </tr>
                          ))}
                          {(!Array.isArray(member360Data.paymentCycles) || member360Data.paymentCycles.length === 0) && (
                            <tr>
                              <td className="px-3 py-2 text-gray-400" colSpan={6}>No cycle history</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-2">Recent Activity</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm text-gray-200">
                        <thead className="bg-gray-800 text-gray-100">
                          <tr>
                            <th className="px-3 py-2">Time</th>
                            <th className="px-3 py-2">Action</th>
                            <th className="px-3 py-2">Note</th>
                            <th className="px-3 py-2">By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(member360Data.activityHistory) ? [...member360Data.activityHistory].reverse().slice(0, 10) : []).map((a, idx) => (
                            <tr key={`${a.at || "a"}-${idx}`} className="border-b border-gray-800">
                              <td className="px-3 py-2">{formatDateTime(a.at)}</td>
                              <td className="px-3 py-2">{a.action || "-"}</td>
                              <td className="px-3 py-2">{a.note || "-"}</td>
                              <td className="px-3 py-2">{a.by?.name || "-"}</td>
                            </tr>
                          ))}
                          {(!Array.isArray(member360Data.activityHistory) || member360Data.activityHistory.length === 0) && (
                            <tr>
                              <td className="px-3 py-2 text-gray-400" colSpan={4}>No activity history</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MembersList;
