// pages/agents/AgentTransfer.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign, Users, Send, Loader2, AlertCircle,
  CheckCircle, ArrowLeft, User, CreditCard, Wallet
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const AgentTransfer = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [globalBalance, setGlobalBalance] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingAgents(true);
    try {
      // Récupérer la liste des agents
      const agentsRes = await AxiosInstance.get('/agents-balance/');
      setAgents(agentsRes.data);

      // Récupérer le solde global
      try {
        const globalRes = await AxiosInstance.get('/accounts/global/');
        setGlobalBalance(globalRes.data.balance);
      } catch (err) {
        console.error('Erreur chargement solde global:', err);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger la liste des agents');
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const amountValue = parseFloat(amount);
    if (amountValue <= 0) {
      setError('Le montant doit être supérieur à 0');
      setLoading(false);
      return;
    }

    if (globalBalance !== null && amountValue > globalBalance) {
      setError(`Solde global insuffisant (${globalBalance} XOF disponible)`);
      setLoading(false);
      return;
    }

    try {
      const response = await AxiosInstance.post('/transactions/transfer_to_agent/', {
        agent_id: parseInt(selectedAgent),
        amount: amountValue,
        description: description || 'Transfert vers agent'
      });

      setMessage(`✅ Transfert de ${formatNumber(amountValue)} XOF effectué avec succès !`);
      setAmount('');
      setDescription('');
      setSelectedAgent('');
      
      // Rafraîchir les données
      fetchData();
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/agents');
      }, 2000);
    } catch (err) {
      console.error('Erreur transfert:', err);
      setError(err.response?.data?.error || 'Erreur lors du transfert');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const getSelectedAgentBalance = () => {
    const agent = agents.find(a => a.id === parseInt(selectedAgent));
    return agent ? agent.balance : 0;
  };

  if (loadingAgents) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/agents')} className="btn btn-ghost btn-circle">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
          <Send className="w-8 h-8 text-primary" />
          Transfert vers Agent
        </h1>
      </div>

      {/* Message de succès */}
      {message && (
        <div className="alert alert-success mb-6 shadow-lg">
          <CheckCircle className="w-6 h-6" />
          <span>{message}</span>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-error mb-6 shadow-lg">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      )}

      {/* Solde global */}
      {globalBalance !== null && (
        <div className="card bg-base-200 shadow-md mb-6">
          <div className="card-body py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="font-medium">Solde Global disponible</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {formatNumber(globalBalance)} XOF
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de transfert */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleTransfer} className="space-y-4">
            {/* Sélection de l'agent */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Sélectionner un Agent
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                required
              >
                <option value="">Choisir un agent...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name || agent.email} - Solde: {formatNumber(agent.balance)} XOF
                  </option>
                ))}
              </select>
              {selectedAgent && (
                <p className="text-sm text-base-content/60 mt-1">
                  Solde actuel de l'agent: <span className="font-bold text-primary">{formatNumber(getSelectedAgentBalance())} XOF</span>
                </p>
              )}
            </div>

            {/* Montant */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Montant à transférer (XOF)
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
              />
              {globalBalance !== null && parseFloat(amount) > globalBalance && (
                <p className="text-error text-sm mt-1">
                  ⚠️ Montant supérieur au solde global disponible
                </p>
              )}
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Description (optionnel)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Motif du transfert..."
              />
            </div>

            {/* Résumé */}
            {selectedAgent && amount && parseFloat(amount) > 0 && (
              <div className="bg-base-200 p-4 rounded-lg space-y-2">
                <p className="font-semibold">Résumé du transfert</p>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Agent</span>
                  <span className="font-medium">
                    {agents.find(a => a.id === parseInt(selectedAgent))?.full_name || 
                     agents.find(a => a.id === parseInt(selectedAgent))?.email}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Montant</span>
                  <span className="font-bold text-primary">{formatNumber(parseFloat(amount))} XOF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Nouveau solde agent</span>
                  <span className="font-medium text-success">
                    {formatNumber(getSelectedAgentBalance() + parseFloat(amount))} XOF
                  </span>
                </div>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="btn btn-primary w-full gap-2"
              disabled={loading || !selectedAgent || !amount}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Transfert en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Effectuer le Transfert
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Liste des agents */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Liste des Agents
        </h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200">
                <th>Agent</th>
                <th>Email</th>
                <th>Solde</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-base-content/60 py-8">
                    Aucun agent disponible
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="font-medium">
                      {agent.full_name || agent.email}
                    </td>
                    <td>{agent.email}</td>
                    <td className="font-bold text-primary">
                      {formatNumber(agent.balance)} XOF
                    </td>
                    <td>
                      <span className={`badge ${agent.is_active ? 'badge-success' : 'badge-error'}`}>
                        {agent.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm gap-1"
                        onClick={() => {
                          setSelectedAgent(agent.id.toString());
                          document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Send className="w-4 h-4" />
                        Transférer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentTransfer;