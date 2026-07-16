import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Search, Plus, Edit, Trash2, Eye, Loader2,
  AlertCircle, UserCheck, Mail, Calendar,
  RefreshCw, Filter, ChevronLeft, ChevronRight,
  UserPlus, CheckCircle, XCircle, Phone, FileText, MapPin, User
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const Beneficiaires = () => {
  const navigate = useNavigate();
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [beneficiairesFiltres, setBeneficiairesFiltres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [filtreDocument, setFiltreDocument] = useState('all');
  const [filtreRegularite, setFiltreRegularite] = useState('all');
  const [pageActuelle, setPageActuelle] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [elementsParPage] = useState(10);
  const [beneficiaireSelectionne, setBeneficiaireSelectionne] = useState(null);
  const [showModalSuppression, setShowModalSuppression] = useState(false);
  const [chargementAction, setChargementAction] = useState(false);

  // Types de documents
  const typesDocument = {
    cni: { label: 'Carte Nationale d\'Identité', badge: 'primary' },
    passport: { label: 'Passeport', badge: 'secondary' },
    permis: { label: 'Permis de Conduire', badge: 'warning' },
    carte_sejour: { label: 'Carte de Séjour', badge: 'info' },
    autre: { label: 'Autre', badge: 'ghost' }
  };

  // Charger les bénéficiaires
  useEffect(() => {
    chargerBeneficiaires();
  }, []);

  const chargerBeneficiaires = async () => {
    setChargement(true);
    setErreur(null);
    try {
      const response = await AxiosInstance.get('/recipients/');
      setBeneficiaires(response.data);
      setBeneficiairesFiltres(response.data);
      setTotalPages(Math.ceil(response.data.length / elementsParPage));
    } catch (err) {
      console.error('Erreur:', err);
      setErreur(err.response?.data?.error || 'Impossible de charger les bénéficiaires');
    } finally {
      setChargement(false);
    }
  };

  // Filtrer les bénéficiaires
  useEffect(() => {
    let filtre = beneficiaires;

    if (recherche) {
      const terme = recherche.toLowerCase();
      filtre = filtre.filter(beneficiaire =>
        (beneficiaire.first_name && beneficiaire.first_name.toLowerCase().includes(terme)) ||
        (beneficiaire.last_name && beneficiaire.last_name.toLowerCase().includes(terme)) ||
        (beneficiaire.email && beneficiaire.email.toLowerCase().includes(terme)) ||
        (beneficiaire.phone && beneficiaire.phone.includes(terme)) ||
        (beneficiaire.document_number && beneficiaire.document_number.toLowerCase().includes(terme))
      );
    }

    if (filtreDocument !== 'all') {
      filtre = filtre.filter(beneficiaire => beneficiaire.document_type === filtreDocument);
    }

    if (filtreRegularite !== 'all') {
      filtre = filtre.filter(beneficiaire => 
        filtreRegularite === 'regular' ? beneficiaire.is_regular : !beneficiaire.is_regular
      );
    }

    setBeneficiairesFiltres(filtre);
    setTotalPages(Math.ceil(filtre.length / elementsParPage));
    setPageActuelle(1);
  }, [recherche, filtreDocument, filtreRegularite, beneficiaires]);

  // Pagination
  const getElementsPageActuelle = () => {
    const debut = (pageActuelle - 1) * elementsParPage;
    const fin = debut + elementsParPage;
    return beneficiairesFiltres.slice(debut, fin);
  };

  const allerPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setPageActuelle(page);
    }
  };

  // Supprimer un bénéficiaire
  const supprimerBeneficiaire = async () => {
    if (!beneficiaireSelectionne) return;
    
    setChargementAction(true);
    try {
      await AxiosInstance.delete(`/recipients/${beneficiaireSelectionne.id}/`);
      setBeneficiaires(beneficiaires.filter(b => b.id !== beneficiaireSelectionne.id));
      setShowModalSuppression(false);
      setBeneficiaireSelectionne(null);
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
      month: 'short',
      year: 'numeric'
    });
  };

  const getBadgeDocument = (type) => {
    const info = typesDocument[type] || { label: type, badge: 'ghost' };
    return <span className={`badge badge-${info.badge} gap-1`}>{info.label}</span>;
  };

  const getBadgeRegularite = (estRegulier) => {
    return estRegulier ? (
      <span className="badge badge-success gap-1">
        <CheckCircle className="w-3 h-3" />
        Régulier
      </span>
    ) : (
      <span className="badge badge-warning gap-1">
        <User className="w-3 h-3" />
        Occasionnel
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

  if (erreur) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{erreur}</p>
        <button onClick={chargerBeneficiaires} className="btn btn-primary mt-4">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Bénéficiaires
          </h1>
          <p className="text-base-content/60 mt-1">
            {beneficiairesFiltres.length} bénéficiaire{beneficiairesFiltres.length > 1 ? 's' : ''} trouvé{beneficiairesFiltres.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={chargerBeneficiaires} className="btn btn-ghost btn-sm gap-2">
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
          <Link to="/beneficiaires/ajouter" className="btn btn-primary gap-2">
            <UserPlus className="w-5 h-5" />
            Nouveau bénéficiaire
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher un bénéficiaire..."
                  className="input input-bordered w-full pl-10"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="select select-bordered"
              value={filtreDocument}
              onChange={(e) => setFiltreDocument(e.target.value)}
            >
              <option value="all">Tous les documents</option>
              <option value="cni">Carte Nationale</option>
              <option value="passport">Passeport</option>
              <option value="permis">Permis de conduire</option>
              <option value="carte_sejour">Carte de séjour</option>
              <option value="autre">Autre</option>
            </select>
            
            <select
              className="select select-bordered"
              value={filtreRegularite}
              onChange={(e) => setFiltreRegularite(e.target.value)}
            >
              <option value="all">Tous</option>
              <option value="regular">Réguliers</option>
              <option value="occasionnel">Occasionnels</option>
            </select>
            
            <button
              className="btn btn-ghost btn-sm gap-2"
              onClick={() => {
                setRecherche('');
                setFiltreDocument('all');
                setFiltreRegularite('all');
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des bénéficiaires */}
      {beneficiairesFiltres.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-xl shadow-xl">
          <Users className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <p className="text-xl text-base-content/60">Aucun bénéficiaire trouvé</p>
          <p className="text-sm text-base-content/40 mt-2">
            {recherche || filtreDocument !== 'all' || filtreRegularite !== 'all' 
              ? 'Essayez de modifier vos filtres' 
              : 'Commencez par créer un nouveau bénéficiaire'}
          </p>
          <Link to="/beneficiaires/ajouter" className="btn btn-primary mt-4">
            Créer un bénéficiaire
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-base-100 rounded-xl shadow-xl">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200">
                  <th>Bénéficiaire</th>
                  <th>Contact</th>
                  <th>Pièce d'identité</th>
                  <th>Type</th>
                  <th>Date d'ajout</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getElementsPageActuelle().map((beneficiaire) => (
                  <tr key={beneficiaire.id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">
                              {(beneficiaire.first_name || 'B').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">
                            {beneficiaire.first_name} {beneficiaire.last_name}
                          </p>
                          <p className="text-xs text-base-content/40">
                            {beneficiaire.document_number || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-base-content/40" />
                          {beneficiaire.phone || 'N/A'}
                        </div>
                        {beneficiaire.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-base-content/40" />
                            {beneficiaire.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span className="text-sm">{getBadgeDocument(beneficiaire.document_type)}</span>
                        <p className="text-xs text-base-content/40">{beneficiaire.document_number || 'N/A'}</p>
                      </div>
                    </td>
                    <td>{getBadgeRegularite(beneficiaire.is_regular)}</td>
                    <td>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-base-content/40" />
                        {formaterDate(beneficiaire.created_at)}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Link
                          to={`/beneficiaires/${beneficiaire.id}`}
                          className="btn btn-ghost btn-xs gap-1"
                          title="Voir les détails"
                        >
                          <Eye className="w-3 h-3" />
                        </Link>
                        <Link
                          to={`/beneficiaires/${beneficiaire.id}/modifier`}
                          className="btn btn-ghost btn-xs gap-1"
                          title="Modifier"
                        >
                          <Edit className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => {
                            setBeneficiaireSelectionne(beneficiaire);
                            setShowModalSuppression(true);
                          }}
                          className="btn btn-ghost btn-xs gap-1 text-error"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-base-content/60">
                Affichage de {((pageActuelle - 1) * elementsParPage) + 1} à {Math.min(pageActuelle * elementsParPage, beneficiairesFiltres.length)} sur {beneficiairesFiltres.length} bénéficiaires
              </p>
              <div className="flex gap-1">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => allerPage(pageActuelle - 1)}
                  disabled={pageActuelle === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let numPage = i + 1;
                  if (totalPages > 5 && pageActuelle > 3) {
                    numPage = pageActuelle - 2 + i;
                    if (numPage > totalPages) return null;
                  }
                  return (
                    <button
                      key={numPage}
                      className={`btn btn-sm ${pageActuelle === numPage ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => allerPage(numPage)}
                    >
                      {numPage}
                    </button>
                  );
                })}
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => allerPage(pageActuelle + 1)}
                  disabled={pageActuelle === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmation suppression */}
      {showModalSuppression && beneficiaireSelectionne && (
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
                le bénéficiaire <span className="font-bold">{beneficiaireSelectionne.first_name} {beneficiaireSelectionne.last_name}</span> ?
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

export default Beneficiaires;