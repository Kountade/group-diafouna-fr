import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Users, Building2, FileText, CreditCard,
  Loader2, AlertCircle, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await AxiosInstance.get(`/transactions/${id}/`);
        setTransaction(res.data);
      } catch (err) {
        setError('Transaction introuvable');
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [id]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case 'deposit':
        return { label: 'Dépôt partenaire', icon: ArrowDownLeft, color: 'success', bg: 'bg-success/10' };
      case 'transfer_to_agent':
        return { label: 'Transfert vers agent', icon: ArrowUpRight, color: 'warning', bg: 'bg-warning/10' };
      case 'withdrawal':
        return { label: 'Retrait partenaire', icon: ArrowUpRight, color: 'error', bg: 'bg-error/10' };
      default:
        return { label: type, icon: CreditCard, color: 'default', bg: 'bg-base-200' };
    }
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
        <p className="text-xl text-base-content/70">{error || 'Transaction non trouvée'}</p>
        <Link to="/transactions" className="btn btn-primary mt-4">Retour à la liste</Link>
      </div>
    );
  }

  const typeInfo = getTypeInfo(transaction.transaction_type);
  const Icon = typeInfo.icon;
  const fromName = transaction.from_account?.owner_name || (transaction.from_account?.account_type === 'global' ? 'Compte Global' : '—');
  const toName = transaction.to_account?.owner_name || (transaction.to_account?.account_type === 'global' ? 'Compte Global' : '—');

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/transactions')} className="btn btn-ghost btn-circle">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-base-content">Détail de la transaction</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4 border-b pb-4 mb-4 flex-wrap">
                <div className={`${typeInfo.bg} p-3 rounded-full`}>
                  <Icon className={`w-8 h-8 text-${typeInfo.color}`} />
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Transaction #{transaction.id}</p>
                  <h2 className="text-xl font-bold">{typeInfo.label}</h2>
                </div>
                <div className="ml-auto">
                  <span className={`badge badge-${typeInfo.color} badge-lg`}>{typeInfo.label}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ArrowUpRight className="w-5 h-5 text-base-content/40 mt-0.5" />
                    <div>
                      <p className="text-sm text-base-content/60">Compte débiteur (De)</p>
                      <p className="font-semibold">{fromName}</p>
                      {transaction.from_account?.account_type === 'partner' && (
                        <p className="text-xs text-base-content/50">Partenaire: {transaction.from_account?.partner?.name}</p>
                      )}
                      {transaction.from_account?.account_type === 'agent' && (
                        <p className="text-xs text-base-content/50">Agent: {transaction.from_account?.user?.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowDownLeft className="w-5 h-5 text-base-content/40 mt-0.5" />
                    <div>
                      <p className="text-sm text-base-content/60">Compte créditeur (Vers)</p>
                      <p className="font-semibold">{toName}</p>
                      {transaction.to_account?.account_type === 'partner' && (
                        <p className="text-xs text-base-content/50">Partenaire: {transaction.to_account?.partner?.name}</p>
                      )}
                      {transaction.to_account?.account_type === 'agent' && (
                        <p className="text-xs text-base-content/50">Agent: {transaction.to_account?.user?.email}</p>
                      )}
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
                    <CreditCard className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Montant</p>
                      <p className={`text-2xl font-bold text-${typeInfo.color}`}>
                        {formatNumber(transaction.amount)} €
                      </p>
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

              <div className="mt-4 text-xs text-base-content/40 pt-2 border-t">
                Enregistré par : {transaction.created_by_email || 'Système'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card bg-primary/5 shadow-xl">
            <div className="card-body">
              <h3 className="font-bold text-lg">Actions</h3>
              <div className="space-y-2 mt-2">
                <button onClick={() => navigate('/transactions')} className="btn btn-ghost w-full">
                  Retour à la liste
                </button>
                {transaction.transaction_type === 'deposit' && (
                  <Link to={`/depots/${transaction.id}/pdf`} className="btn btn-outline btn-primary w-full gap-2">
                    <FileText className="w-4 h-4" /> Télécharger le reçu
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;