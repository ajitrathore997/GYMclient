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


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import { Heading, Loader } from '../../components';
import { toast } from "react-hot-toast";
import { BASE_URL } from "../../utils/fetchData";
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles

const AdminDashBoard = () => {
  const [userCount, setUserCount] = useState(null);
  const [planCount, setPlanCount] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [contactCount, setContactCount] = useState(null);
  const [feedbackCount, setFeedbackCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [memberStats, setMemberStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // AOS Initialization
  useEffect(() => {
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
    getMemberStats();
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

  const getMemberStats = async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/members/dashboard`);
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

  if (loading) {
    return <Loader />
  }

  return (
    <section className='pt-10 bg-gray-900'>
      <Heading name="Admin Dashboard" />
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="p-5 border border-white bg-gray-800" data-aos="fade-up">
            <p className="text-gray-300 text-sm">Total Members</p>
            <h3 className="text-white font-bold text-3xl">
              {memberStats ? memberStats.totalMembers : "Loading..."}
            </h3>
          </div>
          <div className="p-5 border border-white bg-gray-800" data-aos="fade-up" data-aos-delay="100">
            <p className="text-gray-300 text-sm">Pending Fees</p>
            <h3 className="text-white font-bold text-3xl">
              {memberStats ? memberStats.pendingCount : "Loading..."}
            </h3>
          </div>
          <div className="p-5 border border-white bg-gray-800" data-aos="fade-up" data-aos-delay="200">
            <p className="text-gray-300 text-sm">Total Paid</p>
            <h3 className="text-white font-bold text-3xl">
              {memberStats ? memberStats.totalPaid : "Loading..."}
            </h3>
          </div>
          <div className="p-5 border border-white bg-gray-800" data-aos="fade-up" data-aos-delay="300">
            <p className="text-gray-300 text-sm">Total Remaining</p>
            <h3 className="text-white font-bold text-3xl">
              {memberStats ? memberStats.totalRemaining : "Loading..."}
            </h3>
          </div>
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

          <div className="bg-gray-800 p-5 border border-white" data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-white text-xl font-semibold mb-4">Membership Types</h3>
            {statsLoading && <p className="text-gray-300">Loading...</p>}
            {!statsLoading && memberStats && (
              <div className="space-y-3">
                {Object.entries(memberStats.membershipTypeCounts).map(([label, value]) => {
                  const max = Math.max(...Object.values(memberStats.membershipTypeCounts), 1);
                  const width = Math.round((value / max) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-gray-300 text-sm mb-1">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded">
                        <div className="h-3 bg-green-500 rounded" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
          {statsLoading && <p className="text-gray-300">Loading...</p>}
          {!statsLoading && memberStats && (
            <>
              <p className="text-gray-300 mb-3">
                Count: {memberStats.dueNextWeekCount}
              </p>
              {memberStats.dueNextWeekMembers.length === 0 ? (
                <p className="text-gray-400">No upcoming dues in the next week.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-gray-200">
                    <thead className="bg-gray-700 text-gray-100">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Remaining</th>
                        <th className="px-4 py-3">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberStats.dueNextWeekMembers.map((m) => (
                        <tr key={m._id} className="border-b border-gray-700">
                          <td className="px-4 py-3">{m.name}</td>
                          <td className="px-4 py-3">{m.phone}</td>
                          <td className="px-4 py-3">{m.remainingAmount}</td>
                          <td className="px-4 py-3">
                            {new Date(m.endDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default AdminDashBoard;
