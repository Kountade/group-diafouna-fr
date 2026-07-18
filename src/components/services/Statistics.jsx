import React, { useEffect, useState, useRef } from 'react';
import {
  RefreshCw, Loader2, TrendingUp, TrendingDown, Users,
  Wallet, DollarSign, PieChart, BarChart3, Calendar,
  Download, Printer, Filter, ChevronDown, Activity,
  Eye, EyeOff, Maximize2, Minimize2
} from 'lucide-react';
import Chart from 'chart.js/auto';
import AxiosInstance from '../AxiosInstance';

const Statistics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedChart, setExpandedChart] = useState(null);
  
  // État des filtres
  const [filters, setFilters] = useState({
    transactionType: 'all',
    partner: 'all',
    agent: 'all',
    minAmount: '',
    maxAmount: ''
  });

  // Refs pour les graphiques
  const pieChartRef = useRef(null);
  const pieChartInstance = useRef(null);
  const barChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const trendChartRef = useRef(null);
  const trendChartInstance = useRef(null);
  const doughnutChartRef = useRef(null);
  const doughnutChartInstance = useRef(null);
  const horizontalBarRef = useRef(null);
  const horizontalBarInstance = useRef(null);

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

  const fetchStatistics = async (range = dateRange) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AxiosInstance.get('/dashboard/stats/', {
        params: { date_range: range }
      });
      
      setData(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  // Créer les graphiques quand les données sont chargées
  useEffect(() => {
    if (data) {
      createPieChart();
      createBarChart();
      createTrendChart();
      createDoughnutChart();
      createHorizontalBarChart();
    }
    
    return () => {
      destroyCharts();
    };
  }, [data, filters]);

  const destroyCharts = () => {
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
      pieChartInstance.current = null;
    }
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
      barChartInstance.current = null;
    }
    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
      trendChartInstance.current = null;
    }
    if (doughnutChartInstance.current) {
      doughnutChartInstance.current.destroy();
      doughnutChartInstance.current = null;
    }
    if (horizontalBarInstance.current) {
      horizontalBarInstance.current.destroy();
      horizontalBarInstance.current = null;
    }
  };

  // 1. GRAPHIQUE CIRCULAIRE (PIE CHART) - Distribution des transactions
  const createPieChart = () => {
    if (!pieChartRef.current || !data?.stats?.transactions) return;
    
    const ctx = pieChartRef.current.getContext('2d');
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }

    const transactions = data.stats.transactions;
    const labels = ['Dépôts', 'Retraits', 'Transferts'];
    const values = [
      transactions.deposits || 0,
      transactions.withdrawals || 0,
      transactions.transfers || 0
    ];
    const colors = ['#10B981', '#EF4444', '#3B82F6'];

    pieChartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: { size: 14, weight: 'bold' }
            }
          },
          tooltip: {
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

  // 2. GRAPHIQUE EN DOUGHNUT (Anneau) - Distribution des montants
  const createDoughnutChart = () => {
    if (!doughnutChartRef.current || !data?.withdrawal_analytics?.amount_distribution) return;
    
    const ctx = doughnutChartRef.current.getContext('2d');
    if (doughnutChartInstance.current) {
      doughnutChartInstance.current.destroy();
    }

    const distribution = data.withdrawal_analytics.amount_distribution;
    const labels = Object.keys(distribution).map(l => `${l} CFA`);
    const values = Object.values(distribution);
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    doughnutChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, values.length),
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: { size: 12 }
            }
          },
          tooltip: {
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

  // 3. GRAPHIQUE À BARRES - Performance des partenaires/agents
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
        labels: partners.map(p => p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name),
        datasets: [
          {
            label: 'Partenaires',
            data: partners.map(p => p.volume),
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderColor: '#4F46E5',
            borderWidth: 2,
            borderRadius: 8
          },
          {
            label: 'Agents',
            data: agents.map(a => a.volume),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10B981',
            borderWidth: 2,
            borderRadius: 8
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
              font: { size: 12 }
            }
          },
          tooltip: {
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
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  };

  // 4. GRAPHIQUE À BARRES HORIZONTALES - Top bénéficiaires
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
          legend: {
            display: false
          },
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
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  };

  // 5. GRAPHIQUE EN LIGNE - Tendance
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

    trendChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total',
            data: data.trends.daily.map(d => d.amount),
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#4F46E5'
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
            pointBackgroundColor: '#10B981'
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
            pointBackgroundColor: '#EF4444'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
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
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  };

  // Appliquer les filtres
  const applyFilters = () => {
    fetchStatistics(dateRange);
    setShowFilters(false);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      transactionType: 'all',
      partner: 'all',
      agent: 'all',
      minAmount: '',
      maxAmount: ''
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-error text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-base-content mb-2">Erreur</h3>
          <p className="text-base-content/70">{error}</p>
          <button 
            onClick={() => fetchStatistics()} 
            className="btn btn-primary mt-4 gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-base-content">📊 Statistiques</h1>
          <p className="text-base-content/60 mt-1">
            Analyses et graphiques détaillés
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="today">Aujourd'hui</option>
            <option value="last_7_days">7 derniers jours</option>
            <option value="last_30_days">30 derniers jours</option>
            <option value="last_90_days">90 derniers jours</option>
            <option value="last_year">Dernière année</option>
            <option value="all_time">Tout le temps</option>
          </select>
          <button className="btn btn-outline btn-sm gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button className="btn btn-outline btn-sm gap-2">
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body p-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-ghost btn-sm gap-2 w-full md:w-auto"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-base-200">
              <div className="form-control">
                <label className="label"><span className="label-text">Type de transaction</span></label>
                <select 
                  className="select select-bordered select-sm"
                  value={filters.transactionType}
                  onChange={(e) => setFilters({...filters, transactionType: e.target.value})}
                >
                  <option value="all">Tous</option>
                  <option value="deposit">Dépôts</option>
                  <option value="withdrawal">Retraits</option>
                  <option value="transfer">Transferts</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Montant minimum</span></label>
                <input 
                  type="number" 
                  className="input input-bordered input-sm"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Montant maximum</span></label>
                <input 
                  type="number" 
                  className="input input-bordered input-sm"
                  placeholder="1000000"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                />
              </div>
              <div className="form-control justify-end">
                <div className="flex gap-2 mt-8">
                  <button onClick={resetFilters} className="btn btn-ghost btn-sm">
                    Réinitialiser
                  </button>
                  <button onClick={applyFilters} className="btn btn-primary btn-sm">
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Solde Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data?.stats?.global_account?.balance || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Total Dépôts</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data?.stats?.transactions?.deposits_amount || 0)}
                </p>
                <p className="text-xs text-base-content/50">
                  {formatNumber(data?.stats?.transactions?.deposits || 0)} transactions
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-error/10">
                <TrendingDown className="w-6 h-6 text-error" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Total Retraits</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data?.stats?.transactions?.withdrawals_amount || 0)}
                </p>
                <p className="text-xs text-base-content/50">
                  {formatNumber(data?.stats?.transactions?.withdrawals || 0)} transactions
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <Activity className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Taux de croissance</p>
                <p className="text-2xl font-bold text-success">+12.5%</p>
                <p className="text-xs text-base-content/50">vs période précédente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRAPHIQUES CIRCULAIRES (PIE & DOUGHNUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graphique Circulaire - Distribution des transactions */}
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  🥧 Distribution des transactions
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
            <div className="h-[320px]">
              <canvas ref={pieChartRef} />
            </div>
          </div>
        </div>

        {/* Graphique en Anneau (Doughnut) - Distribution des montants de retraits */}
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  🍩 Distribution des retraits
                </h3>
                <p className="text-sm text-base-content/50">Par tranche de montant</p>
              </div>
              <button 
                onClick={() => setExpandedChart('doughnut')}
                className="btn btn-ghost btn-sm btn-square"
                title="Agrandir"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[320px]">
              <canvas ref={doughnutChartRef} />
            </div>
          </div>
        </div>
      </div>

      {/* GRAPHIQUE À BARRES - Performance */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  📊 Performance des meilleurs acteurs
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
            <div className="h-[350px]">
              <canvas ref={barChartRef} />
            </div>
          </div>
        </div>
      </div>

      {/* GRAPHIQUE À BARRES HORIZONTALES - Top bénéficiaires */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  📊 Top bénéficiaires des retraits
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
      </div>

      {/* GRAPHIQUE EN LIGNE - Tendance */}
      <div className="grid grid-cols-1 gap-6">
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  📈 Évolution des transactions
                </h3>
                <p className="text-sm text-base-content/50">Tendance sur la période</p>
              </div>
              <button 
                onClick={() => setExpandedChart('trend')}
                className="btn btn-ghost btn-sm btn-square"
                title="Agrandir"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[350px]">
              <canvas ref={trendChartRef} />
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
                  {expandedChart === 'pie' && '🥧 Distribution des transactions'}
                  {expandedChart === 'doughnut' && '🍩 Distribution des retraits'}
                  {expandedChart === 'bar' && '📊 Performance des meilleurs acteurs'}
                  {expandedChart === 'horizontal' && '📊 Top bénéficiaires des retraits'}
                  {expandedChart === 'trend' && '📈 Évolution des transactions'}
                </h3>
                <button 
                  onClick={() => setExpandedChart(null)}
                  className="btn btn-ghost btn-sm btn-square"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
              <div className="h-[70vh]">
                {expandedChart === 'pie' && <canvas ref={pieChartRef} />}
                {expandedChart === 'doughnut' && <canvas ref={doughnutChartRef} />}
                {expandedChart === 'bar' && <canvas ref={barChartRef} />}
                {expandedChart === 'horizontal' && <canvas ref={horizontalBarRef} />}
                {expandedChart === 'trend' && <canvas ref={trendChartRef} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;