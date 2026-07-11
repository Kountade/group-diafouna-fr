// pages/finance/TransfertEntreAgents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, DollarSign, Send, Loader2,
  AlertCircle, CheckCircle, Search, User, Mail,
  Phone, Wallet, RefreshCw, ArrowRight, UserCheck,
  UserX, Clock, Calendar, CreditCard, Shield, Repeat
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const TransfertEntreAgents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [searchAgent, setSearchAgent] = useState('');
  const [transactionResult, setTransactionResult] = useState(null);
  
  // Récupérer l'agent connecté
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAgentBalance, setCurrentAgentBalance] = useState(0);

  const [formData, setFormData] = useState({
    agent_destinataire_id: '',
    amount: '',
    description: '',
    motif: 'transfert_entre_agents'
  });

  // Motifs de transfert
  const MOTIFS = [
    { value: 'transfert_entre_agents', label: 'Transfert entre agents' },
    { value: 'remboursement', label: 'Remboursement' },
    { value: 'avance', label: 'Avance sur commission' },
    { value: 'partage_commission', label: 'Partage de commission' },
    { value: 'autre', label: 'Autre motif' }
  ];

  // Charger les données initiales
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filtrer les agents
  useEffect(() => {
    let filtered = agents;
    
    // Filtrer par recherche
    if (searchAgent) {
      const term = searchAgent.toLowerCase();
      filtered = filtered.filter(agent =>
        (agent.full_name?.toLowerCase() || '').includes(term) ||
        (agent.email?.toLowerCase() || '').includes(term) ||
        (agent.phone_number || '').includes(searchAgent) ||
        (agent.username?.toLowerCase() || '').includes(term)
      );
    }
    
    // Exclure l'agent connecté
    if (currentUser?.id) {
      filtered = filtered.filter(agent => agent.id !== currentUser.id);
    }
    
    setFilteredAgents(filtered);
  }, [searchAgent, agents, currentUser]);

  const fetchInitialData = async () => {
    setLoadingData(true);
    setError(null);
    try {
      // Récupérer l'utilisateur connecté
      const userData = JSON.parse(localStorage.getItem('User') || '{}');
      setCurrentUser(userData);

      console.log('🔄 Chargement des agents...');
      
      // Récupérer la liste des agents avec leurs soldes
      const agentsRes = await AxiosInstance.get('/agents-balance/');
      console.log('✅ Agents chargés:', agentsRes.data);
      setAgents(agentsRes.data);
      
      // Exclure l'agent connecté
      const filtered = agentsRes.data.filter(agent => agent.id !== userData.id);
      setFilteredAgents(filtered);

      // Récupérer le solde de l'agent connecté
      try {
        console.log('🔄 Chargement du solde...');
        const balanceRes = await AxiosInstance.get('/transactions/agent-balance/');
        console.log('✅ Solde chargé:', balanceRes.data);
        setCurrentAgentBalance(balanceRes.data.balance || 0);
      } catch (err) {
        console.error('❌ Erreur chargement solde:', err);
        // Ne pas bloquer si le solde n'est pas disponible
      }

    } catch (err) {
      console.error('❌ Erreur chargement données:', err);
      console.error('Détails:', err.response?.data);
      setError(err.response?.data?.error || 'Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTransactionResult(null);

    try {
      // Validation
      if (!formData.agent_destinataire_id) {
        setError('Veuillez sélectionner un agent destinataire');
        setLoading(false);
        return;
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError('Veuillez saisir un montant valide');
        setLoading(false);
        return;
      }

      const amountValue = parseFloat(formData.amount);
      if (amountValue > currentAgentBalance) {
        setError(`Solde insuffisant. Solde actuel: ${currentAgentBalance} XOF`);
        setLoading(false);
        return;
      }

      // Construire les données à envoyer
      const dataToSend = {
        agent_destinataire_id: parseInt(formData.agent_destinataire_id),
        amount: amountValue,
        description: formData.description || `Transfert ${formData.motif}`,
        motif: formData.motif
      };

      console.log('📤 Envoi du transfert:', dataToSend);
      
      // Appel API pour le transfert entre agents
      const response = await AxiosInstance.post('/transactions/transfer_between_agents/', dataToSend);
      console.log('✅ Réponse:', response.data);
      
      setTransactionResult(response.data);
      setSuccess(true);
      
      // Mettre à jour le solde local
      setCurrentAgentBalance(prev => prev - amountValue);
      
      // Réinitialiser le formulaire après succès
      setTimeout(() => {
        setFormData({
          agent_destinataire_id: '',
          amount: '',
          description: '',
          motif: 'transfert_entre_agents'
        });
        setSearchAgent('');
        setTransactionResult(null);
        // Rafraîchir la liste des agents pour mettre à jour les soldes
        fetchInitialData();
      }, 3000);

    } catch (err) {
      console.error('❌ Erreur transfert:', err);
      console.error('Détails:', err.response?.data);
      setError(err.response?.data?.error || 'Erreur lors du transfert');
    } finally {
      setLoading(false);
    }
  };

  const selectedAgent = agents.find(a => a.id === parseInt(formData.agent_destinataire_id));
  const selectedMotif = MOTIFS.find(m => m.value === formData.motif);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Repeat className="w-8 h-8 text-primary" />
            Transfert entre Agents
          </h1>
        </div>
        <button onClick={fetchInitialData} className="btn btn-ghost btn-sm gap-2">
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      {/* Solde actuel */}
      <div className="card bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-xl mb-6">
        <div className="card-body py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-80">Votre solde disponible</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR').format(currentAgentBalance)} XOF
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <User className="w-4 h-4" />
              <span>{currentUser?.email || 'Agent'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && transactionResult && (
        <div className="alert alert-success mb-6 shadow-lg">
          <CheckCircle className="w-6 h-6" />
          <div>
            <span className="font-bold">✅ Transfert effectué avec succès !</span>
            <div className="text-sm mt-1">
              <p>Transaction #{transactionResult.transaction_id}</p>
              <p>Montant: {new Intl.NumberFormat('fr-FR').format(transactionResult.amount)} XOF</p>
              <p>Destinataire: {transactionResult.destinataire_name}</p>
              <p>Nouveau solde: {new Intl.NumberFormat('fr-FR').format(transactionResult.new_balance)} XOF</p>
            </div>
          </div>
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
            {/* ============================================================ */}
            {/* 1. SELECTION DE L'AGENT DESTINATAIRE */}
            {/* ============================================================ */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  Agent destinataire *
                </span>
              </label>
              
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  placeholder="🔍 Rechercher un agent par nom, email ou téléphone..."
                  className="input input-bordered w-full pl-10"
                  value={searchAgent}
                  onChange={(e) => setSearchAgent(e.target.value)}
                />
                {searchAgent && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                    onClick={() => setSearchAgent('')}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <p className="text-xs text-base-content/40 mt-1">
                {filteredAgents.length} agent{filteredAgents.length > 1 ? 's' : ''} disponible{filteredAgents.length > 1 ? 's' : ''}
              </p>

              {/* Liste des agents */}
              <div className="mt-2 max-h-60 overflow-y-auto border border-base-200 rounded-lg">
                {filteredAgents.length === 0 ? (
                  <div className="p-6 text-center text-base-content/40">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>
                      {searchAgent 
                        ? 'Aucun agent trouvé pour cette recherche' 
                        : 'Aucun autre agent disponible'}
                    </p>
                    {!searchAgent && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm mt-2"
                        onClick={fetchInitialData}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Rafraîchir
                      </button>
                    )}
                  </div>
                ) : (
                  filteredAgents.map((agent) => {
                    const isSelected = parseInt(formData.agent_destinataire_id) === agent.id;
                    return (
                      <label
                        key={agent.id}
                        className={`
                          flex items-start gap-3 p-3 cursor-pointer hover:bg-primary/5 transition-all
                          ${isSelected ? 'bg-primary/10 border-l-4 border-primary' : 'border-l-4 border-transparent'}
                        `}
                      >
                        <input
                          type="radio"
                          name="agent_destinataire_id"
                          value={agent.id}
                          checked={isSelected}
                          onChange={handleChange}
                          className="radio radio-primary mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-base-content">
                              {agent.full_name || agent.username || agent.email}
                            </p>
                            <span className={`badge ${agent.is_active ? 'badge-success' : 'badge-error'} badge-sm`}>
                              {agent.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {agent.email}
                            </span>
                            {agent.phone_number && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {agent.phone_number}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-primary">
                              Solde: {new Intl.NumberFormat('fr-FR').format(agent.balance)} XOF
                            </span>
                            {agent.is_online && (
                              <span className="badge badge-success badge-xs gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                En ligne
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {selectedAgent && (
                <div className="mt-2 p-3 bg-success/10 border border-success/30 rounded-lg text-sm">
                  <p className="font-medium text-success">✅ Agent sélectionné</p>
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {selectedAgent.full_name || selectedAgent.email}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-base-content/60">
                    <Wallet className="w-3 h-3" />
                    Solde: {new Intl.NumberFormat('fr-FR').format(selectedAgent.balance)} XOF
                  </p>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* 2. MONTANT */}
            {/* ============================================================ */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Montant à transférer (XOF) *
                </span>
              </label>
              <input
                type="number"
                name="amount"
                className="input input-bordered w-full text-lg"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
              />
              {formData.amount && parseFloat(formData.amount) > currentAgentBalance && (
                <p className="text-error text-sm mt-1">
                  ⚠️ Montant supérieur à votre solde disponible ({currentAgentBalance} XOF)
                </p>
              )}
            </div>

            {/* ============================================================ */}
            {/* 3. MOTIF DU TRANSFERT */}
            {/* ============================================================ */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-primary" />
                  Motif du transfert
                </span>
              </label>
              <select
                name="motif"
                className="select select-bordered w-full"
                value={formData.motif}
                onChange={handleChange}
              >
                {MOTIFS.map((motif) => (
                  <option key={motif.value} value={motif.value}>
                    {motif.label}
                  </option>
                ))}
              </select>
              {selectedMotif && (
                <p className="text-xs text-base-content/40 mt-1">
                  Motif sélectionné: {selectedMotif.label}
                </p>
              )}
            </div>

            {/* ============================================================ */}
            {/* 4. DESCRIPTION */}
            {/* ============================================================ */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-lg">Description (optionnel)</span>
              </label>
              <textarea
                name="description"
                className="textarea textarea-bordered w-full"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                placeholder="Précisez le motif du transfert..."
              />
            </div>

            {/* ============================================================ */}
            {/* 5. RÉSUMÉ ET VALIDATION */}
            {/* ============================================================ */}
            <div className="bg-base-200 p-4 rounded-lg mt-6">
              <p className="font-semibold text-lg mb-3">📋 Résumé du transfert</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">De</span>
                  <span className="font-medium">{currentUser?.email || 'Vous'}</span>
                </div>
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">Vers</span>
                  <span className="font-medium">{selectedAgent?.full_name || selectedAgent?.email || '❌ Non sélectionné'}</span>
                </div>
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">Montant</span>
                  <span className="font-bold text-primary text-lg">
                    {formData.amount ? new Intl.NumberFormat('fr-FR').format(parseFloat(formData.amount)) : '0'} XOF
                  </span>
                </div>
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">Motif</span>
                  <span className="font-medium">{selectedMotif?.label || 'Non spécifié'}</span>
                </div>
                {formData.description && (
                  <div className="flex justify-between border-b border-base-300 pb-2">
                    <span className="text-base-content/60">Description</span>
                    <span className="font-medium">{formData.description}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-base-content/60">Nouveau solde (vous)</span>
                  <span className="font-bold text-success">
                    {formData.amount ? new Intl.NumberFormat('fr-FR').format(currentAgentBalance - parseFloat(formData.amount)) : new Intl.NumberFormat('fr-FR').format(currentAgentBalance)} XOF
                  </span>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn flex-1 min-w-[120px]"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 min-w-[120px] gap-2"
                disabled={
                  loading || 
                  !formData.agent_destinataire_id || 
                  !formData.amount ||
                  parseFloat(formData.amount) > currentAgentBalance ||
                  parseFloat(formData.amount) <= 0
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Effectuer le transfert
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Historique rapide des derniers transferts */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Derniers transferts reçus
        </h3>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-4">
            <p className="text-sm text-base-content/40 text-center">
              ⏳ Aucun transfert récent pour le moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransfertEntreAgents;