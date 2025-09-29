import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { ContextProvider } from "./context/ContextProvider";
import { Toaster } from "sonner";
import App from './App';
import '../index.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ContextProvider>
      <Toaster richColors position="bottom-center" />
      <HashRouter>
        <App />
      </HashRouter>
    </ContextProvider>
  </React.StrictMode>
);
