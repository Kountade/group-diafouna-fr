// pages/agents/AgentBalanceMe.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, DollarSign, Loader2, AlertCircle, CreditCard,
  Receipt, History, Calendar, Mail, Phone, UserCheck,
  TrendingUp, TrendingDown, Wallet
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const AgentBalanceMe = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    transactionCount: 0
  });

  useEffect(() => {
    fetchMyBalance();
  }, []);

  const fetchMyBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get('/agents-balance/me/');
      setProfile(response.data);
      
      // Récupérer les statistiques des transactions
      try {
        const transRes = await AxiosInstance.get('/transactions/?agent=me');
        const transactions = transRes.data || [];
        const deposits = transactions.filter(t => t.transaction_type === 'deposit');
        const withdrawals = transactions.filter(t => t.transaction_type === 'withdrawal');
        
        setStats({
          totalDeposits: deposits.reduce((sum, t) => sum + parseFloat(t.amount), 0),
          totalWithdrawals: withdrawals.reduce((sum, t) => sum + parseFloat(t.amount), 0),
          transactionCount: transactions.length
        });
      } catch (err) {
        console.error('Erreur chargement transactions:', err);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Impossible de charger votre solde');
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
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{error || 'Profil non trouvé'}</p>
        <button onClick={fetchMyBalance} className="btn btn-primary mt-4">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-base-content mb-6 flex items-center gap-3">
        <User className="w-8 h-8 text-primary" />
        Mon Profil Agent
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte de solde - Principale */}
        <div className="md:col-span-3">
          <div className="card bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-xl">
            <div className="card-body">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="avatar placeholder">
                    <div className="bg-primary-content/20 rounded-full w-16 h-16 flex items-center justify-center">
                      <span className="text-3xl font-bold">
                        {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile.full_name || profile.email}</h2>
                    <p className="opacity-80 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm opacity-80">Solde disponible</p>
                  <p className="text-4xl font-bold">
                    {formatNumber(profile.balance)} 
                    <span className="text-xl ml-1">{profile.currency || 'XOF'}</span>
                  </p>
                  <p className="text-sm opacity-70 mt-1">
                    Compte #{profile.account_id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="bg-success/20 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Total dépôts</p>
                <p className="text-xl font-bold">{formatNumber(stats.totalDeposits)} XOF</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="bg-error/20 p-3 rounded-full">
                <TrendingDown className="w-6 h-6 text-error" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Total retraits</p>
                <p className="text-xl font-bold">{formatNumber(stats.totalWithdrawals)} XOF</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="bg-info/20 p-3 rounded-full">
                <Receipt className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-base-content/60">Transactions</p>
                <p className="text-xl font-bold">{stats.transactionCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations du profil */}
        <div className="md:col-span-3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5" />
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Mail className="w-5 h-5 text-base-content/40" />
                  <div>
                    <p className="text-sm text-base-content/60">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
                {profile.full_name && (
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <User className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Nom complet</p>
                      <p className="font-medium">{profile.full_name}</p>
                    </div>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <Phone className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Téléphone</p>
                      <p className="font-medium">{profile.phone_number}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Calendar className="w-5 h-5 text-base-content/40" />
                  <div>
                    <p className="text-sm text-base-content/60">Membre depuis</p>
                    <p className="font-medium">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Wallet className="w-5 h-5 text-base-content/40" />
                  <div>
                    <p className="text-sm text-base-content/60">Devise</p>
                    <p className="font-medium">{profile.currency || 'XOF'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <CreditCard className="w-5 h-5 text-base-content/40" />
                  <div>
                    <p className="text-sm text-base-content/60">ID Compte</p>
                    <p className="font-medium">#{profile.account_id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="md:col-span-3">
          <div className="flex flex-wrap gap-4">
            <Link to="/transactions" className="btn btn-primary gap-2 flex-1">
              <Receipt className="w-5 h-5" />
              Voir mes transactions
            </Link>
            <Link to="/retraits" className="btn btn-outline gap-2 flex-1">
              <CreditCard className="w-5 h-5" />
              Effectuer un retrait
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBalanceMe;