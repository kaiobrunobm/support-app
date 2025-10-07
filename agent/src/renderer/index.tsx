import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { ContextProvider } from "./context/ContextProvider";
import { Toaster } from "sonner";
import App from './App';
import '../index.css';
import Updater from "./components/Updater";
import { NotificationProvider } from "./context/NotificationContext";

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <HashRouter>
      <NotificationProvider>
      <ContextProvider>
        <Updater />
        <Toaster richColors position="bottom-left" />
        <App />
      </ContextProvider>
      </NotificationProvider>

    </HashRouter>
  </React.StrictMode>
);
