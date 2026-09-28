// pages/Transactions.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Receipt, Search, Filter, Download, ArrowLeft,
  Loader2, AlertCircle, ChevronLeft, ChevronRight,
  CreditCard, Send, ArrowLeftRight, Clock, Eye, RefreshCw,
  RotateCcw, Ban, CheckCircle, Wallet
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const Transactions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(queryParams.get('type') || 'all');
  const [filterDate, setFilterDate] = useState(queryParams.get('date') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [includeReversed, setIncludeReversed] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [transactionToReverse, setTransactionToReverse] = useState(null);
  const [reverseReason, setReverseReason] = useState('');
  const [reversing, setReversing] = useState(false);
  const [globalBalance, setGlobalBalance] = useState(null);
  const [stats, setStats] = useState({
    total: 0, deposits: 0, transfers: 0, withdrawals: 0, reversals: 0
  });

  const itemsPerPage = 10;

  const transactionTypes = {
    deposit: { label: 'ENTRÉE', color: 'success', icon: CreditCard },
    transfer_to_agent: { label: 'Transfert', color: 'info', icon: Send },
    withdrawal: { label: 'SORTIE', color: 'warning', icon: ArrowLeftRight },
    transfer_between_agents: { label: 'Transfert Agent', color: 'info', icon: Send },
    partner_deletion_reversal: { label: 'ANNULATION', color: 'error', icon: RotateCcw },
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/transactions/?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`;
      if (filterType !== 'all') url += `&transaction_type=${filterType}`;
      if (filterDate) url += `&date_from=${filterDate}`;
      if (includeReversed) url += `&include_reversed=true`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const partnerId = queryParams.get('partner');
      if (partnerId) url += `&partner=${partnerId}`;
      const agentId = queryParams.get('agent');
      if (agentId) url += `&agent=${agentId}`;
      const accountId = queryParams.get('account');
      if (accountId) url += `&account=${accountId}`;

      const response = await AxiosInstance.get(url);

      if (Array.isArray(response.data)) {
        setTransactions(response.data);
        setTotalItems(response.data.length);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        calculateStats(response.data);
      } else if (response.data.results) {
        setTransactions(response.data.results);
        setTotalItems(response.data.count || 0);
        setTotalPages(Math.ceil((response.data.count || 0) / itemsPerPage));
        calculateStats(response.data.results);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalBalance = async () => {
    try {
      const response = await AxiosInstance.get('/accounts/global/');
      setGlobalBalance(response.data?.balance);
    } catch (error) {
      console.error(error);
    }
  };

  const calculateStats = (data) => {
    const deposits = data.filter(t => t.transaction_type === 'deposit' && !t.is_reversed);
    const transfers = data.filter(t =>
      ['transfer_to_agent', 'transfer_between_agents'].includes(t.transaction_type) && !t.is_reversed);
    const withdrawals = data.filter(t => t.transaction_type === 'withdrawal' && !t.is_reversed);
    const reversals = data.filter(t => t.transaction_type === 'partner_deletion_reversal' || t.is_reversed);

    setStats({
      total: data.length,
      deposits: deposits.length,
      transfers: transfers.length,
      withdrawals: withdrawals.length,
      reversals: reversals.length
    });
  };

  useEffect(() => {
    fetchTransactions();
    fetchGlobalBalance();
  }, [currentPage, filterType, filterDate, searchTerm, location.search, includeReversed]);

  const formatNumber = (n) => {
    const num = parseFloat(n) || 0;
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'GNF',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getTransactionType = (type) =>
    transactionTypes[type] || { label: type, color: 'gray', icon: Receipt };

  const refresh = () => {
    fetchTransactions();
    fetchGlobalBalance();
  };

  const exportCSV = async () => {
    try {
      const response = await AxiosInstance.get('/transactions/export/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Erreur export');
    }
  };

  const openReverseModal = (transaction) => {
    setTransactionToReverse(transaction);
    setReverseReason('');
    setShowReverseModal(true);
  };

  const handleReverseTransaction = async () => {
    if (!transactionToReverse) return;
    setReversing(true);
    try {
      const response = await AxiosInstance.post(
        `/transactions/${transactionToReverse.id}/reverse/`,
        { reason: reverseReason || 'Annulation manuelle' });
      alert(`Transaction annulée.\nMontant restauré: ${formatNumber(response.data.amount_reversed)} GNF`);
      setShowReverseModal(false);
      setTransactionToReverse(null);
      refresh();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur');
    } finally {
      setReversing(false);
    }
  };

  const canBeReversed = (t) => {
    if (t.is_reversed) return false;
    if (t.transaction_type === 'partner_deletion_reversal') return false;
    return ['deposit', 'withdrawal'].includes(t.transaction_type);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {location.state?.from && (
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Receipt className="w-8 h-8 text-primary" />
              Transactions
            </h1>
            <p className="text-base-content/60 mt-1">{totalItems} transaction(s)</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {globalBalance !== null && (
            <div className="badge badge-primary badge-lg gap-2 py-4 px-4">
              <Wallet className="w-5 h-5" />
              <span className="font-bold">Global: {formatNumber(globalBalance)} GNF</span>
            </div>
          )}
          <label className="label cursor-pointer gap-2">
            <span className="label-text text-sm">Voir annulées</span>
            <input
              type="checkbox"
              className="toggle toggle-warning toggle-sm"
              checked={includeReversed}
              onChange={(e) => setIncludeReversed(e.target.checked)}
            />
          </label>
          <button onClick={refresh} className="btn btn-ghost btn-sm gap-2">
            <RefreshCw className="w-4 h-4" /> Rafraîchir
          </button>
          <button onClick={exportCSV} className="btn btn-outline btn-sm gap-2">
            <Download className="w-4 h-4" /> Exporter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: Receipt, color: 'primary' },
          { label: 'Entrées', value: stats.deposits, icon: CreditCard, color: 'success' },
          { label: 'Transferts', value: stats.transfers, icon: Send, color: 'info' },
          { label: 'Sorties', value: stats.withdrawals, icon: ArrowLeftRight, color: 'warning' },
          { label: 'Annulations', value: stats.reversals, icon: RotateCcw, color: 'error' },
        ].map((s, i) => (
          <div key={i} className="card bg-base-100 shadow-md">
            <div className="card-body py-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-base-content/60">{s.label}</p>
                  <p className={`text-xl font-bold text-${s.color}`}>{s.value}</p>
                </div>
                <s.icon className={`w-6 h-6 text-${s.color}/60`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select select-bordered"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="deposit">Entrées</option>
              <option value="transfer_to_agent">Transferts vers agent</option>
              <option value="transfer_between_agents">Transferts entre agents</option>
              <option value="withdrawal">Sorties</option>
              <option value="partner_deletion_reversal">Annulations</option>
            </select>
            <input
              type="date"
              className="input input-bordered"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button
              className="btn btn-ghost btn-sm gap-2"
              onClick={() => { setFilterType('all'); setFilterDate(''); setSearchTerm(''); }}
            >
              <Filter className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12 bg-base-100 rounded-xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <p className="text-xl">{error}</p>
          <button onClick={refresh} className="btn btn-primary mt-4">Réessayer</button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-xl shadow-xl">
          <Receipt className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <p className="text-xl text-base-content/60">Aucune transaction</p>
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
                  <th>Statut</th>
                  <th>Par</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const typeInfo = getTransactionType(t.transaction_type);
                  const TypeIcon = typeInfo.icon;
                  const isCredit = t.transaction_type === 'deposit';
                  const isReversal = t.transaction_type === 'partner_deletion_reversal';
                  const isReversed = t.is_reversed;
                  const fromType = t.from_account_type || 'deleted';
                  const toType = t.to_account_type || 'deleted';

                  return (
                    <tr key={t.id} className={`hover ${isReversed || isReversal ? 'opacity-60 bg-red-50' : ''}`}>
                      <td className="text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-base-content/40" />
                          {formatDate(t.created_at)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${typeInfo.color} gap-1`}>
                          <TypeIcon className="w-3 h-3" /> {typeInfo.label}
                        </span>
                      </td>
                      <td className="text-sm">{t.from_account_label || (fromType === 'global' ? 'Global' : fromType)}</td>
                      <td className="text-sm">{t.to_account_label || (toType === 'global' ? 'Global' : toType)}</td>
                      <td className={`font-bold ${isReversed || isReversal ? 'text-gray-400 line-through' :
                          isCredit ? 'text-success' : 'text-error'}`}>
                        {isReversed || isReversal ? '' : (isCredit ? '+' : '-')} {formatCurrency(t.amount)}
                      </td>
                      <td className="text-sm max-w-[150px] truncate" title={t.description}>
                        {t.description || '—'}
                        {t.recipient_name && (
                          <div className="text-xs text-gray-500">Bénéf: {t.recipient_name}</div>
                        )}
                      </td>
                      <td>
                        {isReversed ? (
                          <span className="badge badge-error badge-sm gap-1">
                            <Ban className="w-3 h-3" /> Annulée
                          </span>
                        ) : isReversal ? (
                          <span className="badge badge-warning badge-sm gap-1">
                            <RotateCcw className="w-3 h-3" /> Annulation
                          </span>
                        ) : (
                          <span className="badge badge-success badge-sm gap-1">
                            <CheckCircle className="w-3 h-3" /> Valide
                          </span>
                        )}
                      </td>
                      <td className="text-sm">{t.created_by_email || 'Système'}</td>
                      <td>
                        <div className="flex gap-1">
                          <Link to={`/transactions/${t.id}`} className="btn btn-ghost btn-xs" title="Voir">
                            <Eye className="w-3 h-3" />
                          </Link>
                          {canBeReversed(t) && (
                            <button
                              onClick={() => openReverseModal(t)}
                              className="btn btn-ghost btn-xs text-error"
                              title="Annuler"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-base-content/60">
                {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
              </p>
              <div className="flex gap-1">
                <button className="btn btn-sm btn-ghost" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
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
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button className="btn btn-sm btn-ghost" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showReverseModal && transactionToReverse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
              <RotateCcw className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Annuler la transaction</h3>
            <p className="text-gray-600 text-sm mb-4 text-center">
              Les soldes seront restaurés à leur état précédent.
            </p>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold">{getTransactionType(transactionToReverse.transaction_type).label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant:</span>
                <span className="font-bold text-primary">{formatCurrency(transactionToReverse.amount)}</span>
              </div>
            </div>

            <div className="form-control mb-4">
              <label className="label"><span className="label-text font-medium">Raison</span></label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Ex: Erreur de saisie..."
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setShowReverseModal(false); setTransactionToReverse(null); }}
                className="btn btn-outline"
                disabled={reversing}
              >
                Annuler
              </button>
              <button onClick={handleReverseTransaction} className="btn btn-error gap-2" disabled={reversing}>
                {reversing ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</> :
                  <><RotateCcw className="w-4 h-4" /> Confirmer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;