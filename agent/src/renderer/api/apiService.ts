
import { apiClient } from '../context/ContextProvider';
import { AppUser, CreateUserData, UpdateSystemData, CreateTicketData, AddMessageData, UpdateTicketStatusData } from '../types';


export const login = (email: string, password: string) => {
  return apiClient.post('/auth/login', { email, password });
};

export const getMe = () => {

  return apiClient.get('/users/me');
};


export const getAllSystems = () => {
  return apiClient.get('/system-info');
};

export const getSystemById = (id: string) => {
  return apiClient.get(`/system-info/${id}`);
};

export const updateSystemDetails = (id: string, data: UpdateSystemData) => {
  return apiClient.patch(`/system-info/${id}`, data);
};

export const getUnassignedSystems = () => {
  return apiClient.get('/system-info/unassigned');
};


export const getAllUsers = () => {
  return apiClient.get('/users');
};

export const createUser = (data: CreateUserData) => {
  return apiClient.post('/users', data);
};

export const assignExistingUser = (userId: string, systemId: string) => {
  return apiClient.post('/users/assign-existing', { userId, systemId });
};

export const forceReassignUser = (userId: string, newSystemId: string) => {
  return apiClient.post('/users/reassign', { userId, newSystemId });
};

export const detachUser = (systemId: string) => {
  return apiClient.delete(`/users/detach/${systemId}`);
};


export const createTicket = (data: CreateTicketData) => {
  return apiClient.post('/tickets', data);
};

export const getTicketsByStatus = (status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CANCELLED') => {
  return apiClient.get('/tickets', { params: { status } });
};

export const getTicketById = (id: string) => {
  return apiClient.get(`/tickets/${id}`);
};

export const getMyActiveTicket = () => {
  return apiClient.get('/tickets/me/active');
};

export const addMessage = (ticketId: string, data: AddMessageData) => {
  return apiClient.post(`/tickets/${ticketId}/messages`, data);
};

export const updateTicketStatus = (ticketId: string, data: UpdateTicketStatusData) => {
  return apiClient.patch(`/tickets/${ticketId}/status`, data);
};


export const getDashboardStats = () => {
  return apiClient.get('/dashboard/stats');
};

export const uploadImage = (formData: FormData) => {
  return apiClient.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getUserById = (id: string) => {
    return apiClient.get(`/users/${id}`);
};

export const updateMe = (data: Partial<AppUser>) => {
    return apiClient.patch('/users/me', data);
};

export const updateUserById = (id: string, data: Partial<AppUser>) => {
    return apiClient.patch(`/users/${id}`, data);
};

export const updatePassword = (userId: string, data: any) => {
    return apiClient.patch(`/users/${userId}/password`, data);
};
