// pages/agents/AgentBalanceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, DollarSign, ArrowLeft,
  Loader2, AlertCircle, UserCheck, UserX, CreditCard,
  Receipt, History
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const AgentBalanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgentData();
  }, [id]);

  const fetchAgentData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer le solde de l'agent
      const balanceRes = await AxiosInstance.get(`/agents-balance/${id}/balance/`);
      setBalance(balanceRes.data);

      // Récupérer les infos de l'agent (si disponible)
      try {
        const agentRes = await AxiosInstance.get(`/users/${id}/`);
        setAgent(agentRes.data);
      } catch (err) {
        // Si l'endpoint users n'est pas disponible, on utilise les données du balance
        setAgent(balanceRes.data);
      }

      // Récupérer les transactions récentes de l'agent
      try {
        const transRes = await AxiosInstance.get(`/transactions/?agent=${id}&limit=5`);
        setRecentTransactions(transRes.data || []);
      } catch (err) {
        console.error('Erreur chargement transactions:', err);
        setRecentTransactions([]);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Impossible de charger les données de l\'agent');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionLabel = (type) => {
    const labels = {
      'deposit': 'Dépôt',
      'transfer_to_agent': 'Transfert',
      'withdrawal': 'Retrait'
    };
    return labels[type] || type;
  };

  const getTransactionBadge = (type) => {
    const badges = {
      'deposit': 'badge-success',
      'transfer_to_agent': 'badge-info',
      'withdrawal': 'badge-warning'
    };
    return badges[type] || 'badge-ghost';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{error || 'Agent non trouvé'}</p>
        <button onClick={() => navigate('/agents')} className="btn btn-primary mt-4">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* En-tête avec retour */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/agents')} className="btn btn-ghost btn-circle">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-base-content">Détails de l'Agent</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Infos agent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte d'identité */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-6">
                <div className="avatar placeholder">
                  <div className={`w-20 h-20 rounded-full ${balance.is_active !== false ? 'bg-primary/20' : 'bg-base-300'} flex items-center justify-center`}>
                    <span className={`text-3xl font-bold ${balance.is_active !== false ? 'text-primary' : 'text-base-content/40'}`}>
                      {(balance.full_name || balance.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{balance.full_name || balance.email}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${balance.is_active !== false ? 'badge-success' : 'badge-error'}`}>
                      {balance.is_active !== false ? 'Actif' : 'Inactif'}
                    </span>
                    {balance.id && <span className="badge badge-ghost">ID: #{balance.id}</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-base-content/40" />
                      <span>{balance.email}</span>
                    </div>
                    {balance.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-base-content/40" />
                        <span>{balance.phone_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-base-content/40" />
                      <span>Inscrit le {formatDate(balance.created_at)}</span>
                    </div>
                    {balance.last_login && (
                      <div className="flex items-center gap-2 text-sm">
                        <History className="w-4 h-4 text-base-content/40" />
                        <span>Dernière connexion: {formatDate(balance.last_login)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dernières transactions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Dernières transactions
                </h3>
                <Link to={`/transactions?agent=${balance.id}`} className="text-primary text-sm">
                  Voir tout →
                </Link>
              </div>
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
                            <span className={`badge ${getTransactionBadge(tx.transaction_type)}`}>
                              {getTransactionLabel(tx.transaction_type)}
                            </span>
                          </td>
                          <td className={tx.transaction_type === 'deposit' ? 'text-success font-bold' : 'text-error font-bold'}>
                            {tx.transaction_type === 'deposit' ? '+' : '-'} {formatNumber(tx.amount)} {tx.currency || 'XOF'}
                          </td>
                          <td className="text-sm">{tx.description || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne de droite - Solde */}
        <div className="lg:col-span-1">
          <div className="card bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-xl">
            <div className="card-body">
              <div className="flex flex-col items-center text-center">
                <DollarSign className="w-14 h-14 mb-3" />
                <p className="text-sm opacity-80">Solde actuel</p>
                <p className="text-5xl font-bold mt-1">
                  {formatNumber(balance.balance)} 
                  <span className="text-lg ml-1">{balance.currency || 'XOF'}</span>
                </p>
                <p className="text-sm opacity-70 mt-2">
                  Compte #{balance.account_id || 'N/A'}
                </p>
                <div className="flex gap-3 mt-6 w-full">
                  <Link to={`/transferts?agent=${balance.id}`} className="btn btn-outline flex-1 text-primary-content border-primary-content/30 gap-2">
                    <CreditCard className="w-4 h-4" />
                    Transfert
                  </Link>
                  <Link to={`/transactions?agent=${balance.id}`} className="btn btn-outline flex-1 text-primary-content border-primary-content/30 gap-2">
                    <Receipt className="w-4 h-4" />
                    Transactions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBalanceDetail;