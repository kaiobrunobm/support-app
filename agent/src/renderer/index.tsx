import { createRoot } from "react-dom/client";
import '../index.css'
import App from './App'
import Admin from "./screens/Admin";
import Dashboard from "./screens/Dashboard";
import React from "react";
import { ContextProvider } from "../utils/ContextProvider";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <ContextProvider>
      <Toaster richColors position="bottom-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  </React.StrictMode>
)
