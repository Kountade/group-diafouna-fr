import React, { useEffect, useState } from 'react';
import {
  Plus, Trash2, Search, RefreshCw, Filter, Eye, Edit, Phone, Mail,
  Loader2, Building2, XCircle, CheckCircle, AlertTriangle,
  RotateCcw, Receipt, TrendingDown, Wallet
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
  const [deleteReason, setDeleteReason] = useState('');
  const [hardDelete, setHardDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [globalBalance, setGlobalBalance] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const formatNumber = (number) => {
    const n = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(n);
  };

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const url = showDeleted ? '/partners/?include_deleted=true' : '/partners/';
      const response = await AxiosInstance.get(url);
      setPartners(response.data || []);
    } catch (error) {
      showNotification('Erreur lors du chargement', 'error');
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

  useEffect(() => {
    fetchPartners();
    fetchGlobalBalance();
  }, [showDeleted]);

  const openDeleteModal = (partner) => {
    setPartnerToDelete(partner);
    setDeleteReason('');
    setHardDelete(false);
    setDeleteResult(null);
    setShowDeleteModal(true);
  };

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    setDeleting(true);
    try {
      const response = await AxiosInstance.delete(`/partners/${partnerToDelete.id}/`, {
        data: {
          confirm: true,
          reason: deleteReason || `Suppression du partenaire ${partnerToDelete.name}`,
          hard_delete: hardDelete
        }
      });
      setDeleteResult(response.data);
      setShowDeleteModal(false);
      setShowResultModal(true);
      fetchPartners();
      fetchGlobalBalance();
    } catch (error) {
      const msg = error.response?.data?.error || 'Erreur lors de la suppression';
      showNotification(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRestorePartner = async (partner) => {
    try {
      await AxiosInstance.post(`/partners/${partner.id}/restore/`);
      showNotification(`Partenaire "${partner.name}" restauré`, 'success');
      fetchPartners();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur', 'error');
    }
  };

  const filteredPartners = partners.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchTerm.toLowerCase()));

  const paginatedPartners = filteredPartners.slice(
    page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pageCount = Math.ceil(filteredPartners.length / rowsPerPage);

  if (loading && partners.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-8 py-6">
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Partenaires</h1>
          <p className="text-gray-500">Gestion des partenaires financiers</p>
        </div>
        <div className="flex gap-3 items-center">
          {globalBalance !== null && (
            <div className="badge badge-primary badge-lg gap-2 py-4 px-4">
              <Wallet className="w-5 h-5" />
              <span className="font-bold">Global: {formatNumber(globalBalance)} GNF</span>
            </div>
          )}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`btn gap-2 ${showDeleted ? 'btn-warning' : 'btn-outline'}`}
          >
            <RotateCcw className="w-5 h-5" />
            {showDeleted ? 'Masquer supprimés' : 'Voir supprimés'}
          </button>
          <button onClick={fetchPartners} className="btn btn-outline gap-2">
            <RefreshCw className="w-5 h-5" /> Actualiser
          </button>
          <Link to="/partenaires/ajouter" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" /> Nouveau
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="card bg-base-100 shadow-lg mb-6 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Nom, email, téléphone..."
            className="input input-bordered w-full pl-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="card bg-base-100 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-50">
                <th>PARTENAIRE</th>
                <th>CONTACT</th>
                <th>TÉLÉPHONE</th>
                <th className="text-right">SOLDE</th>
                <th className="text-center">STATUT</th>
                <th className="text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Building2 className="w-20 h-20 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400">
                      {searchTerm ? 'Aucun partenaire trouvé' : 'Aucun partenaire'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPartners.map((partner) => (
                  <tr key={partner.id} className={`hover ${partner.is_deleted ? 'opacity-50 bg-gray-100' : ''}`}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`avatar placeholder ${partner.is_deleted ? 'grayscale' : ''}`}>
                          <div className={`rounded-full w-12 h-12 flex items-center justify-center ${partner.is_deleted ? 'bg-gray-300' : 'bg-primary/10 text-primary'}`}>
                            <Building2 className="w-6 h-6" />
                          </div>
                        </div>
                        <div>
                          <div className={`font-semibold ${partner.is_deleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            {partner.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Créé le {new Date(partner.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span>{partner.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span>{partner.phone || '—'}</span>
                      </div>
                    </td>
                    <td className={`text-right font-bold ${partner.is_deleted ? 'text-gray-400' : (parseFloat(partner.account_balance) < 0 ? 'text-error' : 'text-primary')}`}>
                      {partner.account_balance !== undefined ? formatNumber(partner.account_balance) : '—'}
                    </td>
                    <td className="text-center">
                      {partner.is_deleted ? (
                        <span className="badge badge-error gap-1">
                          <XCircle className="w-3 h-3" /> Supprimé
                        </span>
                      ) : (
                        <span className="badge badge-success gap-1">
                          <CheckCircle className="w-3 h-3" /> Actif
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        {partner.is_deleted ? (
                          <>
                            <button
                              onClick={() => handleRestorePartner(partner)}
                              className="btn btn-ghost btn-sm text-success tooltip"
                              data-tip="Restaurer"
                            >
                              <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => navigate(`/partenaires/${partner.id}`)}
                              className="btn btn-ghost btn-sm tooltip"
                              data-tip="Détail"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(`/partenaires/${partner.id}`)}
                              className="btn btn-ghost btn-sm tooltip"
                              data-tip="Détail"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => navigate(`/partenaires/${partner.id}/modifier`)}
                              className="btn btn-ghost btn-sm tooltip"
                              data-tip="Modifier"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(partner)}
                              className="btn btn-ghost btn-sm text-error tooltip"
                              data-tip="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="flex items-center gap-3">
            <span>Lignes par page :</span>
            <select
              className="select select-bordered select-sm w-20"
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            >
              {[5, 10, 25, 50].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="join">
            <button className="join-item btn" disabled={page === 0} onClick={() => setPage(page - 1)}>«</button>
            <span className="join-item btn">Page {page + 1} / {pageCount || 1}</span>
            <button className="join-item btn" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}>»</button>
          </div>
        </div>
      </div>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="mx-auto w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-error" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-center">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-4 text-center">
              Supprimer <strong className="text-orange-600">"{partnerToDelete?.name}"</strong> ?
            </p>

            <div className="alert alert-warning mb-4">
              <AlertTriangle className="w-5 h-5" />
              <div className="text-sm">
                <p className="font-semibold">Effets de cette action :</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Toutes les transactions du partenaire seront supprimées</li>
                  <li>Le solde du partenaire sera <strong>déduit du compte global</strong></li>
                  <li>Le compte partenaire sera supprimé</li>
                </ul>
              </div>
            </div>

            <div className="form-control mb-3">
              <label className="label"><span className="label-text font-medium">Raison (optionnel)</span></label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Ex: Partenaire inactif..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={2}
              />
            </div>

            <label className="label cursor-pointer justify-start gap-3 mb-4">
              <input
                type="checkbox"
                className="checkbox checkbox-error"
                checked={hardDelete}
                onChange={(e) => setHardDelete(e.target.checked)}
              />
              <div>
                <span className="label-text font-medium text-error">Suppression définitive</span>
                <p className="text-xs text-gray-500">Supprime physiquement le partenaire (irréversible)</p>
              </div>
            </label>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setShowDeleteModal(false); setPartnerToDelete(null); }}
                className="btn btn-outline"
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDeletePartner}
                className="btn btn-error gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Suppression...</>
                ) : (
                  <><Trash2 className="w-5 h-5" /> Confirmer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal résultat */}
      {showResultModal && deleteResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-success">Suppression réussie</h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Partenaire
                </span>
                <span className="font-semibold">{deleteResult.partner_name}</span>
              </div>
              <div className="divider my-1"></div>
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Transactions supprimées
                </span>
                <span className="font-bold text-warning">{deleteResult.transactions_reversed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> Solde partenaire
                </span>
                <span className="font-bold text-primary">{formatNumber(deleteResult.partner_balance)} GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Nouveau solde global
                </span>
                <span className="font-bold text-success">{formatNumber(deleteResult.global_balance_after)} GNF</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center my-4">{deleteResult.message}</p>

            <div className="flex justify-center">
              <button
                onClick={() => { setShowResultModal(false); setDeleteResult(null); }}
                className="btn btn-primary"
              >
                Fermer
              </button>
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