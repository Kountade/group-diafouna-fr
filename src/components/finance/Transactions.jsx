// pages/Transactions.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Receipt, Search, Filter, Download, Calendar, ArrowLeft,
  Loader2, AlertCircle, ChevronLeft, ChevronRight,
  CreditCard, Send, ArrowLeftRight, DollarSign, User,
  Building2, Clock, Eye, RefreshCw
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const Transactions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // États
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(queryParams.get('type') || 'all');
  const [filterDate, setFilterDate] = useState(queryParams.get('date') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    deposits: 0,
    transfers: 0,
    withdrawals: 0,
    totalAmount: 0
  });

  const itemsPerPage = 10;

  // Types de transaction avec couleurs et icônes
  const transactionTypes = {
    deposit: { 
      label: 'Dépôt', 
      color: 'success', 
      icon: CreditCard,
      description: 'Dépôt partenaire'
    },
    transfer_to_agent: { 
      label: 'Transfert', 
      color: 'info', 
      icon: Send,
      description: 'Transfert Global → Agent'
    },
    withdrawal: { 
      label: 'Retrait', 
      color: 'warning', 
      icon: ArrowLeftRight,
      description: 'Retrait partenaire via agent'
    }
  };

  // Récupérer les transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/transactions/?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}&ordering=${sortOrder === 'desc' ? '-' : ''}created_at`;
      
      // Filtres
      if (filterType !== 'all') {
        url += `&transaction_type=${filterType}`;
      }
      
      if (filterDate) {
        url += `&date=${filterDate}`;
      }
      
      // Filtre de recherche
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      // Filtres depuis les paramètres URL
      const partnerId = queryParams.get('partner');
      if (partnerId) {
        url += `&partner=${partnerId}`;
      }
      
      const agentId = queryParams.get('agent');
      if (agentId) {
        url += `&agent=${agentId}`;
      }
      
      const accountId = queryParams.get('account');
      if (accountId) {
        url += `&account=${accountId}`;
      }
      
      const response = await AxiosInstance.get(url);
      
      // Si la réponse est une liste directe
      if (Array.isArray(response.data)) {
        setTransactions(response.data);
        setTotalItems(response.data.length);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        calculateStats(response.data);
      } 
      // Si la réponse est paginée
      else if (response.data.results) {
        setTransactions(response.data.results);
        setTotalItems(response.data.count || 0);
        setTotalPages(Math.ceil((response.data.count || 0) / itemsPerPage));
        calculateStats(response.data.results);
      }
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Impossible de charger les transactions');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({ total: 0, deposits: 0, transfers: 0, withdrawals: 0, totalAmount: 0 });
      return;
    }
    
    const deposits = data.filter(t => t.transaction_type === 'deposit');
    const transfers = data.filter(t => t.transaction_type === 'transfer_to_agent');
    const withdrawals = data.filter(t => t.transaction_type === 'withdrawal');
    
    const totalAmount = data.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    setStats({
      total: data.length,
      deposits: deposits.length,
      transfers: transfers.length,
      withdrawals: withdrawals.length,
      totalAmount: totalAmount
    });
  };

  // Charger les transactions
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filterType, filterDate, sortOrder, searchTerm, location.search]);

  // Formatage
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
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionType = (type) => {
    return transactionTypes[type] || { label: type, color: 'gray', icon: Receipt };
  };

  // Gestion des pages
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Export CSV (simulé)
  const exportCSV = () => {
    alert('Fonctionnalité d\'export CSV à implémenter');
  };

  // Rafraîchir
  const refresh = () => {
    fetchTransactions();
  };

  // Composant de chargement
  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {location.state?.from && (
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <Receipt className="w-8 h-8 text-primary" />
              Transactions
            </h1>
            <p className="text-base-content/60 mt-1">
              {totalItems} transaction{totalItems > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="btn btn-ghost btn-sm gap-2">
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
          <button onClick={exportCSV} className="btn btn-outline btn-sm gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body py-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <Receipt className="w-6 h-6 text-primary/60" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body py-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60">Dépôts</p>
                <p className="text-xl font-bold text-success">{stats.deposits}</p>
              </div>
              <CreditCard className="w-6 h-6 text-success/60" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body py-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60">Transferts</p>
                <p className="text-xl font-bold text-info">{stats.transfers}</p>
              </div>
              <Send className="w-6 h-6 text-info/60" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body py-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60">Retraits</p>
                <p className="text-xl font-bold text-warning">{stats.withdrawals}</p>
              </div>
              <ArrowLeftRight className="w-6 h-6 text-warning/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher une transaction..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="select select-bordered"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="deposit">Dépôts</option>
              <option value="transfer_to_agent">Transferts</option>
              <option value="withdrawal">Retraits</option>
            </select>
            
            <input
              type="date"
              className="input input-bordered"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            
            <button
              className="btn btn-ghost btn-sm gap-2"
              onClick={() => {
                setFilterType('all');
                setFilterDate('');
                setSearchTerm('');
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des transactions */}
      {error ? (
        <div className="text-center py-12 bg-base-100 rounded-xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <p className="text-xl text-base-content/70">{error}</p>
          <button onClick={refresh} className="btn btn-primary mt-4">
            Réessayer
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-xl shadow-xl">
          <Receipt className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <p className="text-xl text-base-content/60">Aucune transaction trouvée</p>
          <p className="text-sm text-base-content/40 mt-2">
            {searchTerm || filterType !== 'all' || filterDate 
              ? 'Essayez de modifier vos filtres' 
              : 'Aucune transaction enregistrée pour le moment'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-base-100 rounded-xl shadow-xl">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200">
                  <th>Date</th>
                  <th>Type</th>
                  <th>De</th>
                  <th>Vers</th>
                  <th>Montant</th>
                  <th>Description</th>
                  <th>Par</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const typeInfo = getTransactionType(transaction.transaction_type);
                  const TypeIcon = typeInfo.icon;
                  const isCredit = transaction.transaction_type === 'deposit' || 
                                   transaction.transaction_type === 'transfer_to_agent';
                  
                  return (
                    <tr key={transaction.id} className="hover">
                      <td className="whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-base-content/40" />
                          {formatDate(transaction.created_at)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${typeInfo.color} gap-1`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="w-6 h-6 bg-base-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {transaction.from_account_type === 'global' ? 'G' :
                                 transaction.from_account_type === 'partner' ? 'P' : 'A'}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm">
                            {transaction.from_account_type === 'global' ? 'Global' :
                             transaction.from_account_type === 'partner' ? 'Partenaire' : 'Agent'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="w-6 h-6 bg-base-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {transaction.to_account_type === 'global' ? 'G' :
                                 transaction.to_account_type === 'partner' ? 'P' : 'A'}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm">
                            {transaction.to_account_type === 'global' ? 'Global' :
                             transaction.to_account_type === 'partner' ? 'Partenaire' : 'Agent'}
                          </span>
                        </div>
                      </td>
                      <td className={`font-bold ${isCredit ? 'text-success' : 'text-error'}`}>
                        {isCredit ? '+' : '-'} {formatNumber(transaction.amount)} XOF
                      </td>
                      <td className="text-sm max-w-[150px] truncate">
                        {transaction.description || '—'}
                      </td>
                      <td className="text-sm">
                        {transaction.created_by_email || 'Système'}
                      </td>
                      <td>
                        <Link
                          to={`/transactions/${transaction.id}`}
                          className="btn btn-ghost btn-xs gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-base-content/60">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} transactions
              </p>
              <div className="flex gap-1">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;