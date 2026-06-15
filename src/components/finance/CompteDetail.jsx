import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, Users, Building2, Calendar, History,
  Loader2, AlertCircle, CreditCard, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const CompteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountRes = await AxiosInstance.get(`/accounts/${id}/`);
        setAccount(accountRes.data);
        // Récupérer les transactions liées à ce compte (en entrée ou sortie)
        const transRes = await AxiosInstance.get(`/transactions/?account=${id}`);
        setTransactions(transRes.data || []);
      } catch (err) {
        setError('Compte introuvable');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case 'deposit': return { label: 'Dépôt', icon: ArrowDownLeft, color: 'success' };
      case 'transfer_to_agent': return { label: 'Transfert → Agent', icon: ArrowUpRight, color: 'warning' };
      case 'withdrawal': return { label: 'Retrait', icon: ArrowUpRight, color: 'error' };
      default: return { label: type, icon: History, color: 'default' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{error || 'Compte introuvable'}</p>
        <Link to="/comptes" className="btn btn-primary mt-4">Retour aux comptes</Link>
      </div>
    );
  }

  const typeBadge = account.account_type === 'global' ? 'primary' : (account.account_type === 'partner' ? 'success' : 'warning');
  const ownerName = account.account_type === 'global' ? 'Entreprise' : (account.owner_name || (account.account_type === 'partner' ? 'Partenaire' : 'Agent'));

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/comptes')} className="btn btn-ghost btn-circle">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-base-content">Détail du compte</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <span className={`badge badge-${typeBadge} badge-lg`}>
                    {account.account_type === 'global' ? 'Compte Global' : (account.account_type === 'partner' ? 'Compte Partenaire' : 'Compte Agent')}
                  </span>
                  <h2 className="text-2xl font-bold mt-2">{ownerName}</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-base-content/60">Solde actuel</p>
                  <p className="text-3xl font-bold text-primary">{formatNumber(account.balance)} {account.currency || '€'}</p>
                </div>
              </div>
              <div className="divider"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-base-content/40" />
                  <div>
                    <p className="text-sm text-base-content/60">Créé le</p>
                    <p>{formatDate(account.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-base-content/40" />
                  <div>
                    <p className="text-sm text-base-content/60">Devise</p>
                    <p>{account.currency || 'Euro (€)'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="lg:col-span-1">
          <div className="card bg-primary/5 shadow-xl">
            <div className="card-body">
              <h3 className="font-bold text-lg">Actions</h3>
              <div className="space-y-2 mt-2">
                {account.account_type === 'partner' && (
                  <>
                    <Link to={`/depots?partner=${account.partner?.id}`} className="btn btn-outline btn-success w-full gap-2">
                      <CreditCard className="w-4 h-4" /> Effectuer un dépôt
                    </Link>
                    <Link to={`/retraits?partner=${account.partner?.id}`} className="btn btn-outline btn-warning w-full gap-2">
                      <CreditCard className="w-4 h-4 rotate-180" /> Effectuer un retrait
                    </Link>
                  </>
                )}
                {account.account_type === 'agent' && (
                  <Link to={`/transferts-vers-agents?agent=${account.user?.id}`} className="btn btn-outline btn-primary w-full gap-2">
                    <ArrowUpRight className="w-4 h-4" /> Approvisionner
                  </Link>
                )}
                <button onClick={() => navigate('/comptes')} className="btn btn-ghost w-full">Retour à la liste</button>
              </div>
            </div>
          </div>
        </div>

        {/* Historique des transactions */}
        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <History className="w-5 h-5" /> Historique des transactions
              </h3>
              {transactions.length === 0 ? (
                <p className="text-base-content/60 py-4">Aucune transaction sur ce compte.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Date</th>
                        <th>Type</th>
                        <th>Montant</th>
                        <th>Contrepartie</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => {
                        const typeInfo = getTypeInfo(tx.transaction_type);
                        const Icon = typeInfo.icon;
                        const isCredit = tx.transaction_type === 'deposit' && tx.to_account?.id === account.id;
                        const isDebit = tx.transaction_type === 'withdrawal' && tx.from_account?.id === account.id;
                        const isTransferOut = tx.transaction_type === 'transfer_to_agent' && tx.from_account?.id === account.id;
                        const isTransferIn = tx.transaction_type === 'transfer_to_agent' && tx.to_account?.id === account.id;
                        let amountColor = 'text-base-content';
                        let sign = '';
                        if (isCredit || isTransferIn) { amountColor = 'text-success'; sign = '+'; }
                        if (isDebit || isTransferOut) { amountColor = 'text-error'; sign = '-'; }
                        const counterparty = tx.from_account?.id === account.id ? tx.to_account?.owner_name : tx.from_account?.owner_name;
                        return (
                          <tr key={tx.id}>
                            <td>{formatDate(tx.created_at)}</td>
                            <td>
                              <div className="flex items-center gap-1">
                                <Icon className="w-4 h-4" />
                                <span>{typeInfo.label}</span>
                              </div>
                            </td>
                            <td className={`font-bold ${amountColor}`}>
                              {sign} {formatNumber(tx.amount)} €
                            </td>
                            <td>{counterparty || '—'}</td>
                            <td className="max-w-xs truncate">{tx.description || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompteDetail;