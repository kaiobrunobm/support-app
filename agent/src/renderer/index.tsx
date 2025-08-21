import { createRoot } from "react-dom/client";
import '../index.css'
import App from './App'
import Admin from "./screens/admin/Admin";
import Dashboard from "./screens/dashboard/Dashboard";
import React from "react";
import { ContextProvider } from "../utils/ContextProvider";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import Sidebar from "./screens/components/Sidebar";
import HardwareScreen from "./screens/dashboard/hardware/Hardware";

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <ContextProvider>
      <Toaster richColors position="bottom-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />

          <Route element={<Sidebar />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/hardware" element={<HardwareScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  </React.StrictMode >
)
