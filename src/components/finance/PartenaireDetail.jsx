import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2, Mail, Phone, MapPin, Calendar, DollarSign, ArrowLeft,
  Edit, Trash2, CreditCard, Receipt, Loader2, AlertCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const PartenaireDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [account, setAccount] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Partenaire
        const partnerRes = await AxiosInstance.get(`/finance/partners/${id}/`);
        setPartner(partnerRes.data);

        // Compte associé (via l'endpoint /accounts/?partner_id=xx)
        const accountsRes = await AxiosInstance.get(`/finance/accounts/?partner_id=${id}`);
        const partnerAccount = accountsRes.data?.find(acc => acc.account_type === 'partner') || null;
        setAccount(partnerAccount);

        // Dernières transactions (via endpoint /transactions/?partner_id=xx)
        const transRes = await AxiosInstance.get(`/finance/transactions/?partner_id=${id}&limit=5`);
        setRecentTransactions(transRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les informations du partenaire');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer définitivement ce partenaire ?')) {
      try {
        await AxiosInstance.delete(`/finance/partners/${id}/`);
        navigate('/partenaires');
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
          <p className="text-xl text-gray-600">{error || 'Partenaire introuvable'}</p>
          <Link to="/partenaires" className="btn btn-primary mt-4">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-8 py-6">
      <div className="max-w-5xl mx-auto">
        {/* En-tête avec navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/partenaires')} className="btn btn-ghost btn-circle">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Partenaire</h1>
          </div>
          <div className="flex gap-3">
            <Link to={`/partenaires/${id}/modifier`} className="btn btn-outline gap-2">
              <Edit className="w-5 h-5" /> Modifier
            </Link>
            <button onClick={handleDelete} className="btn btn-outline btn-error gap-2">
              <Trash2 className="w-5 h-5" /> Supprimer
            </button>
          </div>
        </div>

        {/* Carte d'identité */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="avatar placeholder">
                <div className="bg-primary/20 text-primary rounded-full w-20 h-20 flex items-center justify-center">
                  <Building2 className="w-10 h-10" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{partner.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{partner.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{partner.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-full">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{partner.address || 'Adresse non renseignée'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Membre depuis le {formatDate(partner.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solde du compte */}
        <div className="card bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-xl mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-80">Solde actuel</p>
                  <p className="text-3xl font-bold">{account ? formatNumber(account.balance) : '0.00'} €</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/depots?partner=${partner.id}`} className="btn btn-outline btn-sm text-primary-content border-primary-content/30 gap-1">
                  <CreditCard className="w-4 h-4" /> Dépôt
                </Link>
                <Link to={`/retraits?partner=${partner.id}`} className="btn btn-outline btn-sm text-primary-content border-primary-content/30 gap-1">
                  <CreditCard className="w-4 h-4 rotate-180" /> Retrait
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dernières transactions */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center flex-wrap gap-3 mb-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5" /> Dernières transactions
              </h3>
              <Link to={`/transactions?partner=${partner.id}`} className="text-primary text-sm">Voir tout →</Link>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 py-4">Aucune transaction enregistrée pour ce partenaire.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Montant</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{formatDate(tx.created_at)}</td>
                        <td>
                          <span className={`badge ${tx.transaction_type === 'deposit' ? 'badge-success' : 'badge-warning'}`}>
                            {tx.transaction_type === 'deposit' ? 'Dépôt' : 'Retrait'}
                          </span>
                        </td>
                        <td className={tx.transaction_type === 'deposit' ? 'text-success font-bold' : 'text-error font-bold'}>
                          {tx.transaction_type === 'deposit' ? '+' : '-'} {formatNumber(tx.amount)} €
                        </td>
                        <td>{tx.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartenaireDetail;