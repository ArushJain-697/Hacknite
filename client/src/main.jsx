import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './styles/global.css'
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import GlobalBackgroundMusic from "./components/GlobalBackgroundMusic";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <GlobalBackgroundMusic src='/assets/audio.mpeg' excludePath='/' />
    <App />
    </BrowserRouter>
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
