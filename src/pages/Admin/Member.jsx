import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/fetchData";

const AddMember = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  // Member state
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

  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    const nextMember = { ...member, [id]: value };
    if (id === "fee" || id === "paidAmount") {
      const fee = Number(id === "fee" ? value : nextMember.fee || 0);
      const paid = Number(id === "paidAmount" ? value : nextMember.paidAmount || 0);
      nextMember.remainingAmount = Math.max(fee - paid, 0);
      if (!(nextMember.paymentStatus === "Free Trial" && fee === 0)) {
        nextMember.paymentStatus = nextMember.remainingAmount === 0 ? "Paid" : "Pending";
      }
    }
    setMember(nextMember);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.user) {
      toast.error("Please log in to add a member.");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/v1/members`, member);
      if (res.data.success) {
        toast.success("Member added successfully!");
        navigate("/dashboard/admin/members");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong!";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <section className="py-20 bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6">
        <form
          className="flex flex-col gap-5 w-full max-w-3xl mx-auto"
          onSubmit={handleSubmit}
        >
          <h2 className="text-4xl font-bold text-white text-center mb-6">
            Add New Member
          </h2>

          {error && <div className="text-red-500 text-center">{error}</div>}

          {/* Personal Info */}
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

          {/* Date of Birth */}
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

          {/* Gender */}
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

          {/* Membership Start Date */}
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
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Paid Amount</label>
            <input
              type="number"
              placeholder="Paid Amount"
              id="paidAmount"
              value={member.paidAmount}
              onChange={handleChange}
              className="p-3 rounded-md outline-none w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white font-bold mb-1">Remaining Amount</label>
            <input
              type="number"
              id="remainingAmount"
              value={member.remainingAmount}
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

          {/* Personal Trainer */}
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
            className="btn px-5 py-3 text-xl font-medium text-white bg-blue-500 rounded-md hover:bg-blue-700 transition-all"
          >
            Add Member
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddMember;
