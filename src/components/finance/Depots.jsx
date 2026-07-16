import React, { useEffect, useState } from 'react';
import {
  Plus, Search, RefreshCw, Filter, Eye, FileText, Users, CreditCard,
  Loader2, XCircle, CheckCircle, Calendar, ArrowLeftRight
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import { useNavigate, Link } from 'react-router-dom';

const Depots = () => {
  const navigate = useNavigate();

  const [deposits, setDeposits] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      // Récupérer toutes les transactions de type deposit
      const response = await AxiosInstance.get('/transactions/?type=deposit');
      setDeposits(response.data || []);
      
      // Récupérer les partenaires pour le filtre
      const partnersRes = await AxiosInstance.get('/partners/');
      setPartners(partnersRes.data || []);
    } catch (error) {
      console.error(error);
      showNotification('Erreur lors du chargement des dépôts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // Filtrage local
  const filteredDeposits = deposits.filter(d => {
    const matchSearch = d.partner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.id?.toString().includes(searchTerm);
    const matchPartner = !filterPartner || d.partner?.toString() === filterPartner;
    let matchDate = true;
    if (startDate) {
      const depDate = new Date(d.created_at).toISOString().split('T')[0];
      if (depDate < startDate) matchDate = false;
    }
    if (endDate && matchDate) {
      const depDate = new Date(d.created_at).toISOString().split('T')[0];
      if (depDate > endDate) matchDate = false;
    }
    return matchSearch && matchPartner && matchDate;
  });

  const paginated = filteredDeposits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pageCount = Math.ceil(filteredDeposits.length / rowsPerPage);

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
        {/* En-tête */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Dépôts partenaires</h1>
            <p className="text-base-content/60 mt-1">Historique des dépôts reçus</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchDeposits} className="btn btn-outline gap-2">
              <RefreshCw className="w-5 h-5" /> Actualiser
            </button>
            <Link to="/depots/nouveau" className="btn btn-primary gap-2">
              <Plus className="w-5 h-5" /> Nouveau dépôt
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="card bg-base-100 shadow-lg mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Recherche</span></label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="N°, partenaire, description..."
                  className="input input-bordered w-full pl-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Partenaire</span></label>
              <select className="select select-bordered" value={filterPartner} onChange={(e) => setFilterPartner(e.target.value)}>
                <option value="">Tous</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
            <button onClick={() => { setSearchTerm(''); setFilterPartner(''); setStartDate(''); setEndDate(''); setPage(0); }} className="btn btn-outline btn-sm gap-1">
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
                  <th>N° transaction</th>
                  <th>Partenaire</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Description</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <CreditCard className="w-16 h-16 mx-auto text-base-content/30 mb-3" />
                      <p className="text-base-content/50">Aucun dépôt trouvé</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map(d => (
                    <tr key={d.id} className="hover:bg-base-200 transition">
                      <td className="font-mono text-sm">#{d.id}</td>
                      <td className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-base-content/40" />
                        {d.partner_name || (d.to_account?.partner?.name) || '—'}
                      </td>
                      <td>{formatDate(d.created_at)}</td>
                      <td className="text-success font-bold">{formatNumber(d.amount)} €</td>
                      <td className="max-w-xs truncate">{d.description || '—'}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/depots/${d.id}`)}
                            className="btn btn-ghost btn-sm tooltip"
                            data-tip="Détail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/depots/${d.id}/pdf`, { state: { transaction: d } })}
                            className="btn btn-ghost btn-sm tooltip"
                            data-tip="PDF"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
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

export default Depots;