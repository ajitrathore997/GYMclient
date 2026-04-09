// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import axios from "axios";
// import { Heading, Loader } from '../../components';
// import { toast } from "react-hot-toast";
// import {BASE_URL} from "../../utils/fetchData";
// const AdminDashBoard = () => {

//   const [userCount, setUserCount] = useState(null);
//   const [planCount, setPlanCount] = useState(null);
//   const [subscriberCount, setSubscriberCount] = useState(null);
//   const [contactCount, setContactCount] = useState(null);
//   const [feedbackCount, setFeedbackCount] = useState(null);
//   const [loading, setLoading] = useState(false);



//   const getUsers = async () => {
//     try {
//       // const res = await axios.get("http://localhost:5000/api/v1/auth/total-user");
//       setLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/v1/auth/total-user`);
//       if (res.data && res.data.success) {
//         console.log(res.data.total);
//         setUserCount(res.data.total);
//       }
//       setLoading(false);
//     }
//     catch (err) {
//       console.log(err);
//       toast.error("something went wong in getting users");
//       setLoading(false);
//     }
//   }

//   const getPlans = async () => {
//     try {
//       // const res = await axios.get("http://localhost:5000/api/v1/plan/total-plan");
//       setLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/v1/plan/total-plan`);
//       if (res.data && res.data.success) {
//         console.log(res.data.total);
//         setPlanCount(res.data.total);
//       }
//       setLoading(false);
//     }
//     catch (err) {
//       console.log(err);
//       toast.error("something went wong in getting plans");
//       setLoading(false);
//     }
//   }


//   const getSubscriptions = async () => {
//     try {
//       setLoading(true);
//       // const res = await axios.get("http://localhost:5000/api/v1/subscription/total-subscription");
//       const res = await axios.get(`${BASE_URL}/api/v1/subscription/total-subscription`);
//       if (res.data && res.data.success) {
//         console.log(res.data.total);
//         setSubscriberCount(res.data.total);
//       }
//       setLoading(false);
//     }
//     catch (err) {
//       console.log(err);
//       toast.error("something went wong in getting subscription");
//       setLoading(false);
//     }
//   }

//   const getContacts = async () => {
//     try {
//       // const res = await axios.get("http://localhost:5000/api/v1/contact/total-contact");
//       setLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/v1/contact/total-contact`);
//       if (res.data && res.data.success) {
//         console.log(res.data.total);
//         setContactCount(res.data.total);
//       }
//       setLoading(false);
//     }
//     catch (err) {
//       console.log(err);
//       toast.error("something went wong in getting contact");
//       setLoading(false);
//     }
//   }

//   const getFeedbacks = async () => {
//     try {
//       // const res = await axios.get("http://localhost:5000/api/v1/feedback/total-feedback");
//       setLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/v1/feedback/total-feedback`);
//       if (res.data && res.data.success) {
//         console.log("feedback");
//         console.log(res.data.total);
//         setFeedbackCount(res.data.total);
//       }
//       setLoading(false);
//     }
//     catch (err) {
//       console.log(err);
//       toast.error("something went wrong in getting feedback");
//       setLoading(false);
//     }
//   }



//   useEffect(() => {
//     getUsers();
//     getPlans();
//     getSubscriptions();
//     getContacts();
//     getFeedbacks();
//   }, []);



//   if(loading){
//     return <Loader/>
//   }

//   return (
//     <section className='pt-10 bg-gray-900'>
//       <Heading name="Admin Dashboard" />
//       <div className="container mx-auto px-6 py-20">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
//           <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/user-list`}>
//             <h2 className='text-white font-bold text-3xl'>Users: {userCount ? userCount : " Loading..."}</h2>
//           </Link>
//           <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/subscriber-list`}>
//             <h2 className='text-white font-bold text-3xl'>Subscribers: {subscriberCount ? subscriberCount : " Loading..."}</h2>
//           </Link>
//           <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/plans`}>
//             <h2 className='text-white font-bold text-3xl'>Plans: {planCount ? planCount : " Loading..."}</h2>
//           </Link>
//           <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/contact-us`}>
//             <h2 className='text-white font-bold text-3xl'>Query: {contactCount ? contactCount : " Loading..."}</h2>
//           </Link>
//           {feedbackCount && <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/feedbacks`}>
//             <h2 className='text-white font-bold text-3xl'>Feedbacks: {feedbackCount ? feedbackCount : " Loading..."}</h2>
//           </Link>}
//           {/* <Link className='p-5 border border-white group-hover:bg-blue-500 transition-all'>
//             <h2 className='text-white font-bold text-3xl'>Create-Plan</h2>
//           </Link> */}
//         </div>
//       </div>
//     </section>
//   )
// }

