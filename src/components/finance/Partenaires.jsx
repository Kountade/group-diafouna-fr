import React, { useEffect, useState } from 'react';
import {
  Plus, Trash2, Search, RefreshCw, Filter, Eye, Edit, Users, Phone, Mail,
  Loader2, Building2, DollarSign, XCircle, CheckCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import { useNavigate, Link } from 'react-router-dom';

const Partenaires = () => {
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get('/partners/');
      setPartners(response.data || []);
    } catch (error) {
      console.error(error);
      showNotification('Erreur lors du chargement des partenaires', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    try {
      await AxiosInstance.delete(`/partners/${partnerToDelete.id}/`);
      showNotification('Partenaire supprimé avec succès', 'success');
      fetchPartners();
      setShowDeleteModal(false);
      setPartnerToDelete(null);
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  // Filtrage local
  const filteredPartners = partners.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedPartners = filteredPartners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pageCount = Math.ceil(filteredPartners.length / rowsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
          <p className="mt-5 text-xl text-gray-600">Chargement des partenaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-8 py-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-base`}>
            {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span className="text-base">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Partenaires</h1>
          <p className="text-gray-500 text-base mt-1">Gestion des partenaires financiers</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchPartners} className="btn btn-outline gap-2 normal-case text-base">
            <RefreshCw className="w-5 h-5" /> Actualiser
          </button>
          <Link to="/partenaires/ajouter" className="btn btn-primary gap-2 normal-case text-base">
            <Plus className="w-5 h-5" /> Nouveau partenaire
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="card bg-base-100 shadow-lg mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text text-base font-medium">Recherche</span></label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nom, email, téléphone..."
                className="input input-bordered w-full pl-11 text-base py-3 h-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="form-control justify-end">
            <button
              className="btn btn-outline mt-8 gap-2 normal-case text-base"
              onClick={() => setSearchTerm('')}
            >
              <Filter className="w-5 h-5" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des partenaires */}
      <div className="card bg-base-100 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-base">
                <th className="py-4 px-3">PARTENAIRE</th>
                <th className="py-4 px-3">CONTACT</th>
                <th className="py-4 px-3">TÉLÉPHONE</th>
                <th className="text-right py-4 px-3">SOLDE (€)</th>
                <th className="text-center py-4 px-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <Building2 className="w-20 h-20 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400 text-base">
                      {searchTerm ? 'Aucun partenaire trouvé' : 'Aucun partenaire enregistré'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50 transition text-sm">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-base">{partner.name}</div>
                          <div className="text-sm text-gray-500">Créé le {new Date(partner.created_at).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-base">{partner.email}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-base">{partner.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="text-right font-bold text-primary text-lg px-3 py-3">
                      {partner.account_balance !== undefined ? formatNumber(partner.account_balance) : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/partenaires/${partner.id}`)}
                          className="btn btn-ghost btn-sm gap-1 tooltip"
                          data-tip="Voir détail"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/partenaires/${partner.id}/modifier`)}
                          className="btn btn-ghost btn-sm gap-1 tooltip"
                          data-tip="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { setPartnerToDelete(partner); setShowDeleteModal(true); }}
                          className="btn btn-ghost btn-sm text-error gap-1 tooltip"
                          data-tip="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
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
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-base text-gray-700">Lignes par page :</span>
            <select
              className="select select-bordered select-sm w-20 text-base"
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            >
              {[5, 10, 25, 50].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="join">
            <button
              className="join-item btn btn-md"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >«</button>
            <span className="join-item btn btn-md text-base">Page {page + 1} / {pageCount || 1}</span>
            <button
              className="join-item btn btn-md"
              disabled={page >= pageCount - 1}
              onClick={() => setPage(page + 1)}
            >»</button>
          </div>
        </div>
      </div>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-10 h-10 text-error" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 text-base mb-6">
              Êtes-vous sûr de vouloir supprimer le partenaire <strong className="text-orange-600">"{partnerToDelete?.name}"</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline text-base">Annuler</button>
              <button onClick={handleDeletePartner} className="btn btn-error text-base">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Partenaires;