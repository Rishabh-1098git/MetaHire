import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import InterviewSetup from "./InterviewSetup";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AddSidebar } from "../components/AppSidebar";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import PracticeInterview from "../components/PracticeInterview";
import Profile from "../components/Profile";
import InterviewHistory from "../components/InterviewHistory";
import { ThreeDot } from "react-loading-indicators";
const AdminPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [activeComponent, setActiveComponent] = useState("Practice Interview");

  const handleCreateMeeting = () => {
    setActiveComponent("createMeeting");
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const renderContent = () => {
    switch (activeComponent) {
      case "Practice Interview":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <PracticeInterview />
          </div>
        );
      case "Profile":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Profile />
          </div>
        );
      case "Interview History":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <InterviewHistory />
          </div>
        );
      case "Perfomance Analysis":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-10 font-mainFont text-lg">Coming soon ...</div>
            <div>
              <ThreeDot
                variant="bounce"
                color="blue"
                size="medium"
                text=""
                textColor=""
              />
            </div>
          </div>
        );
      case "Recommended Courses":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-10 font-mainFont text-lg">Coming soon ...</div>
            <div>
              <ThreeDot
                variant="bounce"
                color="blue"
                size="medium"
                text=""
                textColor=""
              />
            </div>
          </div>
        );
      case "Community":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-10 font-mainFont text-lg">Coming soon ...</div>
            <div>
              <ThreeDot
                variant="bounce"
                color="blue"
                size="medium"
                text=""
                textColor=""
              />
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      {/* Full height and width container */}
      <div className="flex h-full w-full">
        {/* Fixed width sidebar */}
        <div className="w-64 flex-shrink-0 bg-gray-800 text-white">
          <SidebarTrigger />
          <AddSidebar setActiveComponent={setActiveComponent} />
        </div>

        {/* Flexible main content area */}
        <div className="flex-1  p-8 min-h-full bg-black">{renderContent()}</div>

        {/* Modal */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
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
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <InterviewSetup />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="error">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
