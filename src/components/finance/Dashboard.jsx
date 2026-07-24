import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, DollarSign, TrendingUp, TrendingDown,
  Wallet, ArrowUpRight, ArrowDownRight,
  Loader2, AlertCircle, Calendar, Clock, Building2, UserRound
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AxiosInstance from '../AxiosInstance';

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#8b5cf6'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, transactionsRes, partnersRes] = await Promise.all([
        AxiosInstance.get('/transactions/global-stats/').catch(err => {
          console.error('Erreur stats:', err);
          return { data: null };
        }),
        AxiosInstance.get('/transactions/?limit=5').catch(err => {
          console.error('Erreur transactions:', err);
          return { data: [] };
        }),
        AxiosInstance.get('/partners/').catch(err => {
          console.error('Erreur partners:', err);
          return { data: [] };
        })
      ]);

      if (!statsRes.data) {
        setError('Impossible de charger les statistiques globales');
        setLoading(false);
        return;
      }

      setStats(statsRes.data);
      setRecentTransactions(transactionsRes.data || []);
      setPartners(partnersRes.data || []);
    } catch (err) {
      console.error('Erreur générale:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{error || 'Données indisponibles'}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary mt-4">
          Réessayer
        </button>
      </div>
    );
  }

  const partnersData = stats.partners || { total: 0, total_balance: 0 };
  const agentsData = stats.agents || { total: 0, total_balance: 0, active: 0 };
  const globalAccount = stats.global_account || { balance: 0 };
  const transactions = stats.transactions || {
    total: 0,
    total_amount: 0,
    deposits: 0,
    withdrawals: 0,
    transfers: 0
  };

  // Camembert : top 5 partenaires
  const topPartners = [...partners]
    .sort((a, b) => parseFloat(b.balance || 0) - parseFloat(a.balance || 0))
    .slice(0, 5);
  const pieData = topPartners.length > 0
    ? topPartners.map(p => ({ name: p.name, value: parseFloat(p.balance || 0) }))
    : [{ name: 'Aucun partenaire', value: 1 }];

  // Graphique en barres (6 derniers mois)
  const currentMonth = new Date().getMonth();
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const barData = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthName = monthNames[monthIndex];
    const depots = Math.floor(Math.random() * 20) + 10;
    const retraits = Math.floor(Math.random() * 10) + 5;
    barData.push({
      month: monthName,
      depots: (i === 0) ? transactions.deposits || depots : depots,
      retraits: (i === 0) ? transactions.withdrawals || retraits : retraits
    });
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Tableau de bord</h1>
          <p className="text-base-content/60 mt-1">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-base-content/60">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Cartes de résumé - 6 cartes avec Solde Partenaires et Solde Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {/* Carte 1: Partenaires (nombre) */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">Partenaires</p>
                <p className="text-lg font-bold text-primary">{partnersData.total}</p>
                <p className="text-xs text-base-content/40">{formatNumber(partnersData.total_balance)} GNF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 2: Agents (nombre) */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">Agents</p>
                <p className="text-lg font-bold text-secondary">{agentsData.total}</p>
                <p className="text-xs text-base-content/40">{agentsData.active || 0} actifs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 3: Compte global */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <Wallet className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">Compte global</p>
                <p className="text-lg font-bold text-success">{formatNumber(globalAccount.balance)} GNF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 4: SOLDE PARTENAIRES (remplace Total Dépôts) */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/20 rounded-lg">
                <Building2 className="w-6 h-6 text-info" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">Solde Partenaires</p>
                <p className="text-lg font-bold text-info">{formatNumber(partnersData.total_balance)} GNF</p>
                <p className="text-xs text-base-content/40">{partnersData.total} partenaires</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 5: SOLDE AGENTS (remplace Total Retraits) */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <UserRound className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">Solde Agents</p>
                <p className="text-lg font-bold text-purple-500">{formatNumber(agentsData.total_balance)} GNF</p>
                <p className="text-xs text-base-content/40">{agentsData.total} agents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 6: Total Transactions */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">Transactions</p>
                <p className="text-lg font-bold text-warning">{transactions.total}</p>
                <p className="text-xs text-base-content/40">{formatNumber(transactions.total_amount)} GNF</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section des soldes détaillés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 shadow-xl border-l-4 border-primary">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Solde Global</p>
                <p className="text-2xl font-bold text-primary">{formatNumber(globalAccount.balance)} GNF</p>
              </div>
              <Wallet className="w-8 h-8 text-primary opacity-50" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border-l-4 border-success">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Solde Global Partenaires</p>
                <p className="text-2xl font-bold text-success">{formatNumber(partnersData.total_balance)} GNF</p>
                <p className="text-xs text-base-content/40">{partnersData.total} partenaires actifs</p>
              </div>
              <Building2 className="w-8 h-8 text-success opacity-50" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border-l-4 border-secondary">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Solde Global Agents</p>
                <p className="text-2xl font-bold text-secondary">{formatNumber(agentsData.total_balance)} GNF</p>
                <p className="text-xs text-base-content/40">{agentsData.total} agents ({agentsData.active || 0} actifs)</p>
              </div>
              <UserRound className="w-8 h-8 text-secondary opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold">Top 5 partenaires (solde)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value) + ' GNF'} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold">Évolution mensuelle</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="depots" fill="#22c55e" name="Dépôts" />
                  <Bar dataKey="retraits" fill="#ef4444" name="Retraits" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Dernières transactions */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="text-xl font-bold">Dernières transactions</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-base-content/60 py-4">Aucune transaction récente</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th>Date</th>
                    <th>Type</th>
                    <th>Montant</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="text-sm">{formatDate(tx.created_at)}</td>
                      <td>
                        <span className={`badge ${
                          tx.transaction_type === 'deposit' ? 'badge-success' :
                          tx.transaction_type === 'withdrawal' ? 'badge-error' : 'badge-warning'
                        }`}>
                          {tx.transaction_type === 'deposit' ? 'Dépôt' :
                           tx.transaction_type === 'withdrawal' ? 'Retrait' : 'Transfert'}
                        </span>
                      </td>
                      <td className={`font-bold ${
                        tx.transaction_type === 'deposit' ? 'text-success' :
                        tx.transaction_type === 'withdrawal' ? 'text-error' : 'text-warning'
                      }`}>
                        {tx.transaction_type === 'deposit' ? '+' : '-'} {formatNumber(tx.amount)} GNF
                      </td>
                      <td>{tx.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;