import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Atom } from "react-loading-indicators";
const Home = lazy(() => import("./pages/Home"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const Interview = lazy(() => import("./pages/Interview"));
const Feedback = lazy(() => import("./pages/Feedback"));
import { Toaster } from "sonner";

import "./App.css";

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
                <Route path="/admin" element={<AdminPage />} />
                <Route
                  path="admin/interview/:interviewId"
                  element={<Interview />}
                />
                <Route
                  path="admin/interview/:interviewId/results"
                  element={<Feedback />}
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
