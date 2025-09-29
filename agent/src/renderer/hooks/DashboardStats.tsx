import { useState, useEffect } from 'react';
import * as apiService from '../api/apiService';
import { DashboardStats } from '../types';
import { useAppContext } from '../context/ContextProvider';

export const useDashboardStats = () => {
  const { user } = useAppContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch stats if the user is an admin or IT support
    if (user?.role === 'ADMIN' || user?.role === 'IT_SUPPORT') {
      const fetchStats = async () => {
        try {
          setIsLoading(true);
          const response = await apiService.getDashboardStats();
          if (response.data.status === 'success') {
            setStats(response.data.data.stats);
          } else {
            throw new Error('Failed to fetch dashboard stats.');
          }
        } catch (err) {
          console.error(err);
          setError('Could not load dashboard statistics.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchStats();
    }
  }, [user]); // Re-fetch if the user changes

  return { stats, isLoading, error };
};
