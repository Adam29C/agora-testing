import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

const RenderPage = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/main" element={<App />} />
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
