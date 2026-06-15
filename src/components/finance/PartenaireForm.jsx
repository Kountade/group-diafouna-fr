import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Save, ArrowLeft, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const PartenaireForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchPartner = async () => {
        try {
          const response = await AxiosInstance.get(`/partners/${id}/`);
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || ''
          });
        } catch (error) {
          console.error(error);
          showNotification('Erreur lors du chargement du partenaire', 'error');
          navigate('/partenaires');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchPartner();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      if (isEditMode) {
        await AxiosInstance.put(`/partners/${id}/`, formData);
      } else {
        await AxiosInstance.post('/partners/', formData);
      }
      showNotification(isEditMode ? 'Partenaire modifié avec succès' : 'Partenaire créé avec succès', 'success');
      setTimeout(() => navigate('/partenaires'), 1500);
    } catch (error) {
      console.error('Erreur détaillée:', error.response?.data);
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          setErrors(backendErrors);
          const firstErrorMessage = Object.values(backendErrors)[0];
          const errorMsg = Array.isArray(firstErrorMessage) ? firstErrorMessage[0] : firstErrorMessage;
          showNotification(errorMsg || 'Erreur de validation', 'error');
        } else {
          showNotification(backendErrors.message || 'Erreur lors de l\'enregistrement', 'error');
        }
      } else if (error.request) {
        showNotification('Impossible de contacter le serveur. Vérifiez votre connexion.', 'error');
      } else {
        showNotification('Erreur inattendue. Réessayez.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-base`}>
            {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span className="text-base">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      <div className="w-full">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/partenaires')} className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-base-content">
            {isEditMode ? 'Modifier le partenaire' : 'Nouveau partenaire'}
          </h1>
        </div>

        {/* Formulaire en pleine largeur avec grille responsive */}
        <div className="card bg-base-100 shadow-xl">
          <form onSubmit={handleSubmit} className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Nom / Raison sociale *</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-11 py-3 text-base ${errors.name ? 'input-error' : ''}`}
                    placeholder="Nom du partenaire"
                    required
                  />
                </div>
                {errors.name && <span className="text-error text-sm mt-1">{errors.name}</span>}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Email *</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-11 py-3 text-base ${errors.email ? 'input-error' : ''}`}
                    placeholder="contact@partenaire.com"
                    required
                  />
                </div>
                {errors.email && <span className="text-error text-sm mt-1">{errors.email}</span>}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Téléphone</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-11 py-3 text-base ${errors.phone ? 'input-error' : ''}`}
                    placeholder="+225 XX XX XX XX"
                  />
                </div>
                {errors.phone && <span className="text-error text-sm mt-1">{errors.phone}</span>}
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text text-base font-medium">Adresse</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`textarea textarea-bordered w-full pl-11 py-3 text-base ${errors.address ? 'textarea-error' : ''}`}
                    rows="3"
                    placeholder="Adresse complète"
                  />
                </div>
                {errors.address && <span className="text-error text-sm mt-1">{errors.address}</span>}
              </div>
            </div>

            {errors.non_field_errors && (
              <div className="alert alert-error mt-4">
                <AlertCircle className="w-5 h-5" />
                <span>{errors.non_field_errors}</span>
              </div>
            )}

            <div className="card-actions justify-end mt-6">
              <button
                type="button"
                onClick={() => navigate('/partenaires')}
                className="btn btn-outline text-base"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary gap-2 text-base"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <Save className="w-5 h-5" />
                {isEditMode ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default PartenaireForm;