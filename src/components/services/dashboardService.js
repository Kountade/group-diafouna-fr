import AxiosInstance from '../AxiosInstance';

// Correction : Pas de /api/ devant dashboard
const API_BASE = '/dashboard';

export const dashboardService = {
  // Obtenir les statistiques globales
  getStats: async (dateRange = 'last_30_days') => {
    try {
      const response = await AxiosInstance.get(`${API_BASE}/stats/`, {
        params: { date_range: dateRange }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getStats:', error);
      throw error;
    }
  },

  // Obtenir les tendances
  getTrends: async (dateRange = 'last_30_days') => {
    try {
      const response = await AxiosInstance.get(`${API_BASE}/trends/`, {
        params: { date_range: dateRange }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getTrends:', error);
      throw error;
    }
  },

  // Obtenir les meilleurs performeurs
  getTopPerformers: async (limit = 10) => {
    try {
      const response = await AxiosInstance.get(`${API_BASE}/top-performers/`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getTopPerformers:', error);
      throw error;
    }
  },

  // Obtenir les analyses des retraits
  getWithdrawalAnalytics: async (dateRange = 'last_30_days') => {
    try {
      const response = await AxiosInstance.get(`${API_BASE}/withdrawal-analytics/`, {
        params: { date_range: dateRange }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getWithdrawalAnalytics:', error);
      throw error;
    }
  },

  // Obtenir l'instantané des soldes
  getBalanceSnapshot: async () => {
    try {
      const response = await AxiosInstance.get(`${API_BASE}/balance-snapshot/`);
      return response.data;
    } catch (error) {
      console.error('Erreur getBalanceSnapshot:', error);
      throw error;
    }
  },

  // Obtenir les alertes
  getAlerts: async () => {
    try {
      const response = await AxiosInstance.get(`${API_BASE}/alerts/`);
      return response.data;
    } catch (error) {
      console.error('Erreur getAlerts:', error);
      throw error;
    }
  },

  // Obtenir le résumé complet
  getDashboardSummary: async (dateRange = 'last_30_days') => {
    try {
      const response = await AxiosInstance.get(`${API_BASE}/summary/`, {
        params: { date_range: dateRange }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getDashboardSummary:', error);
      throw error;
    }
  }
};