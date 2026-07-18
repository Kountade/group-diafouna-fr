import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, Mail, FileText, MapPin,
  Loader2, AlertCircle, CheckCircle, Search,
  Users, CreditCard, DollarSign, UserPlus, Shield
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const RetraitAvecBeneficiaire = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [partners, setPartners] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [searchRecipient, setSearchRecipient] = useState('');

  const [formData, setFormData] = useState({
    partner_id: '',
    amount: '',
    description: '',
    use_existing_recipient: true,
    recipient_id: '',
    recipient_first_name: '',
    recipient_last_name: '',
    recipient_phone: '',
    recipient_email: '',
    recipient_document_type: 'cni',
    recipient_document_number: '',
    recipient_address: ''
  });

  const MAX_DISPLAY = 20;

  useEffect(() => {
    fetchPartners();
    fetchRecipients();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await AxiosInstance.get('/partners/');
      setPartners(response.data);
    } catch (err) {
      console.error('Erreur chargement partenaires:', err);
    }
  };

  const fetchRecipients = async () => {
    setLoadingRecipients(true);
    try {
      const response = await AxiosInstance.get('/recipients/');
      setRecipients(response.data);
    } catch (err) {
      console.error('Erreur chargement bénéficiaires:', err);
      setError('Impossible de charger la liste des bénéficiaires');
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const dataToSend = {
        partner_id: parseInt(formData.partner_id),
        amount: parseFloat(formData.amount),
        description: formData.description || 'Retrait partenaire'
      };

      if (formData.use_existing_recipient && formData.recipient_id) {
        dataToSend.recipient_id = parseInt(formData.recipient_id);
      } else {
        dataToSend.recipient_first_name = formData.recipient_first_name;
        dataToSend.recipient_last_name = formData.recipient_last_name;
        dataToSend.recipient_phone = formData.recipient_phone;
        dataToSend.recipient_email = formData.recipient_email;
        dataToSend.recipient_document_type = formData.recipient_document_type;
        dataToSend.recipient_document_number = formData.recipient_document_number;
        dataToSend.recipient_address = formData.recipient_address;
      }

      await AxiosInstance.post('/transactions/withdraw/', dataToSend);
      setSuccess(true);
      setTimeout(() => {
        navigate('/transactions');
      }, 2000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors du retrait');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipients = recipients.filter(r => {
    const search = searchRecipient.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(search) ||
      r.phone?.includes(searchRecipient) ||
      r.document_number?.toLowerCase().includes(search)
    );
  });

  const displayedRecipients = filteredRecipients.slice(0, MAX_DISPLAY);
  const hasMore = filteredRecipients.length > MAX_DISPLAY;
  const selectedRecipient = recipients.find(r => r.id === parseInt(formData.recipient_id));
  const selectedPartner = partners.find(p => p.id === parseInt(formData.partner_id));

  return (
    <div className="w-full px-4 py-6">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary" />
          Retrait Partenaire
        </h1>
      </div>

      {success && (
        <div className="alert alert-success mb-6 shadow-lg">
          <CheckCircle className="w-6 h-6" />
          <span>Retrait effectué avec succès !</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-6 shadow-lg">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Ligne 1 : Partenaire + Montant + Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Partenaire */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Partenaire *
                  </span>
                </label>
                <select
                  name="partner_id"
                  className="select select-bordered w-full"
                  value={formData.partner_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un partenaire...</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} - {partner.email}
                    </option>
                  ))}
                </select>
                {selectedPartner && (
                  <div className="mt-2 text-sm text-base-content/60 flex flex-wrap gap-3">
                    <span>📧 {selectedPartner.email}</span>
                    <span>📞 {selectedPartner.phone || 'Non renseigné'}</span>
                  </div>
                )}
              </div>

              {/* Montant */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Montant (XOF) *
                  </span>
                </label>
                <input
                  type="number"
                  name="amount"
                  className="input input-bordered w-full"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <input
                  type="text"
                  name="description"
                  className="input input-bordered w-full"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Motif du retrait..."
                />
              </div>
            </div>

            <div className="divider text-base-content/40">BÉNÉFICIAIRE DU RETRAIT</div>

            {/* Option : bénéficiaire existant ou nouveau */}
            <div className="form-control mb-4">
              <div className="flex flex-wrap gap-4">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="use_existing_recipient"
                    value={true}
                    checked={formData.use_existing_recipient === true}
                    onChange={() => setFormData(prev => ({ ...prev, use_existing_recipient: true, recipient_id: '' }))}
                    className="radio radio-primary"
                  />
                  <span className="label-text">Bénéficiaire existant</span>
                </label>
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="use_existing_recipient"
                    value={false}
                    checked={formData.use_existing_recipient === false}
                    onChange={() => setFormData(prev => ({ ...prev, use_existing_recipient: false }))}
                    className="radio radio-primary"
                  />
                  <span className="label-text">Nouveau bénéficiaire</span>
                </label>
              </div>
            </div>

            {formData.use_existing_recipient ? (
              // Sélection d'un bénéficiaire existant
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      Rechercher
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nom, téléphone ou pièce..."
                    className="input input-bordered w-full"
                    value={searchRecipient}
                    onChange={(e) => setSearchRecipient(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Sélectionner un bénéficiaire
                    </span>
                  </label>
                  {loadingRecipients ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm text-base-content/60">Chargement...</span>
                    </div>
                  ) : (
                    <>
                      <select
                        name="recipient_id"
                        className="select select-bordered w-full"
                        value={formData.recipient_id}
                        onChange={handleChange}
                      >
                        <option value="">Choisir un bénéficiaire...</option>
                        {displayedRecipients.map((recipient) => (
                          <option key={recipient.id} value={recipient.id}>
                            {recipient.full_name} - {recipient.phone} ({recipient.document_number})
                          </option>
                        ))}
                      </select>
                      {hasMore && (
                        <p className="text-xs text-base-content/40 mt-1">
                          {filteredRecipients.length} bénéficiaires trouvés, affichage des {MAX_DISPLAY} premiers.
                        </p>
                      )}
                      {filteredRecipients.length === 0 && searchRecipient && (
                        <div className="text-center py-2 text-base-content/60">
                          <p>Aucun bénéficiaire trouvé.</p>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm mt-2 gap-2"
                            onClick={() => setFormData(prev => ({ ...prev, use_existing_recipient: false }))}
                          >
                            <UserPlus className="w-4 h-4" />
                            Créer un nouveau
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {/* Affichage du bénéficiaire sélectionné s'il n'est pas dans la liste */}
                {formData.recipient_id && selectedRecipient && !displayedRecipients.some(r => r.id === parseInt(formData.recipient_id)) && (
                  <div className="lg:col-span-2 mt-2 p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-sm font-medium">Bénéficiaire sélectionné :</p>
                    <p className="text-sm">{selectedRecipient.full_name} - {selectedRecipient.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              // Création d'un nouveau bénéficiaire (grille plus large)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Prénom *
                    </span>
                  </label>
                  <input
                    type="text"
                    name="recipient_first_name"
                    className="input input-bordered w-full"
                    value={formData.recipient_first_name}
                    onChange={handleChange}
                    required={!formData.use_existing_recipient}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Nom *
                    </span>
                  </label>
                  <input
                    type="text"
                    name="recipient_last_name"
                    className="input input-bordered w-full"
                    value={formData.recipient_last_name}
                    onChange={handleChange}
                    required={!formData.use_existing_recipient}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Téléphone *
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="recipient_phone"
                    className="input input-bordered w-full"
                    value={formData.recipient_phone}
                    onChange={handleChange}
                    required={!formData.use_existing_recipient}
                    placeholder="+224 XX XXX XX XX"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email
                    </span>
                  </label>
                  <input
                    type="email"
                    name="recipient_email"
                    className="input input-bordered w-full"
                    value={formData.recipient_email}
                    onChange={handleChange}
                    placeholder="email@exemple.com"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Type de pièce
                    </span>
                  </label>
                  <select
                    name="recipient_document_type"
                    className="select select-bordered w-full"
                    value={formData.recipient_document_type}
                    onChange={handleChange}
                  >
                    <option value="cni">Carte Nationale d'Identité</option>
                    <option value="passport">Passeport</option>
                    <option value="permis">Permis de Conduire</option>
                    <option value="carte_sejour">Carte de Séjour</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Numéro de pièce *
                    </span>
                  </label>
                  <input
                    type="text"
                    name="recipient_document_number"
                    className="input input-bordered w-full"
                    value={formData.recipient_document_number}
                    onChange={handleChange}
                    required={!formData.use_existing_recipient}
                    placeholder="Numéro de la pièce"
                  />
                </div>

                <div className="form-control lg:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Adresse
                    </span>
                  </label>
                  <textarea
                    name="recipient_address"
                    className="textarea textarea-bordered w-full"
                    value={formData.recipient_address}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Adresse du bénéficiaire"
                  />
                </div>
              </div>
            )}

            {/* Résumé */}
            <div className="bg-base-200 p-4 rounded-lg mt-4">
              <p className="font-semibold mb-2">Résumé du retrait</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Partenaire</span>
                  <span className="font-medium">{selectedPartner?.name || 'Non sélectionné'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Montant</span>
                  <span className="font-bold text-primary">
                    {formData.amount ? new Intl.NumberFormat('fr-FR').format(parseFloat(formData.amount)) : '0'} XOF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Bénéficiaire</span>
                  <span className="font-medium">
                    {formData.use_existing_recipient && formData.recipient_id 
                      ? selectedRecipient?.full_name || 'Sélectionné'
                      : formData.recipient_first_name && formData.recipient_last_name 
                        ? `${formData.recipient_first_name} ${formData.recipient_last_name}`
                        : 'À renseigner'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn flex-1"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Effectuer le retrait
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RetraitAvecBeneficiaire;