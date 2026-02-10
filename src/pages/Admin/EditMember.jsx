import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/fetchData";

const EditMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentCycle, setCurrentCycle] = useState(null);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [carryForward, setCarryForward] = useState(0);
  const [adjustPayment, setAdjustPayment] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [member, setMember] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    healthNotes: "",
    membershipType: "Basic",
    startDate: "",
    duration: "1 Month",
    fee: 0,
    paidAmount: 0,
    remainingAmount: 0,
    paymentStatus: "Paid",
    personalTrainer: "Not Assigned",
    assignedTrainer: "",
    profilePic: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    const nextMember = { ...member, [id]: value };
    if (id === "fee" || (id === "paidAmount" && adjustPayment)) {
      const fee = Number(id === "fee" ? value : nextMember.fee || 0);
      const paid = Number(id === "paidAmount" ? value : nextMember.paidAmount || 0);
      const cycleRemaining = Math.max(fee - paid, 0);
      nextMember.remainingAmount = cycleRemaining;
      setTotalOutstanding(Math.max(carryForward + cycleRemaining, 0));
      if (!(nextMember.paymentStatus === "Free Trial" && fee === 0)) {
        nextMember.paymentStatus = nextMember.remainingAmount === 0 ? "Paid" : "Pending";
      }
    }
    setMember(nextMember);
  };

  const fetchMember = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/members/${id}`);
      if (res.data?.success) {
        const m = res.data.member;
        const cycle = res.data.currentCycle || null;
        const totalOut = Number(res.data.totalOutstanding || 0);
        const cycleRemaining = cycle ? Number(cycle.remainingAmount || 0) : 0;
        const fee = m.fee || 0;
        const paidAmount = cycle ? Number(cycle.paidAmount || 0) : (m.paidAmount || 0);
        const remainingAmount =
          cycle ? cycleRemaining : (m.remainingAmount ?? Math.max(fee - paidAmount, 0));
        const carry = Math.max(totalOut - remainingAmount, 0);
        setCurrentCycle(cycle);
        setTotalOutstanding(totalOut);
        setCarryForward(carry);
        setMember({
          name: m.name || "",
          email: m.email || "",
          phone: m.phone || "",
          dob: m.dob ? new Date(m.dob).toISOString().slice(0, 10) : "",
          gender: m.gender || "Male",
          address: m.address || "",
          emergencyName: m.emergencyName || "",
          emergencyPhone: m.emergencyPhone || "",
          healthNotes: m.healthNotes || "",
          membershipType: m.membershipType || "Basic",
          startDate: m.startDate ? new Date(m.startDate).toISOString().slice(0, 10) : "",
          duration: m.duration || "1 Month",
          fee: cycle ? Number(cycle.fee || fee) : fee,
          paidAmount,
          remainingAmount,
          paymentStatus: m.paymentStatus || "Paid",
          personalTrainer: m.personalTrainer || "Not Assigned",
          assignedTrainer: m.assignedTrainer || "",
          profilePic: m.profilePic || "",
        });
      } else {
        setError(res.data?.message || "Failed to load member");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load member");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { ...member };
      if (!adjustPayment) {
        delete payload.paidAmount;
        delete payload.remainingAmount;
        delete payload.paymentStatus;
      }
      const res = await axios.put(`${BASE_URL}/api/v1/members/${id}`, payload);
      if (res.data?.success) {
        toast.success("Member updated");
        navigate("/dashboard/admin/members");
      } else {
        setError(res.data?.message || "Failed to update member");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);
    try {
      setUploading(true);
      const res = await axios.post(`${BASE_URL}/api/v1/members/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        setMember((prev) => ({ ...prev, profilePic: res.data.url }));
        toast.success("Profile picture uploaded");
      } else {
        toast.error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  return (
    <section className="py-16 bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Edit Member</h2>
          <Link
            to="/dashboard/admin/members"
            className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-all"
          >
            Back to Members
          </Link>
        </div>

        {loading && <p className="text-white">Loading...</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form
          className="flex flex-col gap-5 w-full max-w-3xl"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Full Name"
            id="name"
            value={member.name}
            onChange={handleChange}
            className="p-3 rounded-md outline-none w-full"
          />
          <input
            type="email"
            placeholder="Email"
            id="email"
            value={member.email}
            onChange={handleChange}
            className="p-3 rounded-md outline-none w-full"
          />
          <input
            type="text"
            placeholder="Phone"
            id="phone"
            value={member.phone}
            onChange={handleChange}
            className="p-3 rounded-md outline-none w-full"
          />

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={member.dob}
              onChange={handleChange}
              className="p-3 rounded-md outline-none w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Gender</label>
            <select
              id="gender"
              value={member.gender}
              onChange={handleChange}
              className="p-3 rounded-md outline-none w-full"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Address"
            id="address"
            value={member.address}
            onChange={handleChange}
            className="p-3 rounded-md outline-none w-full"
          />
          <input
            type="text"
            placeholder="Emergency Contact Name"
            id="emergencyName"
            value={member.emergencyName}
            onChange={handleChange}
            className="p-3 rounded-md outline-none w-full"
          />
          <input
            type="text"
            placeholder="Emergency Contact Phone"
            id="emergencyPhone"
            value={member.emergencyPhone}
            onChange={handleChange}
            className="p-3 rounded-md outline-none w-full"
          />
          <input
            type="text"
            placeholder="Health Notes"
            id="healthNotes"
            value={member.healthNotes}
            onChange={handleChange}
            className="p-3 rounded-md outline-none w-full"
          />

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileUpload}
              className="p-2 rounded-md outline-none w-full bg-white"
            />
            {uploading && <span className="text-xs text-gray-300 mt-1">Uploading...</span>}
            {member.profilePic && (
              <img
                src={member.profilePic}
                alt="Profile"
                className="mt-2 w-24 h-24 object-cover rounded"
              />
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Membership Start Date</label>
            <input
              type="date"
              id="startDate"
              value={member.startDate}
              onChange={handleChange}
              className="p-3 rounded-md outline-none w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Duration</label>
            <select
              id="duration"
              value={member.duration}
              onChange={handleChange}
              className="p-3 rounded-md outline-none w-full"
            >
              <option>1 Month</option>
              <option>3 Months</option>
              <option>6 Months</option>
              <option>1 Year</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Fee</label>
            <input
              type="number"
              placeholder="Fee"
              id="fee"
              value={member.fee}
              onChange={handleChange}
              className="p-3 rounded-md outline-none w-full"
            />
            <span className="text-xs text-gray-400 mt-1">
              Changing fee applies to the next cycle, not the current one.
            </span>
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Paid Amount (Current Cycle)</label>
            <label className="inline-flex items-center gap-2 text-xs text-gray-300 mb-2">
              <input
                type="checkbox"
                checked={adjustPayment}
                onChange={(e) => setAdjustPayment(e.target.checked)}
              />
              Adjust current cycle payment
            </label>
            <input
              type="number"
              placeholder="Paid Amount"
              id="paidAmount"
              value={member.paidAmount}
              onChange={handleChange}
              className="p-3 rounded-md outline-none w-full"
              readOnly={!adjustPayment}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Remaining Amount (Current Cycle)</label>
            <input
              type="number"
              id="remainingAmount"
              value={member.remainingAmount}
              readOnly
              className="p-3 rounded-md outline-none w-full bg-gray-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Carry Forward Due</label>
            <input
              type="number"
              value={carryForward}
              readOnly
              className="p-3 rounded-md outline-none w-full bg-gray-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Total Outstanding</label>
            <input
              type="number"
              value={totalOutstanding}
              readOnly
              className="p-3 rounded-md outline-none w-full bg-gray-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Payment Status</label>
            <select
              id="paymentStatus"
              value={member.paymentStatus}
              onChange={handleChange}
              className="p-3 rounded-md outline-none w-full"
            >
              <option>Paid</option>
              <option>Pending</option>
              <option>Free Trial</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Personal Trainer</label>
            <select
              id="personalTrainer"
              value={member.personalTrainer}
              onChange={handleChange}
              className="p-3 rounded-md outline-none w-full"
            >
              <option>Not Assigned</option>
              <option>Assigned</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Assigned Trainer Name"
            id="assignedTrainer"
            value={member.assignedTrainer}
            onChange={handleChange}
            className="p-3 rounded-md outline-none w-full"
          />

          <button
            type="submit"
            className="btn px-5 py-3 text-xl font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all"
            disabled={loading}
          >
            Save Changes
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditMember;
