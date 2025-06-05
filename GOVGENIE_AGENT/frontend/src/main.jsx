import React from "react";

import { BrowserRouter } from "react-router-dom";

import ReactDOM from "react-dom/client";

import "./index.css";

import App from "./App.jsx";

import { ThemeProvider } from "./components/theme-provider";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="govgenie-theme">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
