// pages/utilisateurs/UtilisateurDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Calendar, Shield,
  Loader2, AlertCircle, Edit, Trash2, UserCheck, UserX,
  MapPin, Clock, CheckCircle, XCircle, UserCog,
  RefreshCw, Building, Briefcase
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const UtilisateurDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [showModalStatut, setShowModalStatut] = useState(false);
  const [showModalSuppression, setShowModalSuppression] = useState(false);
  const [chargementAction, setChargementAction] = useState(false);

  // Rôles disponibles
  const roles = {
    admin: { label: 'Administrateur', couleur: 'error', icone: Shield },
    agent: { label: 'Agent', couleur: 'primary', icone: UserCog }
  };

  useEffect(() => {
    chargerUtilisateur();
  }, [id]);

  const chargerUtilisateur = async () => {
    setChargement(true);
    setErreur(null);
    try {
      const response = await AxiosInstance.get(`/users/${id}/`);
      setUtilisateur(response.data);
    } catch (err) {
      console.error('Erreur:', err);
      setErreur(err.response?.data?.error || 'Utilisateur non trouvé');
    } finally {
      setChargement(false);
    }
  };

  // Activer/Désactiver
  const basculerStatut = async () => {
    if (!utilisateur) return;
    
    setChargementAction(true);
    try {
      const nouveauStatut = !utilisateur.is_active;
      await AxiosInstance.patch(`/users/${utilisateur.id}/`, { is_active: nouveauStatut });
      setUtilisateur({ ...utilisateur, is_active: nouveauStatut });
      setShowModalStatut(false);
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.response?.data?.error || 'Erreur lors du changement de statut');
    } finally {
      setChargementAction(false);
    }
  };

  // Supprimer
  const supprimerUtilisateur = async () => {
    if (!utilisateur) return;
    
    setChargementAction(true);
    try {
      await AxiosInstance.delete(`/users/${utilisateur.id}/`);
      navigate('/utilisateurs');
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setChargementAction(false);
    }
  };

  // Formatage
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

  const getBadgeRole = (role) => {
    const infoRole = roles[role] || { label: role, couleur: 'gray', icone: Users };
    const Icone = infoRole.icone;
    return (
      <span className={`badge badge-${infoRole.couleur} badge-lg gap-2`}>
        <Icone className="w-4 h-4" />
        {infoRole.label}
      </span>
    );
  };

  const getBadgeStatut = (estActif) => {
    return estActif ? (
      <span className="badge badge-success badge-lg gap-2">
        <CheckCircle className="w-4 h-4" />
        Actif
      </span>
    ) : (
      <span className="badge badge-error badge-lg gap-2">
        <XCircle className="w-4 h-4" />
        Inactif
      </span>
    );
  };

  if (chargement) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (erreur || !utilisateur) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{erreur || 'Utilisateur non trouvé'}</p>
        <button onClick={() => navigate('/utilisateurs')} className="btn btn-primary mt-4">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/utilisateurs')} className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Détails de l'utilisateur
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={chargerUtilisateur} className="btn btn-ghost btn-sm gap-2">
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
          <Link to={`/utilisateurs/${id}/modifier`} className="btn btn-outline gap-2">
            <Edit className="w-5 h-5" />
            Modifier
          </Link>
          <button
            onClick={() => setShowModalStatut(true)}
            className={`btn gap-2 ${utilisateur.is_active ? 'btn-warning' : 'btn-success'}`}
          >
            {utilisateur.is_active ? (
              <>
                <UserX className="w-5 h-5" />
                Désactiver
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                Activer
              </>
            )}
          </button>
          <button
            onClick={() => setShowModalSuppression(true)}
            className="btn btn-error gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte principale - Colonne de gauche */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profil */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-6">
                <div className="avatar placeholder">
                  <div className={`w-24 h-24 rounded-full ${utilisateur.is_active ? 'bg-primary/20' : 'bg-base-300'} flex items-center justify-center`}>
                    <span className={`text-4xl font-bold ${utilisateur.is_active ? 'text-primary' : 'text-base-content/40'}`}>
                      {(utilisateur.username || utilisateur.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {utilisateur.username || utilisateur.email}
                  </h2>
                  {utilisateur.first_name && (
                    <p className="text-base-content/60">
                      {utilisateur.first_name} {utilisateur.last_name || ''}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {getBadgeRole(utilisateur.role)}
                    {getBadgeStatut(utilisateur.is_active)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Mail className="w-5 h-5 text-base-content/40" />
                  <div>
                    <p className="text-sm text-base-content/60">Email</p>
                    <p className="font-medium">{utilisateur.email}</p>
                  </div>
                </div>

                {utilisateur.phone_number && (
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <Phone className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Téléphone</p>
                      <p className="font-medium">{utilisateur.phone_number}</p>
                    </div>
                  </div>
                )}

                {utilisateur.birthday && (
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <Calendar className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Date de naissance</p>
                      <p className="font-medium">{formaterDate(utilisateur.birthday)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Clock className="w-5 h-5 text-base-content/40" />
                  <div>
                    <p className="text-sm text-base-content/60">Inscrit le</p>
                    <p className="font-medium">{formaterDate(utilisateur.created_at)}</p>
                  </div>
                </div>

                {utilisateur.last_login && (
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <Clock className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Dernière connexion</p>
                      <p className="font-medium">{formaterDate(utilisateur.last_login)}</p>
                    </div>
                  </div>
                )}

                {utilisateur.address && (
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg md:col-span-2">
                    <MapPin className="w-5 h-5 text-base-content/40" />
                    <div>
                      <p className="text-sm text-base-content/60">Adresse</p>
                      <p className="font-medium">{utilisateur.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite - Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Statut */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h4 className="font-semibold text-base-content/60 mb-2">Statut du compte</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
                {utilisateur.is_active ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-success" />
                    <div>
                      <p className="font-bold text-success">Actif</p>
                      <p className="text-xs text-base-content/40">Le compte est actif</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-error" />
                    <div>
                      <p className="font-bold text-error">Inactif</p>
                      <p className="text-xs text-base-content/40">Le compte est désactivé</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rôle */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h4 className="font-semibold text-base-content/60 mb-2">Rôle</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
                {utilisateur.role === 'admin' ? (
                  <Shield className="w-8 h-8 text-error" />
                ) : (
                  <UserCog className="w-8 h-8 text-primary" />
                )}
                <div>
                  <p className="font-bold">
                    {utilisateur.role === 'admin' ? 'Administrateur' : 'Agent'}
                  </p>
                  <p className="text-xs text-base-content/40">
                    {utilisateur.role === 'admin' 
                      ? 'Accès total au système' 
                      : 'Opérations sur le terrain'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h4 className="font-semibold text-base-content/60 mb-2">Actions rapides</h4>
              <div className="space-y-2">
                <Link
                  to={`/utilisateurs/${id}/modifier`}
                  className="btn btn-outline w-full gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Link>
                <button
                  onClick={() => setShowModalStatut(true)}
                  className={`btn w-full gap-2 ${utilisateur.is_active ? 'btn-warning' : 'btn-success'}`}
                >
                  {utilisateur.is_active ? (
                    <>
                      <UserX className="w-4 h-4" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Activer
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowModalSuppression(true)}
                  className="btn btn-error w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation changement de statut */}
      {showModalStatut && utilisateur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModalStatut(false)}></div>
          <div className="relative bg-base-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full ${utilisateur.is_active ? 'bg-warning/20' : 'bg-success/20'} flex items-center justify-center mx-auto mb-4`}>
                {utilisateur.is_active ? (
                  <UserX className="w-8 h-8 text-warning" />
                ) : (
                  <UserCheck className="w-8 h-8 text-success" />
                )}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {utilisateur.is_active ? 'Désactiver' : 'Activer'} l'utilisateur
              </h3>
              <p className="text-base-content/60 mb-4">
                Êtes-vous sûr de vouloir {utilisateur.is_active ? 'désactiver' : 'activer'} 
                l'utilisateur <span className="font-bold">{utilisateur.email}</span> ?
              </p>
              <div className="flex gap-3">
                <button
                  className="btn flex-1"
                  onClick={() => setShowModalStatut(false)}
                  disabled={chargementAction}
                >
                  Annuler
                </button>
                <button
                  className={`btn flex-1 ${utilisateur.is_active ? 'btn-warning' : 'btn-success'}`}
                  onClick={basculerStatut}
                  disabled={chargementAction}
                >
                  {chargementAction ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Chargement...
                    </>
                  ) : (
                    utilisateur.is_active ? 'Désactiver' : 'Activer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation suppression */}
      {showModalSuppression && utilisateur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModalSuppression(false)}></div>
          <div className="relative bg-base-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-bold mb-2">Supprimer l'utilisateur</h3>
              <p className="text-base-content/60 mb-4">
                Êtes-vous sûr de vouloir supprimer définitivement 
                l'utilisateur <span className="font-bold">{utilisateur.email}</span> ?
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
                  onClick={supprimerUtilisateur}
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

export default UtilisateurDetail;