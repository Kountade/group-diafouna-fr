import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2, Mail, Phone, MapPin, Calendar, DollarSign, ArrowLeft,
  Edit, Trash2, CreditCard, Receipt, Loader2, AlertCircle,
  FileText, Filter, X
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import PartenairePDF from './PartenairePDF';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

const PartenaireDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [account, setAccount] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les filtres
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const partnerRes = await AxiosInstance.get(`/partners/${id}/`);
        setPartner(partnerRes.data);

        const accountsRes = await AxiosInstance.get(`/accounts/?partner_id=${id}`);
        const partnerAccount = accountsRes.data?.find(acc => acc.account_type === 'partner') || null;
        setAccount(partnerAccount);

        if (partnerAccount) {
          const transRes = await AxiosInstance.get(`/transactions/?account=${partnerAccount.id}`);
          const allTx = transRes.data || [];

          const depositsData = allTx.filter(tx => tx.transaction_type === 'deposit');
          const withdrawalsData = allTx.filter(tx => tx.transaction_type === 'withdrawal');
          
          setDeposits(depositsData);
          setWithdrawals(withdrawalsData);
          setFilteredDeposits(depositsData);
          setFilteredWithdrawals(withdrawalsData);
        } else {
          setDeposits([]);
          setWithdrawals([]);
          setFilteredDeposits([]);
          setFilteredWithdrawals([]);
        }
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les informations du partenaire');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Appliquer les filtres de date
  const applyFilters = () => {
    const filterByDate = (transactions) => {
      return transactions.filter(tx => {
        const txDate = new Date(tx.created_at).toISOString().split('T')[0];
        if (dateFrom && txDate < dateFrom) return false;
        if (dateTo && txDate > dateTo) return false;
        return true;
      });
    };

    setFilteredDeposits(filterByDate(deposits));
    setFilteredWithdrawals(filterByDate(withdrawals));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setFilteredDeposits(deposits);
    setFilteredWithdrawals(withdrawals);
  };

  // Appliquer les filtres quand les dates changent
  useEffect(() => {
    if (deposits.length > 0 || withdrawals.length > 0) {
      applyFilters();
    }
  }, [dateFrom, dateTo, deposits, withdrawals]);

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
        await AxiosInstance.delete(`/partners/${id}/`);
        navigate('/partenaires');
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{error || 'Partenaire introuvable'}</p>
        <Link to="/partenaires" className="btn btn-primary mt-4">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* En-tête avec actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/partenaires')} className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-base-content">Partenaire</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline gap-2"
          >
            <Filter className="w-5 h-5" /> Filtres
          </button>
          <PDFDownloadLink
            document={
              <PartenairePDF
                partner={partner}
                account={account}
                deposits={filteredDeposits}
                withdrawals={filteredWithdrawals}
                dateFrom={dateFrom}
                dateTo={dateTo}
              />
            }
            fileName={`Rapport_${partner.name}_${new Date().toISOString().split('T')[0]}.pdf`}
            className="btn btn-primary gap-2"
          >
            {({ loading }) => (
              <>
                <FileText className="w-5 h-5" />
                {loading ? 'Génération...' : 'PDF'}
              </>
            )}
          </PDFDownloadLink>
          <Link to={`/partenaires/${id}/modifier`} className="btn btn-outline gap-2">
            <Edit className="w-5 h-5" /> Modifier
          </Link>
          <button onClick={handleDelete} className="btn btn-outline btn-error gap-2">
            <Trash2 className="w-5 h-5" /> Supprimer
          </button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="card bg-base-100 shadow-lg mb-6 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Filtrer par période</h3>
            <button onClick={() => setShowFilters(false)} className="btn btn-ghost btn-sm">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Du</span></label>
              <input
                type="date"
                className="input input-bordered"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Au</span></label>
              <input
                type="date"
                className="input input-bordered"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={applyFilters} className="btn btn-primary flex-1">Appliquer</button>
              <button onClick={resetFilters} className="btn btn-ghost">Réinitialiser</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche : infos + listes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte d'identité */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
                <div className="avatar placeholder">
                  <div className="bg-primary/20 text-primary rounded-full w-20 h-20 flex items-center justify-center">
                    <Building2 className="w-10 h-10" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{partner.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-base-content/40" />
                      <span>{partner.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-base-content/40" />
                      <span>{partner.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-full">
                      <MapPin className="w-5 h-5 text-base-content/40" />
                      <span>{partner.address || 'Adresse non renseignée'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-base-content/40" />
                      <span>Membre depuis le {formatDate(partner.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deux cartes : Dépôts et Retraits côte à côte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dépôts */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center flex-wrap gap-3 mb-2">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-success">
                    <CreditCard className="w-5 h-5" /> Dépôts
                    <span className="badge badge-success badge-sm">{filteredDeposits.length}</span>
                  </h3>
                  <Link to={`/depots?partner=${partner.id}`} className="text-primary text-sm">Voir tout →</Link>
                </div>
                {filteredDeposits.length === 0 ? (
                  <p className="text-base-content/60 py-2">Aucun dépôt sur cette période</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredDeposits.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center border-b border-base-200 py-2">
                        <div>
                          <p className="font-medium">{formatDate(tx.created_at)}</p>
                          <p className="text-sm text-base-content/60">{tx.description || '—'}</p>
                        </div>
                        <span className="text-success font-bold">+{formatNumber(tx.amount)} €</span>
                      </div>
                    ))}
                    {filteredDeposits.length > 10 && (
                      <p className="text-sm text-base-content/60 text-center">+ {filteredDeposits.length - 10} autres</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Retraits */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center flex-wrap gap-3 mb-2">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-error">
                    <CreditCard className="w-5 h-5 rotate-180" /> Retraits
                    <span className="badge badge-error badge-sm">{filteredWithdrawals.length}</span>
                  </h3>
                  <Link to={`/retraits?partner=${partner.id}`} className="text-primary text-sm">Voir tout →</Link>
                </div>
                {filteredWithdrawals.length === 0 ? (
                  <p className="text-base-content/60 py-2">Aucun retrait sur cette période</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredWithdrawals.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center border-b border-base-200 py-2">
                        <div>
                          <p className="font-medium">{formatDate(tx.created_at)}</p>
                          <p className="text-sm text-base-content/60">{tx.description || '—'}</p>
                        </div>
                        <span className="text-error font-bold">-{formatNumber(tx.amount)} €</span>
                      </div>
                    ))}
                    {filteredWithdrawals.length > 10 && (
                      <p className="text-sm text-base-content/60 text-center">+ {filteredWithdrawals.length - 10} autres</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite : solde */}
        <div className="lg:col-span-1">
          <div className="card bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-xl">
            <div className="card-body">
              <div className="flex flex-col items-center text-center">
                <DollarSign className="w-12 h-12 mb-2" />
                <p className="text-sm opacity-80">Solde actuel</p>
                <p className="text-4xl font-bold mt-1">{account ? formatNumber(account.balance) : '0.00'} €</p>
                <div className="flex gap-3 mt-6 w-full">
                  <Link to={`/depots?partner=${partner.id}`} className="btn btn-outline flex-1 text-primary-content border-primary-content/30 gap-1">
                    <CreditCard className="w-4 h-4" /> Dépôt
                  </Link>
                  <Link to={`/retraits?partner=${partner.id}`} className="btn btn-outline flex-1 text-primary-content border-primary-content/30 gap-1">
                    <CreditCard className="w-4 h-4 rotate-180" /> Retrait
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartenaireDetail;