// pages/agents/AgentBalanceList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Loader2, AlertCircle, Eye,
  UserCheck, UserX, Calendar, DollarSign, Mail, Phone
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const AgentBalanceList = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get('/agents-balance/');
      setAgents(response.data);
      setFilteredAgents(response.data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Impossible de charger la liste des agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = agents.filter(agent =>
      agent.email.toLowerCase().includes(term) ||
      (agent.full_name && agent.full_name.toLowerCase().includes(term)) ||
      (agent.username && agent.username.toLowerCase().includes(term))
    );
    setFilteredAgents(filtered);
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (isActive, isOnline) => {
    if (isActive && isOnline) {
      return <span className="badge badge-success gap-1"><span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> En ligne</span>;
    }
    if (isActive) {
      return <span className="badge badge-info">Actif</span>;
    }
    return <span className="badge badge-error">Inactif</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl text-base-content/70">{error}</p>
        <button onClick={fetchAgents} className="btn btn-primary mt-4">
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
            Agents
          </h1>
          <p className="text-base-content/60 mt-1">
            {filteredAgents.length} agent{filteredAgents.length > 1 ? 's' : ''} trouvé{filteredAgents.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/agents/transfer" className="btn btn-primary gap-2">
          <DollarSign className="w-5 h-5" />
          Transfert vers Agent
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher un agent par email, nom ou pseudo..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Liste des agents */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-xl">
          <Users className="w-16 h-16 text-base-content/30 mx-auto mb-3" />
          <p className="text-lg text-base-content/60">Aucun agent trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg truncate">
                      {agent.full_name || agent.email}
                    </h3>
                    <p className="text-sm text-base-content/60 truncate">{agent.email}</p>
                  </div>
                  <div className="avatar placeholder">
                    <div className={`w-12 h-12 rounded-full ${agent.is_active ? 'bg-primary/20' : 'bg-base-300'} flex items-center justify-center`}>
                      <span className={`text-xl font-bold ${agent.is_active ? 'text-primary' : 'text-base-content/40'}`}>
                        {(agent.full_name || agent.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60">Solde</span>
                    <span className="text-xl font-bold text-primary">
                      {formatNumber(agent.balance)} {agent.currency || 'XOF'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(agent.is_active, agent.is_online)}
                  </div>

                  {agent.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                      <Phone className="w-4 h-4" />
                      <span>{agent.phone_number}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <Calendar className="w-4 h-4" />
                    <span>Inscrit le {formatDate(agent.created_at)}</span>
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <Link
                    to={`/agents/${agent.id}/balance`}
                    className="btn btn-ghost btn-sm gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentBalanceList;