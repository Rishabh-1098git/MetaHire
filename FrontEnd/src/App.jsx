import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import InterviewSetup from "./pages/InterviewSetup";
import Interview from "./pages/Interview";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signingsignup" element={<AuthPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/interview-setup" element={<InterviewSetup />} />
        <Route
          path="/admin/interview-setup/interview"
          element={<Interview />}
        />
      </Routes>
    </Router>
  );
};

export default App;
