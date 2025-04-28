import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ReactDOM from "react-dom/client";
import App from "./App";
import Testing from "./testing";
import "./App.css";
import testing from "./testing";

const RenderPage = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/main" element={<App />} />
          <Route path="/" element={<Testing />} />
        </Routes>
      </Router>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RenderPage />
  </React.StrictMode>
);
