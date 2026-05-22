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
import PracticeInterview from "../components/PracticeInterview";
import Profile from "../components/Profile";
import InterviewHistory from "../components/InterviewHistory";
import PerformanceAnalysis from "../components/PerformanceAnalysis";
import { ThreeDot } from "react-loading-indicators";

const AdminPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [activeComponent, setActiveComponent] = useState("Practice Interview");

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const renderContent = () => {
    switch (activeComponent) {
      case "Practice Interview":
        return (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <PracticeInterview />
          </div>
        );
      case "Profile":
        return (
          <div className="h-full w-full">
            <Profile onNavigate={setActiveComponent} />
          </div>
        );
      case "Interview History":
        return (
          <div className="flex flex-col h-full w-full">
            <InterviewHistory />
          </div>
        );
      case "Perfomance Analysis":
        return (
          <div className="h-full w-full">
            <PerformanceAnalysis onNavigate={setActiveComponent} />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <p className="font-mainFont text-slate-400 text-base tracking-wide">
              {activeComponent} — coming soon
            </p>
            <ThreeDot variant="bounce" color="#1A6EFA" size="medium" text="" textColor="" />
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AddSidebar setActiveComponent={setActiveComponent} />
        <main
          className="flex-1 overflow-auto"
          style={{ background: "hsl(var(--background))" }}
        >
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.06]">
            <SidebarTrigger className="text-slate-400 hover:text-white" />
            <h1 className="text-sm font-medium text-slate-400 font-mainFont">
              {activeComponent}
            </h1>
          </div>
          <div className="p-6 h-[calc(100vh-57px)] overflow-auto">
            {renderContent()}
          </div>
        </main>

        {/* Legacy unused modal */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
              Set Up Your Interview
            </Typography>
          </DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", overflow: "hidden" }}
          >
            <InterviewSetup />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="error">Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
