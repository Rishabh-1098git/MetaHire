import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import InterviewSetup from "./InterviewSetup"; // Import your InterviewSetup component

const AdminPage = () => {
  const [openModal, setOpenModal] = useState(false); // Manage modal open state
  const navigate = useNavigate();

  const handleCreateMeeting = () => {
    setOpenModal(true); // Open the modal when the button is clicked
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
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

      {/* Modal for Interview Setup */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {" "}
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
          >
            🎯 Set Up Your Interview
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column", // This makes sure the children stack vertically
            justifyContent: "center", // Centers vertically
            alignItems: "center", // Centers horizontally
            height: "100%", // Make sure the content area takes full height
            overflow: "hidden", // Prevent scrolling
          }}
        >
          <InterviewSetup />{" "}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminPage;
