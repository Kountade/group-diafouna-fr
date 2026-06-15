import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Euro, FileText, Save, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const DepotForm = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [formData, setFormData] = useState({
    partner_id: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await AxiosInstance.get('/partners/');
        setPartners(res.data || []);
      } catch (error) {
        showNotification('Erreur chargement partenaires', 'error');
      } finally {
        setLoadingPartners(false);
      }
    };
    fetchPartners();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await AxiosInstance.post('/transactions/deposit/', {
        partner_id: parseInt(formData.partner_id),
        amount: parseFloat(formData.amount),
        description: formData.description
      });
      showNotification('Dépôt enregistré avec succès', 'success');
      setTimeout(() => navigate('/depots'), 1500);
    } catch (error) {
      console.error(error);
      if (error.response?.data) {
        setErrors(error.response.data);
        const firstMsg = Object.values(error.response.data)[0];
        showNotification(firstMsg?.[0] || 'Erreur lors du dépôt', 'error');
      } else {
        showNotification('Erreur réseau', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingPartners) {
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
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/depots')} className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-base-content">Nouveau dépôt</h1>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <form onSubmit={handleSubmit} className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Partenaire *</span></label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                  <select
                    name="partner_id"
                    value={formData.partner_id}
                    onChange={handleChange}
                    className={`select select-bordered w-full pl-11 ${errors.partner_id ? 'select-error' : ''}`}
                    required
                  >
                    <option value="">Sélectionner un partenaire</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {errors.partner_id && <span className="text-error text-sm mt-1">{errors.partner_id}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Montant (€) *</span></label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-11 ${errors.amount ? 'input-error' : ''}`}
                    placeholder="0.00"
                    required
                  />
                </div>
                {errors.amount && <span className="text-error text-sm mt-1">{errors.amount}</span>}
              </div>

              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text font-medium">Description (optionnel)</span></label>
                <div className="relative">
                  <FileText className="absolute left-3 top-4 w-5 h-5 text-base-content/40" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="textarea textarea-bordered w-full pl-11"
                    rows="3"
                    placeholder="Motif du dépôt, référence..."
                  />
                </div>
                {errors.description && <span className="text-error text-sm mt-1">{errors.description}</span>}
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button type="button" onClick={() => navigate('/depots')} className="btn btn-outline">Annuler</button>
              <button type="submit" disabled={loading} className="btn btn-primary gap-2">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <Save className="w-5 h-5" /> Enregistrer
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

export default DepotForm;