// export default AdminDashBoard;


import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import { Loader } from '../../components';
import { toast } from "react-hot-toast";
import { BASE_URL } from "../../utils/fetchData";
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import { BarChart } from "@mui/x-charts/BarChart";
import { useAuth } from '../../context/auth';

const dashboardCardClass =
  "rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 px-4 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.22)]";

const dashboardCardLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400";

const dashboardCardValueClass = "mt-2 text-2xl font-semibold text-white";
const dashboardFilterFieldClass = "flex flex-col gap-1";
const dashboardFilterInputClass =
  "h-10 rounded-xl border border-gray-700 bg-gray-900 px-3 text-sm text-gray-100 outline-none transition-all focus:border-blue-500";
const dashboardTablePageSize = 10;

const TablePagination = ({ page, totalItems, onPageChange }) => {
  const totalPages = Math.max(Math.ceil(totalItems / dashboardTablePageSize), 1);
  if (totalItems <= dashboardTablePageSize) return null;
  const startItem = (page - 1) * dashboardTablePageSize + 1;
  const endItem = Math.min(page * dashboardTablePageSize, totalItems);

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between">
      <div>
        Showing {startItem}-{endItem} of {totalItems} • Page {page} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1}
          className="rounded-lg bg-gray-700 px-3 py-1 text-white transition-all hover:bg-gray-600 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className="rounded-lg bg-gray-700 px-3 py-1 text-white transition-all hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const AdminDashBoard = () => {
  const { auth } = useAuth();
  const [userCount, setUserCount] = useState(null);
  const [planCount, setPlanCount] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [contactCount, setContactCount] = useState(null);
  const [feedbackCount, setFeedbackCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [memberStats, setMemberStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [allTimeMemberStats, setAllTimeMemberStats] = useState(null);
  const [allTimeStatsLoading, setAllTimeStatsLoading] = useState(false);
  const [promisedMembers, setPromisedMembers] = useState([]);
  const [promisedLoading, setPromisedLoading] = useState(false);
  const [supplementStats, setSupplementStats] = useState(null);
  const [supplementLoading, setSupplementLoading] = useState(false);
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const [defaultersPage, setDefaultersPage] = useState(1);
  const [promisedPage, setPromisedPage] = useState(1);
  const [dueNextWeekPage, setDueNextWeekPage] = useState(1);

  const defaulters = allTimeMemberStats?.defaulters || [];
  const dueNextWeekMembers = allTimeMemberStats?.dueNextWeekMembers || [];

  const pagedDefaulters = useMemo(() => {
    const start = (defaultersPage - 1) * dashboardTablePageSize;
    return defaulters.slice(start, start + dashboardTablePageSize);
  }, [defaulters, defaultersPage]);

  const pagedPromisedMembers = useMemo(() => {
    const start = (promisedPage - 1) * dashboardTablePageSize;
    return promisedMembers.slice(start, start + dashboardTablePageSize);
  }, [promisedMembers, promisedPage]);

  const pagedDueNextWeekMembers = useMemo(() => {
    const start = (dueNextWeekPage - 1) * dashboardTablePageSize;
    return dueNextWeekMembers.slice(start, start + dashboardTablePageSize);
  }, [dueNextWeekMembers, dueNextWeekPage]);

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(defaulters.length / dashboardTablePageSize), 1);
    if (defaultersPage > totalPages) setDefaultersPage(totalPages);
  }, [defaulters.length, defaultersPage]);

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(promisedMembers.length / dashboardTablePageSize), 1);
    if (promisedPage > totalPages) setPromisedPage(totalPages);
  }, [promisedMembers.length, promisedPage]);

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(dueNextWeekMembers.length / dashboardTablePageSize), 1);
    if (dueNextWeekPage > totalPages) setDueNextWeekPage(totalPages);
  }, [dueNextWeekMembers.length, dueNextWeekPage]);

  // AOS Initialization
  useEffect(() => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 30);
    const start = startDate.toISOString().slice(0, 10);
    setRange({ startDate: start, endDate: end });
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      easing: 'ease-in-out', // Animation easing
      offset: 120, // Trigger animation before the element comes into view
      once: true // Animation should happen only once while scrolling down
    });

    // Fetch data
    getUsers();
    getPlans();
    getSubscriptions();
    getContacts();
    getFeedbacks();
    getMemberStats(start, end);
    getAllTimeMemberStats();
    getPromisedPendingMembers();
    getSupplementStats();
  }, []);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/auth/total-user`);
      if (res.data && res.data.success) {
        setUserCount(res.data.total);
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in getting users");
      setLoading(false);
    }
  }

  const getPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/plan/total-plan`);
      if (res.data && res.data.success) {
        setPlanCount(res.data.total);
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in getting plans");
      setLoading(false);
    }
  }

  const getSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/subscription/total-subscription`);
      if (res.data && res.data.success) {
        setSubscriberCount(res.data.total);
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in getting subscription");
      setLoading(false);
    }
  }

  const getContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/contact/total-contact`);
      if (res.data && res.data.success) {
        setContactCount(res.data.total);
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in getting contact");
      setLoading(false);
    }
  }

  const getFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/feedback/total-feedback`);
      if (res.data && res.data.success) {
        setFeedbackCount(res.data.total);
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in getting feedback");
      setLoading(false);
    }
  }

  const getMemberStats = async (startDate, endDate) => {
    try {
      setStatsLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axios.get(`${BASE_URL}/api/v1/members/dashboard`, { params });
      if (res.data && res.data.success) {
        setMemberStats(res.data.stats);
      }
      setStatsLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in getting member stats");
      setStatsLoading(false);
    }
  }

  const getAllTimeMemberStats = async () => {
    try {
      setAllTimeStatsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/members/dashboard`);
      if (res.data && res.data.success) {
        setAllTimeMemberStats(res.data.stats);
      }
      setAllTimeStatsLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in getting all-time member stats");
      setAllTimeStatsLoading(false);
    }
  }

  const getPromisedPendingMembers = async () => {
    try {
      setPromisedLoading(true);
      const collected = [];
      const pageSize = 100;
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const res = await axios.get(`${BASE_URL}/api/v1/members`, {
          params: {
            listType: "reminder",
            reminderStatus: "Promised",
            page,
            limit: pageSize,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
        });
        if (!res.data?.success) break;
        const chunk = Array.isArray(res.data.members) ? res.data.members : [];
        collected.push(...chunk);
        totalPages = Number(res.data.totalPages || 1);
        page += 1;
      }

      if (collected.length) {
        const normalized = collected
          .filter((m) => m.reminderStatus === "Promised")
          .map((m) => {
            const history = Array.isArray(m.paymentHistory) ? m.paymentHistory : [];
            const promisedEntry = [...history]
              .reverse()
              .find((p) => p.promiseDate);
            return {
              ...m,
              effectivePromiseDate: m.promisedPaymentDate || promisedEntry?.promiseDate || null,
            };
          })
          .sort((a, b) => {
            const ad = a.effectivePromiseDate ? new Date(a.effectivePromiseDate).getTime() : Infinity;
            const bd = b.effectivePromiseDate ? new Date(b.effectivePromiseDate).getTime() : Infinity;
            return ad - bd;
          });
        setPromisedMembers(normalized);
      } else {
        setPromisedMembers([]);
      }
      setPromisedLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in getting promised pending members");
      setPromisedMembers([]);
      setPromisedLoading(false);
    }
  };

  const getSupplementStats = async () => {
    try {
      setSupplementLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/supplements/dashboard`);
      if (res.data?.success) {
        setSupplementStats(res.data.stats);
      } else {
        setSupplementStats(null);
      }
      setSupplementLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in getting supplement stats");
      setSupplementStats(null);
      setSupplementLoading(false);
    }
  };

  const refreshDashboardData = async (startDate = range.startDate, endDate = range.endDate) => {
    await Promise.all([
      getMemberStats(startDate, endDate),
      getAllTimeMemberStats(),
      getPromisedPendingMembers(),
      getSupplementStats(),
    ]);
  };


  const normalizePhone = (phone) => {
    if (!phone) return "";
    let digits = String(phone).replace(/[^\d]/g, "");
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (digits.startsWith("91") && digits.length === 12) return digits;
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const openWhatsAppReminder = (member, type) => {
  const phone = normalizePhone(member?.phone);
  if (!phone) {
    toast.error("Member phone number not available");
    return;
  }

  const memberName = member?.name || "Member";

  const formatDateLabel = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const dueAmount = Number(
    type === "next7"
      ? (member?.totalPayableAmount ?? member?.dueAmount ?? member?.upcomingDueAmount ?? 0)
      : (member?.dueAmount ?? member?.dueNowAmount ?? member?.remainingAmount ?? 0)
  );

  const remainingAmount = Number(member?.outstandingDueAmount ?? member?.remainingAmount ?? 0);
  const feeAmountRaw = Number(member?.nextFeeAmount ?? member?.fee ?? 0);
  const feeAmount = feeAmountRaw > 0 ? feeAmountRaw : Math.max(dueAmount - remainingAmount, 0);

  const dueDate = formatDateLabel(member?.endDate);
  const promiseDate = member?.effectivePromiseDate || member?.promisedPaymentDate;
  const promiseDateLabel = formatDateLabel(promiseDate);

  // Add branding in greeting
  // const englishLines = [`Hello ${memberName},`, `This is a message from SR Fitness.`];
  // const hindiLines = [`नमस्ते ${memberName},`, `यह संदेश SR Fitness की ओर से है।`];

  const englishLines = [];
  const hindiLines = [];
  
  if (type === "defaulter") {
    englishLines.push(
      "Your gym fee is pending.",
      `Due Amount: Rs.${dueAmount}`,
      `Cycle End Date: ${dueDate || "-"}`
    );

    hindiLines.push(
      "आपकी जिम फीस बकाया है।",
      `बकाया राशि: Rs.${dueAmount}`,
      `साइकिल समाप्ति तिथि: ${dueDate || "-"}`
    );

    if (promiseDateLabel) {
      englishLines.push(`Promised Date: ${promiseDateLabel}`);
      hindiLines.push(`वादा की तिथि: ${promiseDateLabel}`);
    }

    englishLines.push("Please clear your due as soon as possible.");
    hindiLines.push("कृपया अपनी बकाया राशि जल्द से जल्द जमा करें।");

  } else if (type === "promised") {
    englishLines.push(
      "This is a reminder for your promised payment.",
      `Due Amount: Rs.${dueAmount}`,
      `Promised Date: ${promiseDateLabel || "-"}`,
      "Please make the payment today."
    );

    hindiLines.push(
      "यह आपके वादा किए गए भुगतान का रिमाइंडर है।",
      `बकाया राशि: Rs.${dueAmount}`,
      `वादा की तिथि: ${promiseDateLabel || "-"}`,
      "कृपया आज भुगतान करें।"
    );

  } else {
    englishLines.push("Your fee due date is approaching.");
    hindiLines.push("आपकी फीस की देय तिथि नज़दीक है।");

    if (remainingAmount > 0) {
      englishLines.push(`Previous Due: Rs.${remainingAmount}`);
      hindiLines.push(`पिछली बकाया राशि: Rs.${remainingAmount}`);
    }

    englishLines.push(
      `Next Fee: Rs.${feeAmount}`,
      `Total Payable: Rs.${dueAmount}`,
      `Due Date: ${dueDate || "-"}`,
      "Please pay on time to avoid interruption."
    );

    hindiLines.push(
      `अगली फीस: Rs.${feeAmount}`,
      `कुल देय राशि: Rs.${dueAmount}`,
      `देय तिथि: ${dueDate || "-"}`,
      "सेवा जारी रखने के लिए समय पर भुगतान करें।"
    );
  }

  // Add branded closing
  englishLines.push("\nThank you,\nTeam SR Fitness");
  hindiLines.push("\nधन्यवाद,\nटीम SR Fitness");

  const message = `${englishLines.join("\n")}\n\n${hindiLines.join("\n")}`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

const openSupplementWhatsApp = (sale) => {
  const phone = normalizePhone(sale?.memberPhone);
  if (!phone) {
    toast.error("Member phone number not available");
    return;
  }

  const dueDate = sale?.paymentDueDate
    ? new Date(sale.paymentDueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "soon";

  const message = `Hi ${sale?.memberName || "Member"}, supplement payment reminder.\nSupplement: ${
    sale?.supplementName || "-"
  }\nTotal: Rs.${Number(sale?.totalAmount || 0)}\nPaid: Rs.${Number(
    sale?.paidAmount || 0
  )}\nRemaining: Rs.${Number(sale?.remainingAmount || 0)}\nDue date: ${dueDate}\nPlease clear the pending amount when possible.`;

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
};

  if (loading) {
    return <Loader />
  }

  return (
    <section className='bg-gray-900'>
      <div className="container mx-auto px-6 py-8 md:py-10">
        {auth?.user?.access === 1 && (
        <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Track members, collections, and supplement dues.</p>
        </div>
        <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-800/95 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,0.9fr)_minmax(180px,0.9fr)_auto] xl:items-end">
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
            <button
              onClick={() => {
                refreshDashboardData(range.startDate, range.endDate);
              }}
              className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-all sm:col-span-2 xl:col-span-1"
            >
              Apply
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 mb-8">
          <div className={dashboardCardClass} data-aos="fade-up">
            <p className={dashboardCardLabelClass}>Total Active Members</p>
            <h3 className={dashboardCardValueClass}>
              {allTimeMemberStats ? allTimeMemberStats.activeMembersCount : "Loading..."}
            </h3>
          </div>
          <div className={dashboardCardClass} data-aos="fade-up" data-aos-delay="50">
            <p className={dashboardCardLabelClass}>Members Joined (Range)</p>
            <h3 className={dashboardCardValueClass}>
              {memberStats ? memberStats.membersJoinedInRange : "Loading..."}
            </h3>
          </div>
          <div className={dashboardCardClass} data-aos="fade-up" data-aos-delay="100">
            <p className={dashboardCardLabelClass}>Pending Fees</p>
            <h3 className="mt-2 text-2xl font-semibold text-orange-300">
              {allTimeMemberStats ? allTimeMemberStats.pendingCount : "Loading..."}
            </h3>
          </div>
          <div className={dashboardCardClass} data-aos="fade-up" data-aos-delay="150">
            <p className={dashboardCardLabelClass}>Overdue Members</p>
            <h3 className="mt-2 text-2xl font-semibold text-red-300">
              {allTimeMemberStats ? allTimeMemberStats.overdueMembersCount : "Loading..."}
            </h3>
          </div>
          <div className={dashboardCardClass} data-aos="fade-up" data-aos-delay="200">
            <p className={dashboardCardLabelClass}>Promised Due</p>
            <h3 className="mt-2 text-2xl font-semibold text-amber-300">
              {allTimeMemberStats ? allTimeMemberStats.promisedDueAmount : "Loading..."}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-10">
          <div className={dashboardCardClass} data-aos="fade-up">
            <p className={dashboardCardLabelClass}>Paid In Range</p>
            <h3 className="mt-2 text-2xl font-semibold text-emerald-300">
              {memberStats ? memberStats.paidInRange : "Loading..."}
            </h3>
          </div>
          <div className={dashboardCardClass} data-aos="fade-up" data-aos-delay="100">
            <p className={dashboardCardLabelClass}>Expenses In Range</p>
            <h3 className="mt-2 text-2xl font-semibold text-rose-300">
              {memberStats ? memberStats.expensesInRange : "Loading..."}
            </h3>
          </div>
          <div className={dashboardCardClass} data-aos="fade-up" data-aos-delay="200">
            <p className={dashboardCardLabelClass}>Income (Paid - Expense)</p>
            <h3 className={`mt-2 text-2xl font-semibold ${Number(memberStats?.netInRange || 0) >= 0 ? "text-cyan-300" : "text-orange-300"}`}>
              {memberStats ? memberStats.netInRange : "Loading..."}
            </h3>
          </div>
          <div className={dashboardCardClass} data-aos="fade-up" data-aos-delay="300">
            <p className={dashboardCardLabelClass}>Promised Members</p>
            <h3 className="mt-2 text-2xl font-semibold text-violet-300">
              {promisedLoading ? "Loading..." : promisedMembers.length}
            </h3>
          </div>
        </div>

        <div className="bg-gray-800 p-5 border border-white mb-10" data-aos="fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-xl font-semibold">Supplements</h3>
            <Link
              to="/dashboard/admin/supplements"
              className="text-sm text-yellow-400 hover:underline"
            >
              Manage Supplements
            </Link>
          </div>
          {supplementLoading || !supplementStats ? (
            <p className="text-gray-300">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-3">
                  <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-[0.16em]">Pending</p>
                  <p className="mt-1 text-xl font-semibold text-orange-300">Rs.{Number(supplementStats.totalOutstanding || 0)}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-3">
                  <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-[0.16em]">Overdue</p>
                  <p className="mt-1 text-xl font-semibold text-red-300">{supplementStats.overdueCount}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-3">
                  <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-[0.16em]">Due Today</p>
                  <p className="mt-1 text-xl font-semibold text-blue-300">{supplementStats.dueTodayCount}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-300 mb-3">Recent Pending Supplement Dues</p>
                {supplementStats.recentPending?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-200">
                      <thead className="bg-gray-700 text-gray-100">
                        <tr>
                          <th className="px-4 py-3">Member</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Supplement</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3">Remaining</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-center w-40">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplementStats.recentPending.map((sale) => (
                          <tr key={sale._id} className="border-b border-gray-700">
                            <td className="px-4 py-3">{sale.memberName}</td>
                            <td className="px-4 py-3">{sale.memberPhone || "-"}</td>
                            <td className="px-4 py-3">{sale.supplementName}</td>
                            <td className="px-4 py-3">
                              {sale.paymentDueDate
                                ? new Date(sale.paymentDueDate).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </td>
                            <td className="px-4 py-3">Rs.{Number(sale.remainingAmount || 0)}</td>
                            <td className="px-4 py-3">{sale.paymentStatus}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openSupplementWhatsApp(sale)}
                                className="inline-flex items-center justify-center min-w-[110px] px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                              >
                                WhatsApp
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400">No pending supplement dues.</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-800 p-5 border border-white mb-10" data-aos="fade-up">
          <h3 className="text-white text-xl font-semibold mb-4">Daily Cash Closure (Today)</h3>
          {!memberStats?.dailyClosure ? (
            <p className="text-gray-300">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="p-4 bg-gray-900 border border-gray-700 rounded">
                  <p className="text-gray-400 text-xs">Date</p>
                  <p className="text-white text-lg font-semibold">
                    {new Date(memberStats.dailyClosure.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-900 border border-gray-700 rounded">
                  <p className="text-gray-400 text-xs">Collected</p>
                  <p className="text-green-400 text-lg font-semibold">
                    Rs.{Number(memberStats.dailyClosure.totalCollected || 0)}
                  </p>
                </div>
                <div className="p-4 bg-gray-900 border border-gray-700 rounded">
                  <p className="text-gray-400 text-xs">Expenses</p>
                  <p className="text-red-400 text-lg font-semibold">
                    Rs.{Number(memberStats.dailyClosure.totalExpenses || 0)}
                  </p>
                </div>
                <div className="p-4 bg-gray-900 border border-gray-700 rounded">
                  <p className="text-gray-400 text-xs">Net</p>
                  <p className={`text-lg font-semibold ${Number(memberStats.dailyClosure.net || 0) >= 0 ? "text-blue-300" : "text-orange-400"}`}>
                    Rs.{Number(memberStats.dailyClosure.net || 0)}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-200">
                  <thead className="bg-gray-700 text-gray-100">
                    <tr>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(memberStats.dailyClosure.collectedByMode || {}).map(([mode, amount]) => (
                      <tr key={mode} className="border-b border-gray-700">
                        <td className="px-4 py-3">{mode}</td>
                        <td className="px-4 py-3">Rs.{Number(amount || 0)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-900/70">
                      <td className="px-4 py-3 font-semibold">Payments Count</td>
                      <td className="px-4 py-3 font-semibold">{Number(memberStats.dailyClosure.totalPaymentsCount || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/user-list`} data-aos="fade-up">
            <h2 className='text-white font-bold text-3xl'>Users: {userCount !== null ? userCount : "Loading..."}</h2>
          </Link>
          <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/subscriber-list`} data-aos="fade-up" data-aos-delay="100">
            <h2 className='text-white font-bold text-3xl'>Subscribers: {subscriberCount !== null ? subscriberCount : "Loading..."}</h2>
          </Link>
          <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/plans`} data-aos="fade-up" data-aos-delay="200">
            <h2 className='text-white font-bold text-3xl'>Plans: {planCount !== null ? planCount : "Loading..."}</h2>
          </Link>
          <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/contact-us`} data-aos="fade-up" data-aos-delay="300">
            <h2 className='text-white font-bold text-3xl'>Queries: {contactCount !== null ? contactCount : "Loading..."}</h2>
          </Link>
          {feedbackCount !== null && (
            <Link className='p-5 border border-white hover:bg-blue-600 transition-all' to={`/dashboard/admin/feedbacks`} data-aos="fade-up" data-aos-delay="400">
              <h2 className='text-white font-bold text-3xl'>Feedbacks: {feedbackCount !== null ? feedbackCount : "Loading..."}</h2>
            </Link>
          )}
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <div className="bg-gray-800 p-5 border border-white" data-aos="fade-up">
            <h3 className="text-white text-xl font-semibold mb-4">Payment Status</h3>
            {statsLoading && <p className="text-gray-300">Loading...</p>}
            {!statsLoading && memberStats && (
              <div className="space-y-3">
                {Object.entries(memberStats.paymentStatusCounts).map(([label, value]) => {
                  const max = Math.max(...Object.values(memberStats.paymentStatusCounts), 1);
                  const width = Math.round((value / max) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-gray-300 text-sm mb-1">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded">
                        <div className="h-3 bg-blue-500 rounded" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <div className="bg-gray-800 p-5 border border-white mt-10" data-aos="fade-up">
          <h3 className="text-white text-xl font-semibold mb-4">Payments (Range)</h3>
          {statsLoading && <p className="text-gray-300">Loading...</p>}
          {!statsLoading && memberStats && (
  <div className="bg-gray-900 p-4 rounded">
    <BarChart
      height={320}
      series={[
        {
          data: (memberStats.paymentSeries || []).map((p) => p.total),
          label: "Payments",
        },
      ]}
      
      xAxis={[
        {
          data: (memberStats.paymentSeries || []).map((p) =>
            new Date(p.date).toLocaleDateString("en-GB")
          ),
          scaleType: "band",
          tickLabelStyle: {
            fill: "#9CA3AF", // subtle gray (dates)
          },
        },
      ]}
      yAxis={[
        {
          tickLabelStyle: {
            fill: "#9CA3AF", // subtle gray (values)
          },
        },
      ]}
      colors={["#22c55e"]}
      sx={{
        "& .MuiChartsAxis-line": {
          stroke: "#4B5563",
        },
        "& .MuiChartsAxis-tick": {
          stroke: "#4B5563",
        },
        "& .MuiChartsLegend-label": {
          fill: "#D1D5DB",
        },
      }}
    />
  </div>
)}

        </div>

        <div className="bg-gray-800 p-5 border border-white mt-10" data-aos="fade-up">
          <h3 className="text-white text-xl font-semibold mb-4">Expenses (Range)</h3>
          {statsLoading && <p className="text-gray-300">Loading...</p>}
          {!statsLoading && memberStats && (
            <div className="bg-gray-900 p-4 rounded">
              <BarChart
                height={320}
                series={[
                  {
                    data: (memberStats.expenseSeries || []).map((p) => p.total),
                    label: "Expenses",
                  },
                ]}
                xAxis={[
                  {
                    data: (memberStats.expenseSeries || []).map((p) =>
                      new Date(p.date).toLocaleDateString("en-GB")
                    ),
                    scaleType: "band",
                    tickLabelStyle: {
                      fill: "#9CA3AF",
                    },
                  },
                ]}
                yAxis={[
                  {
                    tickLabelStyle: {
                      fill: "#9CA3AF",
                    },
                  },
                ]}
                colors={["#f97316"]}
                sx={{
                  "& .MuiChartsAxis-line": {
                    stroke: "#4B5563",
                  },
                  "& .MuiChartsAxis-tick": {
                    stroke: "#4B5563",
                  },
                  "& .MuiChartsLegend-label": {
                    fill: "#D1D5DB",
                  },
                }}
              />
            </div>
          )}
        </div>
          </div>
        )}
        <div className="bg-gray-800 p-5 border border-white mt-10" data-aos="fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-xl font-semibold">Defaulters (Top Due)</h3>
            <Link
              to="/dashboard/admin/members"
              className="text-sm text-yellow-400 hover:underline"
            >
              View Members
            </Link>
          </div>
          {allTimeStatsLoading && <p className="text-gray-300">Loading...</p>}
          {!allTimeStatsLoading && allTimeMemberStats && (
            <>
              {(defaulters.length === 0) ? (
                <p className="text-gray-400">No defaulters right now.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-200">
                      <thead className="bg-gray-700 text-gray-100">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Due</th>
                          <th className="px-4 py-3">Cycle End</th>
                          <th className="px-4 py-3">Promised Date</th>
                          <th className="px-4 py-3 text-center w-40">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedDefaulters.map((m) => (
                          <tr key={m._id} className="border-b border-gray-700">
                            <td className="px-4 py-3">{m.name}</td>
                            <td className="px-4 py-3">{m.phone}</td>
                            <td className="px-4 py-3">{m.dueAmount}</td>
                            <td className="px-4 py-3">
                              {m.endDate ? new Date(m.endDate).toLocaleDateString("en-GB") : "-"}
                            </td>
                            <td className="px-4 py-3">
                              {m.promisedPaymentDate
                                ? new Date(m.promisedPaymentDate).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openWhatsAppReminder(m, "defaulter")}
                                className="inline-flex items-center justify-center min-w-[110px] px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                              >
                                WhatsApp
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePagination
                    page={defaultersPage}
                    totalItems={defaulters.length}
                    onPageChange={setDefaultersPage}
                  />
                </>
              )}
            </>
          )}
        </div>

        <div className="bg-gray-800 p-5 border border-white mt-10" data-aos="fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-xl font-semibold">Promised Pending</h3>
            <Link
              to="/dashboard/admin/members"
              className="text-sm text-yellow-400 hover:underline"
            >
              View Members
            </Link>
          </div>
          {promisedLoading && <p className="text-gray-300">Loading...</p>}
          {!promisedLoading && (
            <>
              <p className="text-gray-300 mb-3">Count: {promisedMembers.length}</p>
              {promisedMembers.length === 0 ? (
                <p className="text-gray-400">No promised pending members.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-200">
                      <thead className="bg-gray-700 text-gray-100">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Promise Date</th>
                          <th className="px-4 py-3">Due</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-center w-40">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedPromisedMembers.map((m) => (
                          <tr key={m._id} className="border-b border-gray-700">
                            <td className="px-4 py-3">{m.name}</td>
                            <td className="px-4 py-3">{m.phone}</td>
                            <td className="px-4 py-3">
                              {m.effectivePromiseDate
                                ? new Date(m.effectivePromiseDate).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </td>
                            <td className="px-4 py-3">
                              {m.dueNowAmount ?? m.remainingAmount ?? 0}
                            </td>
                            <td className="px-4 py-3">
                              {m.displayPaymentStatus || m.paymentStatus || "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openWhatsAppReminder(m, "promised")}
                                className="inline-flex items-center justify-center min-w-[110px] px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                              >
                                WhatsApp
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePagination
                    page={promisedPage}
                    totalItems={promisedMembers.length}
                    onPageChange={setPromisedPage}
                  />
                </>
              )}
            </>
          )}
        </div>

        <div className="bg-gray-800 p-5 border border-white mt-10" data-aos="fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-xl font-semibold">Fees Due in Next 7 Days</h3>
            <Link
              to="/dashboard/admin/members"
              className="text-sm text-yellow-400 hover:underline"
            >
              View Members
            </Link>
          </div>
          {allTimeStatsLoading && <p className="text-gray-300">Loading...</p>}
          {!allTimeStatsLoading && allTimeMemberStats && (
            <>
              <p className="text-gray-300 mb-3">
                Count: {allTimeMemberStats.dueNextWeekCount}
              </p>
              {dueNextWeekMembers.length === 0 ? (
                <p className="text-gray-400">No upcoming dues in the next week.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-200">
                      <thead className="bg-gray-700 text-gray-100">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Fee</th>
                          <th className="px-4 py-3">Due</th>
                          <th className="px-4 py-3">Remaining</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3 text-center w-40">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedDueNextWeekMembers.map((m) => (
                          <tr key={m._id} className="border-b border-gray-700">
                            <td className="px-4 py-3">{m.name}</td>
                            <td className="px-4 py-3">{m.phone}</td>
                            <td className="px-4 py-3">
                              {(() => {
                                const rowRemaining = Number(m.outstandingDueAmount ?? m.remainingAmount ?? 0);
                                const rowDue = Number(m.totalPayableAmount ?? m.dueAmount ?? m.upcomingDueAmount ?? 0);
                                const rowFeeRaw = Number(m.nextFeeAmount ?? m.fee ?? 0);
                                const rowFee = rowFeeRaw > 0 ? rowFeeRaw : Math.max(rowDue - rowRemaining, 0);
                                return rowFee;
                              })()}
                            </td>
                            <td className="px-4 py-3">
                              {Number(m.totalPayableAmount ?? m.dueAmount ?? m.upcomingDueAmount ?? 0)}
                            </td>
                            <td className="px-4 py-3">
                              {Number(m.outstandingDueAmount ?? m.remainingAmount ?? 0) > 0
                                ? Number(m.outstandingDueAmount ?? m.remainingAmount ?? 0)
                                : "-"}
                            </td>
                            <td className="px-4 py-3">
                              {new Date(m.endDate).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openWhatsAppReminder(m, "next7")}
                                className="inline-flex items-center justify-center min-w-[110px] px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition-all"
                              >
                                WhatsApp
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePagination
                    page={dueNextWeekPage}
                    totalItems={dueNextWeekMembers.length}
                    onPageChange={setDueNextWeekPage}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default AdminDashBoard;
