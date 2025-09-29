import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useAppContext  } from './context/ContextProvider';
import { CircleNotchIcon } from '@phosphor-icons/react';

import LoginPage from './pages/login/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import Hardware from './pages/hardware/Hardware';
import Network from './pages/network/Network';
import SystemList from './pages/systemList/SystemList';
import CreateUserPage from './pages/createUser/CreateUser';
import TicketsListPage from './pages/ticketsList/TicketsList';
import TicketChatPage from './pages/ticketChat/TicketChat';


// A new component to handle route protection
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
    // Show a loading spinner while checking for a token
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <CircleNotchIcon size={40} weight="bold" className="animate-spin text-text" />
      </div>
    );
  }

  if (!user) {
    // If not loading and no user, redirect to the login page
    return <Navigate to="/" replace />;
  }

  // If a user exists, render the requested page
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Route: The login page */}
      <Route path="/" element={<LoginPage />} />

      {/* Protected Routes: All routes inside here require the user to be logged in */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Sidebar />
          </ProtectedRoute>
        }
      >
        {/* Nested routes will be rendered inside the MainLayout's <Outlet> */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="hardware" element={<Hardware />} />
        <Route path="network" element={<Network />} />
        <Route path="systems" element={<SystemList />} />
        <Route path="create-user" element={<CreateUserPage />} />
        <Route path="tickets" element={<TicketsListPage />} />
                <Route path="tickets/:ticketId" element={<TicketChatPage />} />
        
        {/* Add new pages for Systems List, Tickets, etc. here */}
      </Route>
      

      {/* Fallback route to redirect any unknown paths */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
