import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, AlertCircle, User, Mail, Phone,
  FileText, MapPin, CheckCircle, UserCheck, Users
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const BeneficiaireForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(false);
  const [chargementDonnees, setChargementDonnees] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_type: 'cni',
    document_number: '',
    address: '',
    is_regular: true,
    notes: ''
  });
  const [estModification, setEstModification] = useState(false);

  // Types de documents
  const typesDocument = [
    { value: 'cni', label: 'Carte Nationale d\'Identité' },
    { value: 'passport', label: 'Passeport' },
    { value: 'permis', label: 'Permis de Conduire' },
    { value: 'carte_sejour', label: 'Carte de Séjour' },
    { value: 'autre', label: 'Autre' }
  ];

  useEffect(() => {
    if (id) {
      setEstModification(true);
      chargerBeneficiaire(id);
    }
  }, [id]);

  const chargerBeneficiaire = async (beneficiaireId) => {
    setChargementDonnees(true);
    setErreur(null);
    try {
      const response = await AxiosInstance.get(`/recipients/${beneficiaireId}/`);
      const data = response.data;
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        document_type: data.document_type || 'cni',
        document_number: data.document_number || '',
        address: data.address || '',
        is_regular: data.is_regular !== undefined ? data.is_regular : true,
        notes: data.notes || ''
      });
    } catch (err) {
      console.error('Erreur:', err);
      setErreur(err.response?.data?.error || 'Impossible de charger le bénéficiaire');
    } finally {
      setChargementDonnees(false);
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
    setChargement(true);
    setErreur(null);

    try {
      if (estModification) {
        await AxiosInstance.put(`/recipients/${id}/`, formData);
      } else {
        await AxiosInstance.post('/recipients/', formData);
      }
      navigate('/beneficiaires');
    } catch (err) {
      console.error('Erreur:', err);
      const message = err.response?.data?.error || err.response?.data?.detail || 
                     'Une erreur est survenue lors de l\'enregistrement';
      setErreur(message);
    } finally {
      setChargement(false);
    }
  };

  if (chargementDonnees) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (erreur && !formData.first_name) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{erreur}</p>
        <Link to="/beneficiaires" className="btn btn-primary mt-4">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/beneficiaires" className="btn btn-ghost btn-circle">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-base-content">
          {estModification ? 'Modifier le bénéficiaire' : 'Nouveau bénéficiaire'}
        </h1>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {erreur && (
              <div className="alert alert-error mb-4">
                <AlertCircle className="w-6 h-6" />
                <span>{erreur}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prénom */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Prénom <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    name="first_name"
                    className="input input-bordered w-full pl-10"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Prénom"
                  />
                </div>
              </div>

              {/* Nom */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nom <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    name="last_name"
                    className="input input-bordered w-full pl-10"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Nom"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Téléphone <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="tel"
                    name="phone"
                    className="input input-bordered w-full pl-10"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+224 66 123 45 67"
                  />
                </div>
              </div>

              {/* Type de document */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Type de pièce <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <FileText className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <select
                    name="document_type"
                    className="select select-bordered w-full pl-10"
                    value={formData.document_type}
                    onChange={handleChange}
                    required
                  >
                    {typesDocument.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Numéro de document */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Numéro de pièce <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <FileText className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    name="document_number"
                    className="input input-bordered w-full pl-10"
                    value={formData.document_number}
                    onChange={handleChange}
                    required
                    placeholder="Numéro de la pièce"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Adresse</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
                  <textarea
                    name="address"
                    className="textarea textarea-bordered w-full pl-10 min-h-[80px]"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Notes</span>
                </label>
                <div className="relative">
                  <textarea
                    name="notes"
                    className="textarea textarea-bordered w-full min-h-[80px]"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Informations complémentaires..."
                  />
                </div>
              </div>

              {/* Régularité */}
              <div className="form-control md:col-span-2">
                <label className="label cursor-pointer justify-start gap-4">
                  <span className="label-text font-medium">Client régulier</span>
                  <input
                    type="checkbox"
                    name="is_regular"
                    className="checkbox checkbox-primary"
                    checked={formData.is_regular}
                    onChange={handleChange}
                  />
                  <span className="label-text text-sm text-base-content/60">
                    {formData.is_regular ? 'Oui' : 'Non'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-base-200">
              <button
                type="submit"
                className="btn btn-primary flex-1 gap-2"
                disabled={chargement}
              >
                {chargement ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {estModification ? 'Mettre à jour' : 'Créer le bénéficiaire'}
                  </>
                )}
              </button>
              <Link to="/beneficiaires" className="btn btn-ghost">
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaireForm;