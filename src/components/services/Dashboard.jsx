import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  RefreshCw, Loader2, CheckCircle, XCircle,
  TrendingUp, Users, Wallet, AlertCircle, DollarSign,
  Building2, UserCheck, TrendingDown, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, LineChart, Calendar, Download,
  Printer, Activity, Zap, Award, Star, Clock, Globe,
  Shield, Sparkles, Crown, Target, Rocket
} from 'lucide-react';
import Chart from 'chart.js/auto';
import AxiosInstance from '../AxiosInstance';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: 'success' 
  });

  // Refs pour les graphiques
  const trendChartRef = useRef(null);
  const trendChartInstance = useRef(null);
  const pieChartRef = useRef(null);
  const pieChartInstance = useRef(null);
  const barChartRef = useRef(null);
  const barChartInstance = useRef(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatNumber = (number) => {
    if (number === undefined || number === null) return '0';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 CFA';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0 CFA';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num).replace('XOF', 'CFA');
  };

  const formatCompact = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return formatNumber(num);
  };

  const fetchDashboardData = useCallback(async (range = dateRange) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AxiosInstance.get('/dashboard/summary/', {
        params: { date_range: range }
      });
      
      setData(response.data);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      let errorMessage = 'Erreur lors du chargement des données';
      if (error.response) {
        errorMessage = error.response.data?.error || 
                      error.response.data?.message || 
                      `Erreur ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur.';
      } else {
        errorMessage = error.message || 'Erreur inconnue';
      }
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    showNotification('Données actualisées avec succès', 'success');
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    fetchDashboardData(newRange);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Créer les graphiques
  useEffect(() => {
    if (data) {
      createTrendChart();
      createPieChart();
      createBarChart();
    }
    return () => {
      destroyCharts();
    };
  }, [data]);

  const destroyCharts = () => {
    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
      trendChartInstance.current = null;
    }
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
      pieChartInstance.current = null;
    }
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
      barChartInstance.current = null;
    }
  };

  const createTrendChart = () => {
    if (!trendChartRef.current || !data?.trends?.daily) return;
    
    const ctx = trendChartRef.current.getContext('2d');
    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
    }

    const labels = data.trends.daily.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    });

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');

    trendChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Transactions',
            data: data.trends.daily.map(d => d.amount),
            borderColor: '#4F46E5',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#4F46E5',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'Dépôts',
            data: data.trends.daily.map(d => d.deposits_amount || 0),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'Retraits',
            data: data.trends.daily.map(d => d.withdrawals_amount || 0),
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#EF4444',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
            ticks: {
              callback: function(value) { return formatCurrency(value); },
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  };

  const createPieChart = () => {
    if (!pieChartRef.current || !data?.stats?.transactions) return;
    
    const ctx = pieChartRef.current.getContext('2d');
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }

    const transactions = data.stats.transactions;
    const colors = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B'];

    pieChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Dépôts', 'Retraits', 'Transferts', 'Autres'],
        datasets: [{
          data: [
            transactions.deposits || 0,
            transactions.withdrawals || 0,
            transactions.transfers || 0,
            0
          ],
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: { size: 12, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                return `${context.label}: ${formatNumber(context.parsed)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  };

  const createBarChart = () => {
    if (!barChartRef.current || !data?.top_performers) return;
    
    const ctx = barChartRef.current.getContext('2d');
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    const partners = data.top_performers.top_partners?.slice(0, 6) || [];
    const agents = data.top_performers.top_agents?.slice(0, 6) || [];

    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: partners.map(p => p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name),
        datasets: [
          {
            label: 'Partenaires',
            data: partners.map(p => p.volume),
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderColor: '#4F46E5',
            borderWidth: 2,
            borderRadius: 6,
            barThickness: 30
          },
          {
            label: 'Agents',
            data: agents.map(a => a.volume),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10B981',
            borderWidth: 2,
            borderRadius: 6,
            barThickness: 30
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 12, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
            ticks: {
              callback: function(value) { return formatCurrency(value); },
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
          </div>
          <p className="mt-4 text-base-content/60 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-error/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-error" />
          </div>
          <h3 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h3>
          <p className="text-base-content/70 mb-4">{error}</p>
          <button 
            onClick={() => fetchDashboardData()} 
            className="btn btn-primary gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-2xl border-0`}>
            {notification.type === 'success' ? 
              <CheckCircle className="w-6 h-6" /> : 
              <XCircle className="w-6 h-6" />
            }
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification({ ...notification, show: false })} 
              className="btn btn-sm btn-ghost btn-square"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="w-full">
        {/* Header Premium avec effet glassmorphism */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
          
          <div className="relative px-6 py-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl animate-pulse"></div>
                    <div className="relative p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Tableau de bord
                    </h1>
                    <p className="text-base-content/50 text-sm mt-0.5 flex items-center gap-2">
                      <span>Vue d'ensemble de l'activité financière</span>
                      <span className="w-1 h-1 rounded-full bg-base-content/30"></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date().toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-base-100/80 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm border border-base-200/50">
                  <Globe className="w-4 h-4 text-base-content/40" />
                  <span className="text-sm text-base-content/60">En ligne</span>
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                </div>
                <select 
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="select select-bordered select-sm bg-base-100/80 backdrop-blur-sm border-base-200/50 focus:border-primary"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="last_7_days">7 derniers jours</option>
                  <option value="last_30_days">30 derniers jours</option>
                  <option value="last_90_days">90 derniers jours</option>
                  <option value="last_year">Dernière année</option>
                  <option value="all_time">Tout le temps</option>
                </select>
                <button 
                  onClick={handleRefresh} 
                  className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 transition-colors"
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-6 py-6">
          {/* KPI Cards avec effets premium */}
          {data?.stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="group relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary/70">Solde Global</p>
                      <p className="text-2xl font-bold text-base-content mt-1">
                        {formatCurrency(data.stats.global_account?.balance || 0)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" /> +2.5%
                        </span>
                        <span className="text-xs text-base-content/40">vs mois dernier</span>
                      </div>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <Wallet className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-success/10 via-success/5 to-transparent rounded-2xl border border-success/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-success/70">Total Dépôts</p>
                      <p className="text-2xl font-bold text-base-content mt-1">
                        {formatCurrency(data.stats.transactions?.deposits_amount || 0)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" /> +12.3%
                        </span>
                        <span className="text-xs text-base-content/40">vs mois dernier</span>
                      </div>
                    </div>
                    <div className="p-3 bg-success/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-success" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-error/10 via-error/5 to-transparent rounded-2xl border border-error/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-error/70">Total Retraits</p>
                      <p className="text-2xl font-bold text-base-content mt-1">
                        {formatCurrency(data.stats.transactions?.withdrawals_amount || 0)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs bg-error/20 text-error px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3" /> -3.8%
                        </span>
                        <span className="text-xs text-base-content/40">vs mois dernier</span>
                      </div>
                    </div>
                    <div className="p-3 bg-error/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <TrendingDown className="w-6 h-6 text-error" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-warning/10 via-warning/5 to-transparent rounded-2xl border border-warning/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-warning/70">Transactions</p>
                      <p className="text-2xl font-bold text-base-content mt-1">
                        {formatNumber(data.stats.transactions?.total || 0)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" /> +8.7%
                        </span>
                        <span className="text-xs text-base-content/40">vs mois dernier</span>
                      </div>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-warning" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats rapides avec badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="flex items-center gap-3 bg-base-100/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-base-200/50 hover:border-primary/20 transition-colors">
              <div className="p-2 bg-primary/5 rounded-lg">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Partenaires</p>
                <p className="text-sm font-bold">{formatNumber(data?.stats?.partners?.total || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-base-100/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-base-200/50 hover:border-success/20 transition-colors">
              <div className="p-2 bg-success/5 rounded-lg">
                <UserCheck className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Agents actifs</p>
                <p className="text-sm font-bold">{formatNumber(data?.stats?.agents?.active || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-base-100/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-base-200/50 hover:border-warning/20 transition-colors">
              <div className="p-2 bg-warning/5 rounded-lg">
                <DollarSign className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Dépôts</p>
                <p className="text-sm font-bold">{formatNumber(data?.stats?.transactions?.deposits || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-base-100/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-base-200/50 hover:border-error/20 transition-colors">
              <div className="p-2 bg-error/5 rounded-lg">
                <TrendingDown className="w-4 h-4 text-error" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Retraits</p>
                <p className="text-sm font-bold">{formatNumber(data?.stats?.transactions?.withdrawals || 0)}</p>
              </div>
            </div>
          </div>

          {/* Onglets stylisés */}
          <div className="tabs tabs-boxed bg-base-100/80 backdrop-blur-sm shadow-sm p-1 mb-6 border border-base-200/50 rounded-2xl">
            <button 
              className={`tab gap-2 ${activeTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="w-4 h-4" />
              Vue d'ensemble
            </button>
            <button 
              className={`tab gap-2 ${activeTab === 'trends' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('trends')}
            >
              <LineChart className="w-4 h-4" />
              Tendances
            </button>
            <button 
              className={`tab gap-2 ${activeTab === 'distribution' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('distribution')}
            >
              <PieChart className="w-4 h-4" />
              Distribution
            </button>
            <button 
              className={`tab gap-2 ${activeTab === 'performers' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('performers')}
            >
              <Award className="w-4 h-4" />
              Performeurs
            </button>
          </div>

          {/* Graphiques avec glassmorphism */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {(activeTab === 'overview' || activeTab === 'trends') && (
              <div className="card bg-base-100/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300 lg:col-span-2 border border-base-200/50 rounded-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="relative card-body p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                        <span className="p-1.5 bg-primary/10 rounded-lg">
                          <LineChart className="w-4 h-4 text-primary" />
                        </span>
                        Évolution des transactions
                      </h3>
                      <p className="text-sm text-base-content/50">Tendance sur la période sélectionnée</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost btn-sm btn-square hover:bg-primary/10" title="Exporter">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-square hover:bg-primary/10" title="Imprimer">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="h-[350px]">
                    <canvas ref={trendChartRef} />
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'overview' || activeTab === 'distribution') && (
              <div className="card bg-base-100/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-base-200/50 rounded-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-success/5 rounded-full blur-3xl"></div>
                <div className="relative card-body p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                        <span className="p-1.5 bg-primary/10 rounded-lg">
                          <PieChart className="w-4 h-4 text-primary" />
                        </span>
                        Distribution des transactions
                      </h3>
                      <p className="text-sm text-base-content/50">Répartition par type</p>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <canvas ref={pieChartRef} />
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'overview' || activeTab === 'performers') && (
              <div className="card bg-base-100/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-base-200/50 rounded-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-warning/5 rounded-full blur-3xl"></div>
                <div className="relative card-body p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                        <span className="p-1.5 bg-primary/10 rounded-lg">
                          <BarChart3 className="w-4 h-4 text-primary" />
                        </span>
                        Top Performeurs
                      </h3>
                      <p className="text-sm text-base-content/50">Volume des transactions</p>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <canvas ref={barChartRef} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Performers détaillés avec design premium */}
          {activeTab === 'performers' && data?.top_performers && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card bg-base-100/90 backdrop-blur-sm shadow-xl border border-base-200/50 rounded-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-2xl"></div>
                <div className="relative card-body p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-success/10 rounded-xl">
                      <Building2 className="w-5 h-5 text-success" />
                    </div>
                    <h3 className="text-lg font-bold text-base-content">Top Partenaires</h3>
                    <span className="ml-auto text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                      Volume total
                    </span>
                  </div>
                  <div className="space-y-3">
                    {data.top_performers.top_partners?.slice(0, 5).map((partner, index) => (
                      <div key={partner.id} className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                            index === 1 ? 'bg-gray-400/20 text-gray-400' :
                            index === 2 ? 'bg-amber-600/20 text-amber-600' :
                            'bg-base-300/50 text-base-content/50'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-base-content">{partner.name}</p>
                            <p className="text-xs text-base-content/50">
                              {formatNumber(partner.transaction_count)} transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatCurrency(partner.volume)}</p>
                          <p className="text-xs text-base-content/50">
                            {formatCurrency(partner.avg_transaction)} en moyenne
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100/90 backdrop-blur-sm shadow-xl border border-base-200/50 rounded-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full blur-2xl"></div>
                <div className="relative card-body p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-info/10 rounded-xl">
                      <Users className="w-5 h-5 text-info" />
                    </div>
                    <h3 className="text-lg font-bold text-base-content">Top Agents</h3>
                    <span className="ml-auto text-xs bg-info/10 text-info px-2 py-0.5 rounded-full font-medium">
                      Volume total
                    </span>
                  </div>
                  <div className="space-y-3">
                    {data.top_performers.top_agents?.slice(0, 5).map((agent, index) => (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                            index === 1 ? 'bg-gray-400/20 text-gray-400' :
                            index === 2 ? 'bg-amber-600/20 text-amber-600' :
                            'bg-base-300/50 text-base-content/50'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-base-content">{agent.name}</p>
                            <p className="text-xs text-base-content/50">{agent.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-success">{formatCurrency(agent.volume)}</p>
                          <p className="text-xs text-base-content/50">
                            {formatNumber(agent.transaction_count)} transactions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analyses supplémentaires avec design premium */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {data?.withdrawal_analytics && (
                <div className="card bg-base-100/90 backdrop-blur-sm shadow-xl border border-base-200/50 rounded-2xl overflow-hidden lg:col-span-2">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-error/5 rounded-full blur-3xl"></div>
                  <div className="relative card-body p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-error/10 rounded-xl">
                        <TrendingDown className="w-5 h-5 text-error" />
                      </div>
                      <h3 className="text-lg font-bold text-base-content">Analyse des retraits</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="stat bg-base-200/50 rounded-xl p-4">
                        <div className="stat-title text-xs text-base-content/50">Total retraits</div>
                        <div className="stat-value text-xl">{formatNumber(data.withdrawal_analytics.total_withdrawals)}</div>
                      </div>
                      <div className="stat bg-base-200/50 rounded-xl p-4">
                        <div className="stat-title text-xs text-base-content/50">Montant total</div>
                        <div className="stat-value text-xl">{formatCurrency(data.withdrawal_analytics.total_amount)}</div>
                      </div>
                      <div className="stat bg-base-200/50 rounded-xl p-4">
                        <div className="stat-title text-xs text-base-content/50">Moyenne</div>
                        <div className="stat-value text-xl">{formatCurrency(data.withdrawal_analytics.avg_amount)}</div>
                      </div>
                    </div>
                    {data.withdrawal_analytics.top_recipients?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-base-content/70 mb-2">Top bénéficiaires</p>
                        <div className="space-y-2">
                          {data.withdrawal_analytics.top_recipients.slice(0, 3).map((recipient) => (
                            <div key={recipient.id} className="flex justify-between items-center p-3 bg-base-200/50 rounded-xl">
                              <div>
                                <span className="font-medium">{recipient.name}</span>
                                <p className="text-xs text-base-content/50">{recipient.phone}</p>
                              </div>
                              <span className="font-bold text-error">{formatCurrency(recipient.total_amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data?.balance_snapshot && (
                <div className="card bg-base-100/90 backdrop-blur-sm shadow-xl border border-base-200/50 rounded-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                  <div className="relative card-body p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Wallet className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-base-content">Soldes</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="stat bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-4 border border-success/20">
                        <div className="stat-title text-xs text-base-content/50">Partenaires</div>
                        <div className="stat-value text-xl">{formatNumber(data.balance_snapshot.partner_accounts?.total || 0)}</div>
                        <div className="stat-desc text-sm font-medium text-success">
                          {formatCurrency(data.balance_snapshot.partner_accounts?.total_balance || 0)}
                        </div>
                      </div>
                      <div className="stat bg-gradient-to-br from-info/10 to-info/5 rounded-xl p-4 border border-info/20">
                        <div className="stat-title text-xs text-base-content/50">Agents</div>
                        <div className="stat-value text-xl">{formatNumber(data.balance_snapshot.agent_accounts?.total || 0)}</div>
                        <div className="stat-desc text-sm font-medium text-info">
                          {formatCurrency(data.balance_snapshot.agent_accounts?.total_balance || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        
        .tab-active {
          background: linear-gradient(135deg, #4F46E5, #7C3AED) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        
        .tab {
          transition: all 0.3s ease;
        }
        
        .tab:hover:not(.tab-active) {
          background: rgba(79, 70, 229, 0.05);
        }
        
        /* Effet de brillance sur les cartes */
        .card {
          position: relative;
          overflow: hidden;
        }
        
        .card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
        
        .card:hover::before {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default Dashboard;