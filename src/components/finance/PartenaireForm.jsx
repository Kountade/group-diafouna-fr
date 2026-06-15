import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Save, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const PartenaireForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // présent si édition
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchPartner = async () => {
        try {
          const response = await AxiosInstance.get(`/finance/partners/${id}/`);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await AxiosInstance.put(`/finance/partners/${id}/`, formData);
        showNotification('Partenaire modifié avec succès', 'success');
      } else {
        await AxiosInstance.post('/finance/partners/', formData);
        showNotification('Partenaire créé avec succès', 'success');
      }
      setTimeout(() => navigate('/partenaires'), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.email?.[0] || error.response?.data?.name?.[0] || 'Erreur lors de l\'enregistrement';
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-8 py-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-base`}>
            {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span className="text-base">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/partenaires')} className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Modifier le partenaire' : 'Nouveau partenaire'}
          </h1>
        </div>

        {/* Formulaire */}
        <div className="card bg-base-100 shadow-xl">
          <form onSubmit={handleSubmit} className="card-body">
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
                  className="input input-bordered w-full pl-11 py-3 text-base"
                  placeholder="Nom du partenaire"
                  required
                />
              </div>
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
                  className="input input-bordered w-full pl-11 py-3 text-base"
                  placeholder="contact@partenaire.com"
                  required
                />
              </div>
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
                  className="input input-bordered w-full pl-11 py-3 text-base"
                  placeholder="+225 XX XX XX XX"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-medium">Adresse</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full pl-11 py-3 text-base"
                  rows="3"
                  placeholder="Adresse complète"
                />
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button
                type="button"
                onClick={() => navigate('/partenaires')}
                className="btn btn-outline text-base"
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
    </div>
  );
};

export default PartenaireForm;