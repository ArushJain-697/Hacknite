import React,{ StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import pages :
import FrontPageTerminal from "./pages/FrontPageTerminal";
import Newspaper from "./pages/Newspaper";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <FrontPageTerminal /> */}
    {/* <Newspaper /> */}
    <Router>
      <Routes>
        <Route path="/" element={<FrontPageTerminal />} />
        <Route path="/feed" element={<Newspaper />} />
      </Routes>
    </Router>
  </StrictMode>,
);

/*

import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}

*/
