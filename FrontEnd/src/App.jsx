import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Atom } from "react-loading-indicators";
import ProtectedRoute from "./components/ProtectedRoute ";
import { Toaster } from "sonner";
import Feedback from "./pages/Feedback";
const Home = lazy(() => import("./pages/Home"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const Interview = lazy(() => import("./pages/Interview"));
import Feedback2 from "./pages/Feedback2";
import "./App.css";
import ResetPassword from "./pages/ResetPassword";
const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="app-container">
        <div className="grid-background" />
        <div className="content-container">
          <Router>
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-screen">
                  <Atom color="#0d57dc" size="medium" text="" textColor="" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signingsignup" element={<AuthPage />} />
                {/* Protect these routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/interview/:interviewId"
                  element={
                    <ProtectedRoute>
                      <Interview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/interview/results/:interviewId"
                  element={
                    <ProtectedRoute>
                      <Feedback2 />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="admin/view-interview"
                  element={
                    <ProtectedRoute>
                      <Feedback />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />
              </Routes>
            </Suspense>
          </Router>
          <Toaster
            toastOptions={{
              style: {
                backgroundColor: "black",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px",
                boxShadow: "0 0 10px blue",
                height: "60px",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              },
              icon: ({ icon }) => <span className="text-white">{icon}</span>,
            }}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
