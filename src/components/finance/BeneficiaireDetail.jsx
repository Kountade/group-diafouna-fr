import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, FileText, MapPin, Calendar,
  Edit, Trash2, Loader2, AlertCircle, UserCheck, Users,
  CheckCircle, XCircle, Shield, CreditCard
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const BeneficiaireDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beneficiaire, setBeneficiaire] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [showModalSuppression, setShowModalSuppression] = useState(false);
  const [chargementAction, setChargementAction] = useState(false);

  useEffect(() => {
    chargerBeneficiaire();
  }, [id]);

  const chargerBeneficiaire = async () => {
    setChargement(true);
    setErreur(null);
    try {
      const response = await AxiosInstance.get(`/recipients/${id}/`);
      setBeneficiaire(response.data);

      // Charger les transactions associées (via le paramètre recipient)
      try {
        const transRes = await AxiosInstance.get(`/transactions/?recipient=${id}&limit=10`);
        setTransactions(transRes.data || []);
      } catch (err) {
        console.warn('Erreur chargement transactions:', err);
        setTransactions([]);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setErreur(err.response?.data?.error || 'Impossible de charger le bénéficiaire');
    } finally {
      setChargement(false);
    }
  };

  const supprimerBeneficiaire = async () => {
    if (!beneficiaire) return;
    
    setChargementAction(true);
    try {
      await AxiosInstance.delete(`/recipients/${beneficiaire.id}/`);
      navigate('/beneficiaires');
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setChargementAction(false);
      setShowModalSuppression(false);
    }
  };

  const formaterDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formaterNombre = (nombre) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(nombre);
  };

  const getTypeDocumentLabel = (type) => {
    const types = {
      cni: 'Carte Nationale d\'Identité',
      passport: 'Passeport',
      permis: 'Permis de Conduire',
      carte_sejour: 'Carte de Séjour',
      autre: 'Autre'
    };
    return types[type] || type;
  };

  if (chargement) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (erreur || !beneficiaire) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{erreur || 'Bénéficiaire introuvable'}</p>
        <Link to="/beneficiaires" className="btn btn-primary mt-4">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* En-tête avec actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/beneficiaires')} className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-base-content">Bénéficiaire</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/beneficiaires/${beneficiaire.id}/modifier`}
            className="btn btn-outline gap-2"
          >
            <Edit className="w-5 h-5" /> Modifier
          </Link>
          <button
            onClick={() => setShowModalSuppression(true)}
            className="btn btn-outline btn-error gap-2"
          >
            <Trash2 className="w-5 h-5" /> Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
                <div className="avatar placeholder">
                  <div className="bg-primary/20 text-primary rounded-full w-20 h-20 flex items-center justify-center">
                    <User className="w-10 h-10" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {beneficiaire.first_name} {beneficiaire.last_name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge badge-primary gap-1">
                      <Shield className="w-3 h-3" />
                      {getTypeDocumentLabel(beneficiaire.document_type)}
                    </span>
                    <span className={`badge ${beneficiaire.is_regular ? 'badge-success' : 'badge-warning'} gap-1`}>
                      {beneficiaire.is_regular ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {beneficiaire.is_regular ? 'Régulier' : 'Occasionnel'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-base-content/40" />
                      <span>{beneficiaire.email || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-base-content/40" />
                      <span>{beneficiaire.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-full">
                      <FileText className="w-5 h-5 text-base-content/40" />
                      <span>
                        {getTypeDocumentLabel(beneficiaire.document_type)} – 
                        <span className="font-mono ml-1">{beneficiaire.document_number}</span>
                      </span>
                    </div>
                    {beneficiaire.address && (
                      <div className="flex items-center gap-2 col-span-full">
                        <MapPin className="w-5 h-5 text-base-content/40" />
                        <span>{beneficiaire.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-base-content/40" />
                      <span>Ajouté le {formaterDate(beneficiaire.created_at)}</span>
                    </div>
                    {beneficiaire.updated_at && beneficiaire.updated_at !== beneficiaire.created_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-base-content/40" />
                        <span>Modifié le {formaterDate(beneficiaire.updated_at)}</span>
                      </div>
                    )}
                  </div>
                  {beneficiaire.notes && (
                    <div className="mt-4 pt-4 border-t border-base-200">
                      <p className="text-sm text-base-content/60">Notes</p>
                      <p className="whitespace-pre-wrap mt-1">{beneficiaire.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historique des transactions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Historique des retraits
              </h3>
              {transactions.length === 0 ? (
                <p className="text-base-content/60 py-4">Aucun retrait associé à ce bénéficiaire.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Description</th>
                        <th>Partenaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{formaterDate(tx.created_at)}</td>
                          <td className="text-error font-bold">
                            - {formaterNombre(tx.amount)} €
                          </td>
                          <td>{tx.description || '—'}</td>
                          <td>{tx.partner_name || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {transactions.length > 0 && (
                <div className="flex justify-end mt-2">
                  <Link to={`/transactions?recipient=${beneficiaire.id}`} className="text-primary text-sm">
                    Voir toutes les transactions →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne de droite : résumé et actions */}
        <div className="lg:col-span-1">
          <div className="card bg-primary/5 shadow-xl">
            <div className="card-body">
              <h3 className="font-bold text-lg">Résumé</h3>
              <div className="space-y-3 mt-2">
                <div className="flex justify-between items-center border-b border-base-200 pb-2">
                  <span className="text-sm text-base-content/60">Nombre de retraits</span>
                  <span className="font-bold text-lg">{transactions.length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-base-200 pb-2">
                  <span className="text-sm text-base-content/60">Total retiré</span>
                  <span className="font-bold text-lg text-error">
                    {formaterNombre(transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0))} €
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-base-content/60">Statut</span>
                  <span className={`badge ${beneficiaire.is_regular ? 'badge-success' : 'badge-warning'}`}>
                    {beneficiaire.is_regular ? 'Régulier' : 'Occasionnel'}
                  </span>
                </div>
              </div>
              <div className="divider"></div>
              <div className="space-y-2">
                <Link to={`/retraits?recipient=${beneficiaire.id}`} className="btn btn-outline btn-primary w-full gap-2">
                  <CreditCard className="w-4 h-4" /> Nouveau retrait
                </Link>
                <Link to={`/beneficiaires/${beneficiaire.id}/modifier`} className="btn btn-outline w-full gap-2">
                  <Edit className="w-4 h-4" /> Modifier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation suppression */}
      {showModalSuppression && beneficiaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModalSuppression(false)}></div>
          <div className="relative bg-base-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-bold mb-2">Supprimer le bénéficiaire</h3>
              <p className="text-base-content/60 mb-4">
                Êtes-vous sûr de vouloir supprimer définitivement 
                le bénéficiaire <span className="font-bold">{beneficiaire.first_name} {beneficiaire.last_name}</span> ?
                <br />
                <span className="text-error text-sm">Cette action est irréversible !</span>
              </p>
              <div className="flex gap-3">
                <button
                  className="btn flex-1"
                  onClick={() => setShowModalSuppression(false)}
                  disabled={chargementAction}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-error flex-1"
                  onClick={supprimerBeneficiaire}
                  disabled={chargementAction}
                >
                  {chargementAction ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Suppression...
                    </>
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiaireDetail;