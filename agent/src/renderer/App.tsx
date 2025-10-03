import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useAppContext } from './context/ContextProvider';
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
import AssignUserPage from './pages/AssignUser';
import ReassignUserPage from './pages/reassignUser/ReassignUser';
import EditUserPage from './pages/updateUser/UpdateUser';


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
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Sidebar />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="hardware" element={<Hardware />} />
        <Route path="network" element={<Network />} />
        <Route path="systems" element={<SystemList />} />
        <Route path="create-user" element={<CreateUserPage />} />
        <Route path="assign-user" element={<AssignUserPage />} />
        <Route path="reassign-user" element={<ReassignUserPage />} />
         <Route path="users/:userId/edit" element={<EditUserPage />} />

        <Route path="tickets" element={<TicketsListPage />} />
      </Route>

      <Route 
        path="/app/tickets/:ticketId" 
        element={
          <ProtectedRoute>
            <TicketChatPage />
          </ProtectedRoute>
        } 
      />


      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
