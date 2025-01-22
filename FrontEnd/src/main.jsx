import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import regeneratorRuntime from "regenerator-runtime";
import App from "./App.jsx";
import React from "react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
