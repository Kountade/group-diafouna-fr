import React, { useEffect, useState } from 'react';
import {
  RefreshCw, Eye, Search, Filter, Loader2, CheckCircle, XCircle,
  ArrowDownLeft, ArrowUpRight, CreditCard, Users, Building2, Calendar
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [partners, setPartners] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'deposit': return 'Dépôt partenaire';
      case 'transfer_to_agent': return 'Transfert → Agent';
      case 'withdrawal': return 'Retrait partenaire';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit': return 'success';
      case 'transfer_to_agent': return 'warning';
      case 'withdrawal': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit': return ArrowDownLeft;
      case 'transfer_to_agent': return ArrowUpRight;
      case 'withdrawal': return CreditCard;
      default: return CreditCard;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, partnersRes, agentsRes] = await Promise.all([
        AxiosInstance.get('/transactions/'),
        AxiosInstance.get('/partners/'),
        AxiosInstance.get('/users/?role=agent')
      ]);
      setTransactions(transRes.data || []);
      setPartners(partnersRes.data || []);
      setAgents(agentsRes.data || []);
    } catch (error) {
      console.error(error);
      showNotification('Erreur lors du chargement des transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    // Recherche textuelle
    const search = searchTerm.toLowerCase();
    const matchSearch = 
      (tx.id?.toString().includes(search)) ||
      (tx.description?.toLowerCase().includes(search)) ||
      (tx.from_account?.owner_name?.toLowerCase().includes(search)) ||
      (tx.to_account?.owner_name?.toLowerCase().includes(search));
    
    // Type
    const matchType = !filterType || tx.transaction_type === filterType;
    
    // Partenaire (via to_account si deposit, via from_account si withdrawal)
    let partnerId = null;
    if (tx.transaction_type === 'deposit') partnerId = tx.to_account?.partner?.id;
    if (tx.transaction_type === 'withdrawal') partnerId = tx.from_account?.partner?.id;
    const matchPartner = !filterPartner || partnerId?.toString() === filterPartner;
    
    // Agent
    let agentId = null;
    if (tx.transaction_type === 'transfer_to_agent') agentId = tx.to_account?.user?.id;
    if (tx.transaction_type === 'withdrawal') agentId = tx.from_account?.user?.id;
    const matchAgent = !filterAgent || agentId?.toString() === filterAgent;
    
    // Dates
    const txDate = new Date(tx.created_at).toISOString().split('T')[0];
    const matchStart = !startDate || txDate >= startDate;
    const matchEnd = !endDate || txDate <= endDate;
    
    return matchSearch && matchType && matchPartner && matchAgent && matchStart && matchEnd;
  });

  const paginated = filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pageCount = Math.ceil(filteredTransactions.length / rowsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Transactions</h1>
            <p className="text-base-content/60 mt-1">Historique complet des opérations</p>
          </div>
          <button onClick={fetchData} className="btn btn-outline gap-2">
            <RefreshCw className="w-5 h-5" /> Actualiser
          </button>
        </div>

        {/* Filtres */}
        <div className="card bg-base-100 shadow-lg mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Recherche</span></label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="ID, description..."
                  className="input input-bordered w-full pl-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Type</span></label>
              <select className="select select-bordered" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Tous</option>
                <option value="deposit">Dépôt partenaire</option>
                <option value="transfer_to_agent">Transfert → Agent</option>
                <option value="withdrawal">Retrait partenaire</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Partenaire</span></label>
              <select className="select select-bordered" value={filterPartner} onChange={(e) => setFilterPartner(e.target.value)}>
                <option value="">Tous</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Agent</span></label>
              <select className="select select-bordered" value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)}>
                <option value="">Tous</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.email}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Du</span></label>
              <input type="date" className="input input-bordered" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Au</span></label>
              <input type="date" className="input input-bordered" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => { setSearchTerm(''); setFilterType(''); setFilterPartner(''); setFilterAgent(''); setStartDate(''); setEndDate(''); }} className="btn btn-outline btn-sm gap-1">
              <Filter className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="card bg-base-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200">
                  <th>ID</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>De</th>
                  <th>Vers</th>
                  <th>Montant</th>
                  <th>Description</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <CreditCard className="w-16 h-16 mx-auto text-base-content/30 mb-3" />
                      <p className="text-base-content/50">Aucune transaction trouvée</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map(tx => {
                    const Icon = getTypeIcon(tx.transaction_type);
                    const typeColor = getTypeColor(tx.transaction_type);
                    const fromName = tx.from_account?.owner_name || (tx.from_account?.account_type === 'global' ? 'Compte Global' : '—');
                    const toName = tx.to_account?.owner_name || (tx.to_account?.account_type === 'global' ? 'Compte Global' : '—');
                    return (
                      <tr key={tx.id} className="hover:bg-base-200 transition">
                        <td className="font-mono text-sm">#{tx.id}</td>
                        <td className="whitespace-nowrap">{formatDate(tx.created_at)}</td>
                        <td>
                          <div className={`badge badge-${typeColor} badge-md gap-1`}>
                            <Icon className="w-3 h-3" /> {getTypeLabel(tx.transaction_type)}
                          </div>
                        </td>
                        <td>{fromName}</td>
                        <td>{toName}</td>
                        <td className={`font-bold ${typeColor === 'success' ? 'text-success' : typeColor === 'error' ? 'text-error' : 'text-warning'}`}>
                          {formatNumber(tx.amount)} €
                        </td>
                        <td className="max-w-xs truncate">{tx.description || '—'}</td>
                        <td className="text-center">
                          <button
                            onClick={() => navigate(`/transactions/${tx.id}`)}
                            className="btn btn-ghost btn-sm tooltip"
                            data-tip="Détail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-4 border-t border-base-200">
            <div className="flex items-center gap-3">
              <span>Lignes par page :</span>
              <select className="select select-bordered select-sm w-20" value={rowsPerPage} onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}>
                {[5, 10, 25, 50].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="join">
              <button className="join-item btn btn-sm" disabled={page === 0} onClick={() => setPage(page-1)}>«</button>
              <span className="join-item btn btn-sm">Page {page+1} / {pageCount || 1}</span>
              <button className="join-item btn btn-sm" disabled={page >= pageCount-1} onClick={() => setPage(page+1)}>»</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default Transactions;