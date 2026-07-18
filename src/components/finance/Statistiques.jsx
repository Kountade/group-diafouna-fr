import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Calendar,
  Loader2, AlertCircle, Download, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const Statistiques = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [withdrawalStats, setWithdrawalStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [globalRes, withdrawalRes] = await Promise.all([
        AxiosInstance.get('/transactions/global-stats/').catch(err => {
          console.error('Erreur global-stats:', err);
          return { data: null };
        }),
        AxiosInstance.get('/transactions/withdrawal-stats/').catch(err => {
          console.error('Erreur withdrawal-stats:', err);
          return { data: null };
        })
      ]);

      if (!globalRes.data) {
        setError('Impossible de charger les statistiques globales');
        setLoading(false);
        return;
      }

      setStats(globalRes.data);
      setWithdrawalStats(withdrawalRes.data || null);
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
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return '—';
    const [year, month] = monthStr.split('-');
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${months[parseInt(month)-1]} ${year}`;
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
        <button onClick={fetchStats} className="btn btn-primary mt-4">
          Réessayer
        </button>
      </div>
    );
  }

  // 🛡️ Valeurs par défaut pour éviter les crashes
  const transactions = stats.transactions || {
    total: 0,
    total_amount: 0,
    deposits: 0,
    withdrawals: 0,
    transfers: 0,
    by_type: []
  };
  const globalAccount = stats.global_account || { balance: 0 };
  const withdrawalData = withdrawalStats || {
    total_withdrawals: 0,
    total_amount: 0,
    by_month: [],
    top_recipients: []
  };

  const filteredWithdrawals = withdrawalData.by_month || [];
  const paginated = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Statistiques financières</h1>
          <p className="text-base-content/60 mt-1">Analyse détaillée des transactions</p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn btn-outline gap-2"
        >
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>

      {/* Résumé global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <p className="text-sm text-base-content/60">Total transactions</p>
            <p className="text-3xl font-bold">{transactions.total}</p>
            <p className="text-xs text-base-content/40">{formatNumber(transactions.total_amount)} GNF</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <p className="text-sm text-base-content/60">Moyenne par transaction</p>
            <p className="text-3xl font-bold text-primary">
              {transactions.total > 0 ? formatNumber(transactions.total_amount / transactions.total) : '0'} GNF
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <p className="text-sm text-base-content/60">Solde global</p>
            <p className="text-3xl font-bold text-success">{formatNumber(globalAccount.balance)} GNF</p>
          </div>
        </div>
      </div>

      {/* Répartition par type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {transactions.by_type && transactions.by_type.length > 0 ? (
          transactions.by_type.map((type) => (
            <div key={type.type} className="card bg-base-100 shadow-xl">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">{type.label}</p>
                    <p className="text-2xl font-bold">{type.count}</p>
                    <p className="text-xs text-base-content/40">{formatNumber(type.total)} GNF</p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    type.type === 'deposit' ? 'bg-success/20' :
                    type.type === 'withdrawal' ? 'bg-error/20' : 'bg-warning/20'
                  }`}>
                    {type.type === 'deposit' ? <TrendingUp className="w-6 h-6 text-success" /> :
                     type.type === 'withdrawal' ? <TrendingDown className="w-6 h-6 text-error" /> :
                     <DollarSign className="w-6 h-6 text-warning" />}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-base-content/60">
            Aucune donnée de répartition disponible
          </div>
        )}
      </div>

      {/* Statistiques des retraits */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-xl font-bold">Évolution des retraits</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/60">Total :</span>
              <span className="font-bold text-error">{formatNumber(withdrawalData.total_amount)} GNF</span>
              <span className="badge badge-neutral">{withdrawalData.total_withdrawals} retraits</span>
            </div>
          </div>

          {filteredWithdrawals.length === 0 ? (
            <p className="text-base-content/60 py-4">Aucune donnée de retrait disponible</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Mois</th>
                      <th>Nombre de retraits</th>
                      <th>Montant total</th>
                      <th>Montant moyen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item, idx) => (
                      <tr key={idx}>
                        <td>{getMonthName(item.month)}</td>
                        <td>{item.count}</td>
                        <td className="text-error font-bold">{formatNumber(item.total)} GNF</td>
                        <td>{item.count > 0 ? formatNumber(item.total / item.count) : '0'} GNF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-base-content/60">
                    Mois {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)} sur {filteredWithdrawals.length}
                  </p>
                  <div className="flex gap-1">
                    <button
                      className="btn btn-sm btn-ghost"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let num = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        num = currentPage - 2 + i;
                        if (num > totalPages) return null;
                      }
                      return (
                        <button
                          key={num}
                          className={`btn btn-sm ${currentPage === num ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setCurrentPage(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                    <button
                      className="btn btn-sm btn-ghost"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Top bénéficiaires */}
          {withdrawalData.top_recipients && withdrawalData.top_recipients.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-base-content/80 mb-2">Top bénéficiaires</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {withdrawalData.top_recipients.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-base-content/40">{r.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-error font-bold">{formatNumber(r.total_amount)} GNF</p>
                      <p className="text-xs text-base-content/40">{r.total_withdrawals} retraits</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistiques;