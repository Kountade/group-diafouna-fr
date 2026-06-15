import React, { useEffect, useState } from 'react';
import {
  RefreshCw, Eye, DollarSign, Building2, Users, Loader2,
  CheckCircle, XCircle, Search, Filter
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import { useNavigate } from 'react-router-dom';

const Comptes = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get('/accounts/');
      setAccounts(response.data || []);
    } catch (error) {
      console.error(error);
      showNotification('Erreur lors du chargement des comptes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Filtres
  const filteredAccounts = accounts.filter(acc => {
    const matchSearch = acc.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (acc.account_type?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = !filterType || acc.account_type === filterType;
    return matchSearch && matchType;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'global': return { label: 'Compte Global', color: 'primary' };
      case 'partner': return { label: 'Partenaire', color: 'success' };
      case 'agent': return { label: 'Agent', color: 'warning' };
      default: return { label: type, color: 'default' };
    }
  };

  const getOwnerName = (account) => {
    if (account.account_type === 'global') return 'Entreprise';
    if (account.account_type === 'partner') return account.owner_name || 'Partenaire';
    return account.owner_name || 'Agent';
  };

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
            <h1 className="text-3xl font-bold text-base-content">Comptes</h1>
            <p className="text-base-content/60 mt-1">Soldes des comptes global, partenaires et agents</p>
          </div>
          <button onClick={fetchAccounts} className="btn btn-outline gap-2">
            <RefreshCw className="w-5 h-5" /> Actualiser
          </button>
        </div>

        {/* Filtres */}
        <div className="card bg-base-100 shadow-lg mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Recherche</span></label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Nom du titulaire, type..."
                  className="input input-bordered w-full pl-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Type de compte</span></label>
              <select className="select select-bordered" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Tous</option>
                <option value="global">Compte Global</option>
                <option value="partner">Comptes Partenaires</option>
                <option value="agent">Comptes Agents</option>
              </select>
            </div>
            <div className="form-control justify-end">
              <button onClick={() => { setSearchTerm(''); setFilterType(''); }} className="btn btn-outline btn-sm gap-1 mt-8">
                <Filter className="w-4 h-4" /> Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Grille des comptes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <DollarSign className="w-20 h-20 mx-auto text-base-content/30 mb-3" />
              <p className="text-base-content/50">Aucun compte trouvé</p>
            </div>
          ) : (
            filteredAccounts.map((account) => {
              const typeInfo = getTypeBadge(account.account_type);
              return (
                <div key={account.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div className={`badge badge-${typeInfo.color} badge-lg`}>{typeInfo.label}</div>
                      <button
                        onClick={() => navigate(`/comptes/${account.id}`)}
                        className="btn btn-ghost btn-sm btn-circle tooltip"
                        data-tip="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-base-content/60">Titulaire</p>
                      <p className="font-semibold text-lg">{getOwnerName(account)}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-base-200">
                      <p className="text-sm text-base-content/60">Solde actuel</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatNumber(account.balance)} {account.currency || '€'}
                      </p>
                    </div>
                    {account.account_type === 'partner' && (
                      <div className="mt-2 text-xs text-base-content/50">
                        ID Partenaire: {account.partner?.id || '—'}
                      </div>
                    )}
                    {account.account_type === 'agent' && (
                      <div className="mt-2 text-xs text-base-content/50">
                        ID Agent: {account.user?.id || '—'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
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

export default Comptes;