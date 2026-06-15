import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, Euro, Calendar, FileText, Printer, Receipt,
  Loader2, AlertCircle, Building2
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const DepotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const res = await AxiosInstance.get(`/transactions/${id}/`);
        if (res.data.transaction_type !== 'deposit') {
          setError('Cette transaction n\'est pas un dépôt');
        } else {
          setTransaction(res.data);
        }
      } catch (err) {
        setError('Dépôt introuvable');
      } finally {
        setLoading(false);
      }
    };
    fetchDeposit();
  }, [id]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{error || 'Dépôt non trouvé'}</p>
        <Link to="/depots" className="btn btn-primary mt-4">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button onClick={() => navigate('/depots')} className="btn btn-ghost btn-circle">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-base-content">Détail du dépôt</h1>
        <button
          onClick={() => navigate(`/depots/${id}/pdf`)}
          className="btn btn-outline btn-sm gap-2 ml-auto"
        >
          <Printer className="w-4 h-4" /> PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte principale */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4 border-b pb-4 mb-4 flex-wrap">
                <div className="bg-success/20 p-3 rounded-full">
                  <Receipt className="w-8 h-8 text-success" />
                </div>
                <div>
                  <p className="text-sm text-base-content/60">N° de transaction</p>
                  <p className="text-2xl font-mono font-bold">#{transaction.id}</p>
                </div>
                <div className="ml-auto">
                  <p className="text-sm text-base-content/60">Statut</p>
                  <span className="badge badge-success badge-lg">Dépôt confirmé</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Partenaire</p>
                      <p className="font-semibold">{transaction.partner_name || transaction.to_account?.partner?.name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Euro className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Montant</p>
                      <p className="text-2xl font-bold text-success">{formatNumber(transaction.amount)} €</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Date et heure</p>
                      <p>{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Enregistré par</p>
                      <p>{transaction.created_by_email || 'Administrateur'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {transaction.description && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-base-content/40 mt-0.5" />
                    <div>
                      <p className="text-sm text-base-content/60">Description</p>
                      <p className="whitespace-pre-wrap">{transaction.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne latérale - Actions */}
        <div className="lg:col-span-1">
          <div className="card bg-primary/5 shadow-xl">
            <div className="card-body">
              <h3 className="font-bold text-lg">Actions</h3>
              <div className="space-y-2 mt-2">
                <button
                  onClick={() => navigate(`/depots/${id}/pdf`)}
                  className="btn btn-outline btn-primary w-full gap-2"
                >
                  <Printer className="w-4 h-4" /> Télécharger le reçu
                </button>
                <button
                  onClick={() => navigate('/depots')}
                  className="btn btn-ghost w-full"
                >
                  Retour à la liste
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepotDetail;