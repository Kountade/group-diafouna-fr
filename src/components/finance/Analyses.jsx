import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign,
  Calendar, Loader2, AlertCircle, Filter, Clock, Award,
  PieChart, LineChart, Activity, Zap, Shield, Star,
  Building2, UserCheck, Wallet, RefreshCw, Download,
  Printer, Maximize2, Minimize2, ChevronDown
} from 'lucide-react';
import Chart from 'chart.js/auto';
import AxiosInstance from '../AxiosInstance';

const Analyses = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [activeChart, setActiveChart] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedChart, setExpandedChart] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refs pour les graphiques
  const trendChartRef = useRef(null);
  const trendChartInstance = useRef(null);
  const pieChartRef = useRef(null);
  const pieChartInstance = useRef(null);
  const barChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const horizontalBarRef = useRef(null);
  const horizontalBarInstance = useRef(null);

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
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

  const fetchAnalyses = async (range = dateRange) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AxiosInstance.get('/dashboard/stats/', {
        params: { date_range: range }
      });
      
      setData(response.data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les analyses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [dateRange]);

  // Créer les graphiques
  useEffect(() => {
    if (data) {
      createTrendChart();
      createPieChart();
      createBarChart();
      createHorizontalBarChart();
    }
    return () => {
      destroyCharts();
    };
  }, [data, activeChart]);

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
    if (horizontalBarInstance.current) {
      horizontalBarInstance.current.destroy();
      horizontalBarInstance.current = null;
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

    const partners = data.top_performers.top_partners?.slice(0, 8) || [];
    const agents = data.top_performers.top_agents?.slice(0, 8) || [];

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

  const createHorizontalBarChart = () => {
    if (!horizontalBarRef.current || !data?.withdrawal_analytics?.top_recipients) return;
    
    const ctx = horizontalBarRef.current.getContext('2d');
    if (horizontalBarInstance.current) {
      horizontalBarInstance.current.destroy();
    }

    const recipients = data.withdrawal_analytics.top_recipients?.slice(0, 10) || [];
    const colors = ['#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#2563EB', '#0891B2'];

    horizontalBarInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: recipients.map(r => r.name.length > 15 ? r.name.substring(0, 15) + '...' : r.name),
        datasets: [{
          label: 'Montant des retraits',
          data: recipients.map(r => r.total_amount),
          backgroundColor: colors.slice(0, recipients.length),
          borderColor: colors.slice(0, recipients.length),
          borderWidth: 1,
          borderRadius: 5
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Montant: ${formatCurrency(context.parsed.x)}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function(value) { return formatCurrency(value); },
              font: { size: 11 }
            }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyses();
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
          </div>
          <p className="mt-4 text-base-content/60 font-medium">Chargement des analyses...</p>
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
          <button onClick={fetchAnalyses} className="btn btn-primary gap-2">
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const transactions = stats.transactions || {};
  const partnersStats = stats.partners || {};
  const agentsStats = stats.agents || {};

  return (
    <div className="w-full px-0">
      {/* Header */}
      <div className="w-full px-6 py-6 bg-base-100/50 backdrop-blur-sm border-b border-base-200/50">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Analyses & Statistiques
                </h1>
                <p className="text-base-content/50 text-sm mt-0.5">
                  Indicateurs clés, tendances et performances
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-base-200 rounded-xl px-3 py-1.5">
              <Clock className="w-4 h-4 text-base-content/40" />
              <span className="text-sm text-base-content/60">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="select select-bordered select-sm bg-base-100"
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
              className="btn btn-ghost btn-sm btn-square"
              disabled={refreshing}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="w-full px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 shadow-lg">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary/70">Volume Total</p>
                  <p className="text-2xl font-bold text-base-content">
                    {formatCurrency(transactions.total_amount || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-success font-medium">+8.7%</span>
                    <span className="text-xs text-base-content/40">vs période préc.</span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success/5 to-success/10 border border-success/20 shadow-lg">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success/70">Total Dépôts</p>
                  <p className="text-2xl font-bold text-base-content">
                    {formatNumber(transactions.deposits || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-success font-medium">+12.3%</span>
                    <span className="text-xs text-base-content/40">vs période préc.</span>
                  </div>
                </div>
                <div className="p-3 bg-success/10 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-error/5 to-error/10 border border-error/20 shadow-lg">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-error/70">Total Retraits</p>
                  <p className="text-2xl font-bold text-base-content">
                    {formatNumber(transactions.withdrawals || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-error font-medium">-3.8%</span>
                    <span className="text-xs text-base-content/40">vs période préc.</span>
                  </div>
                </div>
                <div className="p-3 bg-error/10 rounded-2xl">
                  <TrendingDown className="w-6 h-6 text-error" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20 shadow-lg">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning/70">Transactions</p>
                  <p className="text-2xl font-bold text-base-content">
                    {formatNumber(transactions.total || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-warning font-medium">+5.2%</span>
                    <span className="text-xs text-base-content/40">vs période préc.</span>
                  </div>
                </div>
                <div className="p-3 bg-warning/10 rounded-2xl">
                  <Activity className="w-6 h-6 text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="flex items-center gap-3 bg-base-100 rounded-xl px-4 py-3 shadow-sm">
            <div className="p-2 bg-primary/5 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Partenaires</p>
              <p className="text-sm font-bold">{formatNumber(partnersStats.total || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-base-100 rounded-xl px-4 py-3 shadow-sm">
            <div className="p-2 bg-success/5 rounded-lg">
              <UserCheck className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Agents actifs</p>
              <p className="text-sm font-bold">{formatNumber(agentsStats.active || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-base-100 rounded-xl px-4 py-3 shadow-sm">
            <div className="p-2 bg-warning/5 rounded-lg">
              <DollarSign className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Solde partenaires</p>
              <p className="text-sm font-bold">{formatCurrency(partnersStats.total_balance || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-base-100 rounded-xl px-4 py-3 shadow-sm">
            <div className="p-2 bg-info/5 rounded-lg">
              <Wallet className="w-4 h-4 text-info" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Solde agents</p>
              <p className="text-sm font-bold">{formatCurrency(agentsStats.total_balance || 0)}</p>
            </div>
          </div>
        </div>

        {/* Onglets des graphiques */}
        <div className="tabs tabs-boxed bg-base-100 shadow-sm p-1 mb-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'trends', label: 'Tendances', icon: LineChart },
            { id: 'distribution', label: 'Distribution', icon: PieChart },
            { id: 'performance', label: 'Performance', icon: Award },
            { id: 'recipients', label: 'Bénéficiaires', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`tab gap-2 ${activeChart === tab.id ? 'tab-active' : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique en ligne - Tendances */}
          {(activeChart === 'overview' || activeChart === 'trends') && (
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 lg:col-span-2">
              <div className="card-body p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-primary" />
                      Évolution des transactions
                    </h3>
                    <p className="text-sm text-base-content/50">Tendance sur la période sélectionnée</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setExpandedChart('trend')}
                      className="btn btn-ghost btn-sm btn-square"
                      title="Agrandir"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-[350px]">
                  <canvas ref={trendChartRef} />
                </div>
              </div>
            </div>
          )}

          {/* Graphique circulaire - Distribution */}
          {(activeChart === 'overview' || activeChart === 'distribution') && (
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Distribution des transactions
                    </h3>
                    <p className="text-sm text-base-content/50">Répartition par type</p>
                  </div>
                  <button 
                    onClick={() => setExpandedChart('pie')}
                    className="btn btn-ghost btn-sm btn-square"
                    title="Agrandir"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-[300px]">
                  <canvas ref={pieChartRef} />
                </div>
              </div>
            </div>
          )}

          {/* Graphique à barres - Performers */}
          {(activeChart === 'overview' || activeChart === 'performance') && (
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Top Performeurs
                    </h3>
                    <p className="text-sm text-base-content/50">Volume des transactions</p>
                  </div>
                  <button 
                    onClick={() => setExpandedChart('bar')}
                    className="btn btn-ghost btn-sm btn-square"
                    title="Agrandir"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-[300px]">
                  <canvas ref={barChartRef} />
                </div>
              </div>
            </div>
          )}

          {/* Graphique à barres horizontales - Bénéficiaires */}
          {(activeChart === 'overview' || activeChart === 'recipients') && (
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 lg:col-span-2">
              <div className="card-body p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Top Bénéficiaires des retraits
                    </h3>
                    <p className="text-sm text-base-content/50">Classement par montant total</p>
                  </div>
                  <button 
                    onClick={() => setExpandedChart('horizontal')}
                    className="btn btn-ghost btn-sm btn-square"
                    title="Agrandir"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-[350px]">
                  <canvas ref={horizontalBarRef} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analyses détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analyse des retraits */}
          {data?.withdrawal_analytics && (
            <div className="card bg-base-100 shadow-xl lg:col-span-2">
              <div className="card-body p-6">
                <h3 className="text-lg font-bold text-base-content flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-error" />
                  Analyse des retraits
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="stat bg-base-200 rounded-xl p-4">
                    <div className="stat-title text-xs text-base-content/50">Total retraits</div>
                    <div className="stat-value text-xl">{formatNumber(data.withdrawal_analytics.total_withdrawals)}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-xl p-4">
                    <div className="stat-title text-xs text-base-content/50">Montant total</div>
                    <div className="stat-value text-xl">{formatCurrency(data.withdrawal_analytics.total_amount)}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-xl p-4">
                    <div className="stat-title text-xs text-base-content/50">Moyenne</div>
                    <div className="stat-value text-xl">{formatCurrency(data.withdrawal_analytics.avg_amount)}</div>
                  </div>
                </div>
                {data.withdrawal_analytics.top_recipients?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-base-content/70 mb-2">Top bénéficiaires</p>
                    <div className="space-y-2">
                      {data.withdrawal_analytics.top_recipients.slice(0, 5).map((recipient) => (
                        <div key={recipient.id} className="flex justify-between items-center p-3 bg-base-200 rounded-xl">
                          <div>
                            <span className="font-medium">{recipient.name}</span>
                            <p className="text-xs text-base-content/50">{recipient.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-error">{formatCurrency(recipient.total_amount)}</p>
                            <p className="text-xs text-base-content/50">{formatNumber(recipient.count)} retraits</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Métriques de santé */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-6">
              <h3 className="text-lg font-bold text-base-content flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                Indicateurs de santé
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content/60">Ratio dépôts/retraits</span>
                    <span className="font-bold">
                      {transactions.withdrawals > 0 
                        ? (transactions.deposits / transactions.withdrawals).toFixed(2)
                        : '—'}
                    </span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(
                          100, 
                          transactions.withdrawals > 0 
                            ? (transactions.deposits / transactions.withdrawals) * 50 
                            : 0
                        )}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content/60">Taux de croissance</span>
                    <span className="font-bold text-success">+12.5%</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content/60">Activité partenaires</span>
                    <span className="font-bold text-info">{(partnersStats.total || 0)}</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div 
                      className="bg-info h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (partnersStats.total || 0) * 5)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content/60">Activité agents</span>
                    <span className="font-bold text-warning">{(agentsStats.active || 0)}</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (agentsStats.active || 0) * 10)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-base-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score de santé</span>
                    <span className="text-2xl font-bold text-success">85%</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-3 mt-2">
                    <div className="bg-success h-3 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'agrandissement */}
      {expandedChart && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-base-content">
                  {expandedChart === 'trend' && '📈 Évolution des transactions'}
                  {expandedChart === 'pie' && '🥧 Distribution des transactions'}
                  {expandedChart === 'bar' && '📊 Performance des meilleurs acteurs'}
                  {expandedChart === 'horizontal' && '📊 Top bénéficiaires des retraits'}
                </h3>
                <button 
                  onClick={() => setExpandedChart(null)}
                  className="btn btn-ghost btn-sm btn-square"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
              <div className="h-[70vh]">
                {expandedChart === 'trend' && <canvas ref={trendChartRef} />}
                {expandedChart === 'pie' && <canvas ref={pieChartRef} />}
                {expandedChart === 'bar' && <canvas ref={barChartRef} />}
                {expandedChart === 'horizontal' && <canvas ref={horizontalBarRef} />}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        
        .tab-active {
          background: linear-gradient(135deg, #4F46E5, #7C3AED) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Analyses;