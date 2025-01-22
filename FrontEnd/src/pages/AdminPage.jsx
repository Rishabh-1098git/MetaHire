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

const AdminPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [activeComponent, setActiveComponent] = useState("createMeeting");

  const handleCreateMeeting = () => {
    setActiveComponent("createMeeting");
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const items = [
    {
      title: "Home",
      icon: Home,
      onClick: () => setActiveComponent("home"),
    },
    {
      title: "Inbox",
      icon: Inbox,
      onClick: () => setActiveComponent("inbox"),
    },
    {
      title: "Calendar",
      icon: Calendar,
      onClick: () => setActiveComponent("calendar"),
    },
    {
      title: "Search",
      icon: Search,
      onClick: () => setActiveComponent("search"),
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => setActiveComponent("settings"),
    },
  ];

  const renderContent = () => {
    switch (activeComponent) {
      case "createMeeting":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-semibold mb-4">Create Meeting</h2>
            <button
              onClick={() => setOpenModal(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Open Modal
            </button>
          </div>
        );
      case "home":
        return <h2 className="text-xl">Home Component</h2>;
      case "inbox":
        return <h2 className="text-xl">Inbox Component</h2>;
      case "calendar":
        return <h2 className="text-xl">Calendar Component</h2>;
      case "search":
        return <h2 className="text-xl">Search Component</h2>;
      case "settings":
        return <h2 className="text-xl">Settings Component</h2>;
      default:
        return <h2>Select a Menu Item</h2>;
    }
  };

  return (
    <SidebarProvider>
      {/* Full height and width container */}
      <div className="flex h-screen w-full">
        {/* Fixed width sidebar */}
        <div className="w-64 flex-shrink-0 bg-gray-800 text-white">
          <SidebarTrigger />
          <AddSidebar items={items} />
        </div>

        {/* Flexible main content area */}
        <div className="flex-1  p-8 overflow-auto">{renderContent()}</div>

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
