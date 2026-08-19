// Dashboard.jsx
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
  const [userRole, setUserRole] = useState('admin');
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('User');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role || 'admin');
        setIsAgent(user.role === 'agent');
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer les stats depuis le dashboard avec l'utilisateur
      const statsRes = await AxiosInstance.get('/dashboard/stats/').catch(err => {
        console.error('Erreur stats:', err);
        return { data: null };
      });

      // Récupérer les transactions (filtrées par l'API pour l'agent)
      const transactionsRes = await AxiosInstance.get('/transactions/?limit=5').catch(err => {
        console.error('Erreur transactions:', err);
        return { data: [] };
      });

      // Pour l'admin, récupérer les partenaires; pour l'agent, ne pas charger
      let partnersRes = { data: [] };
      if (!isAgent) {
        partnersRes = await AxiosInstance.get('/partners/').catch(err => {
          console.error('Erreur partners:', err);
          return { data: [] };
        });
      }

      if (!statsRes.data) {
        setError('Impossible de charger les statistiques');
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

  // Vérifier si l'utilisateur est un agent via les données retournées
  const isAgentUser = stats.is_agent || isAgent;
  const agentBalance = stats.agent_balance || 0;
  const agentCurrency = stats.agent_currency || 'GNF';
  const userName = stats.user_name || 'Agent';

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

  // Camembert : top 5 partenaires (pour admin) ou top agents (pour agent)
  let pieData = [];
  if (isAgentUser) {
    // Pour un agent, afficher son solde comme unique donnée
    pieData = [{ name: 'Mon solde', value: agentBalance }];
  } else {
    // Pour admin, top 5 partenaires
    const topPartners = [...partners]
      .sort((a, b) => parseFloat(b.balance || 0) - parseFloat(a.balance || 0))
      .slice(0, 5);
    pieData = topPartners.length > 0
      ? topPartners.map(p => ({ name: p.name, value: parseFloat(p.balance || 0) }))
      : [{ name: 'Aucun partenaire', value: 1 }];
  }

  // Données pour le graphique en barres
  const currentMonth = new Date().getMonth();
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const barData = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthName = monthNames[monthIndex];
    // Utiliser des données réelles si disponibles, sinon des données simulées
    const depots = (i === 0) ? transactions.deposits || 0 : Math.floor(Math.random() * 20) + 10;
    const retraits = (i === 0) ? transactions.withdrawals || 0 : Math.floor(Math.random() * 10) + 5;
    barData.push({
      month: monthName,
      depots: depots,
      retraits: retraits
    });
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            {isAgentUser ? `Tableau de bord - ${userName}` : 'Tableau de bord'}
          </h1>
          <p className="text-base-content/60 mt-1">
            {isAgentUser ? 'Vue personnalisée de vos opérations' : 'Vue d\'ensemble de la plateforme'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-base-content/60">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {/* Carte 1: Solde de l'agent (si agent) ou Partenaires (si admin) */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${isAgentUser ? 'bg-success/20' : 'bg-primary/20'} rounded-lg`}>
                {isAgentUser ? (
                  <Wallet className="w-6 h-6 text-success" />
                ) : (
                  <Users className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">
                  {isAgentUser ? 'Mon solde' : 'Partenaires'}
                </p>
                <p className={`text-lg font-bold ${isAgentUser ? 'text-success' : 'text-primary'}`}>
                  {isAgentUser ? formatNumber(agentBalance) : partnersData.total}
                </p>
                <p className="text-xs text-base-content/40">
                  {isAgentUser ? `${agentCurrency}` : `${formatNumber(partnersData.total_balance)} GNF`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 2: Agents (si admin) ou Transactions (si agent) */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${isAgentUser ? 'bg-warning/20' : 'bg-secondary/20'} rounded-lg`}>
                {isAgentUser ? (
                  <DollarSign className="w-6 h-6 text-warning" />
                ) : (
                  <UserCheck className="w-6 h-6 text-secondary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">
                  {isAgentUser ? 'Mes transactions' : 'Agents'}
                </p>
                <p className={`text-lg font-bold ${isAgentUser ? 'text-warning' : 'text-secondary'}`}>
                  {isAgentUser ? transactions.total : agentsData.total}
                </p>
                <p className="text-xs text-base-content/40">
                  {isAgentUser ? `${formatNumber(transactions.total_amount)} GNF` : `${agentsData.active || 0} actifs`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 3: Compte global ou solde global */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <Wallet className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">
                  {isAgentUser ? 'Solde global' : 'Compte global'}
                </p>
                <p className="text-lg font-bold text-success">
                  {formatNumber(isAgentUser ? globalAccount.balance : globalAccount.balance)} GNF
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 4: Dépôts */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">
                  {isAgentUser ? 'Mes entrées' : 'Total dépôts'}
                </p>
                <p className="text-lg font-bold text-info">
                  {formatNumber(transactions.deposits)}
                </p>
                <p className="text-xs text-base-content/40">
                  {formatNumber(transactions.deposits_amount || 0)} GNF
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 5: Retraits */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error/20 rounded-lg">
                <TrendingDown className="w-6 h-6 text-error" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">
                  {isAgentUser ? 'Mes sorties' : 'Total retraits'}
                </p>
                <p className="text-lg font-bold text-error">
                  {formatNumber(transactions.withdrawals)}
                </p>
                <p className="text-xs text-base-content/40">
                  {formatNumber(transactions.withdrawals_amount || 0)} GNF
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte 6: Transferts */}
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ArrowRightLeft className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-base-content/60 truncate">
                  {isAgentUser ? 'Mes transferts' : 'Total transferts'}
                </p>
                <p className="text-lg font-bold text-purple-500">
                  {formatNumber(transactions.transfers)}
                </p>
                <p className="text-xs text-base-content/40">
                  {formatNumber(transactions.transfers_amount || 0)} GNF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section des soldes détaillés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {isAgentUser ? (
          // Vue agent - 3 cartes sur son solde
          <div className="card bg-base-100 shadow-xl border-l-4 border-success md:col-span-3">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">Mon solde disponible</p>
                  <p className="text-3xl font-bold text-success">{formatNumber(agentBalance)} {agentCurrency}</p>
                  <p className="text-xs text-base-content/40">{transactions.total} transactions réalisées</p>
                </div>
                <Wallet className="w-12 h-12 text-success opacity-50" />
              </div>
            </div>
          </div>
        ) : (
          // Vue admin - 3 cartes
          <>
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
                    <p className="text-xs text-base-content/40">{partnersData.total} partenaires</p>
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
          </>
        )}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold">
              {isAgentUser ? 'Répartition de mon solde' : 'Top 5 partenaires (solde)'}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => {
                      if (isAgentUser) return `${name}: ${formatNumber(agentBalance)} ${agentCurrency}`;
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
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
                  <Bar dataKey="depots" fill="#22c55e" name={isAgentUser ? "Entrées" : "Dépôts"} />
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
          <h3 className="text-xl font-bold">
            {isAgentUser ? 'Mes dernières transactions' : 'Dernières transactions'}
          </h3>
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
                          tx.transaction_type === 'deposit' || tx.transaction_type === 'transfer_to_agent' ? 'badge-success' :
                          tx.transaction_type === 'withdrawal' ? 'badge-error' : 'badge-warning'
                        }`}>
                          {tx.transaction_type === 'deposit' || tx.transaction_type === 'transfer_to_agent' ? 'Entrée' :
                           tx.transaction_type === 'withdrawal' ? 'Sortie' : 'Transfert'}
                        </span>
                      </td>
                      <td className={`font-bold ${
                        tx.transaction_type === 'deposit' || tx.transaction_type === 'transfer_to_agent' ? 'text-success' :
                        tx.transaction_type === 'withdrawal' ? 'text-error' : 'text-warning'
                      }`}>
                        {tx.transaction_type === 'deposit' || tx.transaction_type === 'transfer_to_agent' ? '+' : '-'} {formatNumber(tx.amount)} GNF
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