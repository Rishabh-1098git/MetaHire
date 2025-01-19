import React from "react";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();

  const handleCreateMeeting = () => {
    navigate("/admin/interview-setup"); // Navigate to InterviewSetup page
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-600 mt-4">Welcome to the admin panel!</p>

      {/* Create Meeting Button */}
      <button
        onClick={handleCreateMeeting}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Create Meeting
      </button>
    </div>
  );
};

export default AdminPage;
