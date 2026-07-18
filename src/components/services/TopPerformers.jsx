import React, { useState } from 'react';
import { Trophy, Users, Building2, Award } from 'lucide-react';

const PerformerCard = ({ performer, rank, type, formatCurrency, formatNumber }) => {
  const getRankColor = (rank) => {
    if (rank === 0) return 'text-yellow-500';
    if (rank === 1) return 'text-gray-400';
    if (rank === 2) return 'text-amber-600';
    return 'text-base-content/30';
  };

  const getRankIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-5 h-5" />;
    if (rank === 1 || rank === 2) return <Award className="w-5 h-5" />;
    return <span className="text-sm font-medium">#{rank + 1}</span>;
  };

  return (
    <div className="card bg-base-100 border border-base-200 hover:shadow-lg transition-all duration-300">
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`${getRankColor(rank)} flex-shrink-0`}>
              {getRankIcon(rank)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base-content truncate">
                {performer.name}
              </p>
              {type === 'agent' && (
                <p className="text-xs text-base-content/50 truncate">
                  {performer.email}
                </p>
              )}
            </div>
          </div>
          <div className="badge badge-primary badge-lg flex-shrink-0 ml-2">
            {formatCurrency(performer.volume)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-base-200">
          <div>
            <p className="text-xs text-base-content/50">Transactions</p>
            <p className="font-medium">{formatNumber(performer.transaction_count || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/50">Solde</p>
            <p className="font-medium">{formatCurrency(performer.balance || 0)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-base-content/50">Moyenne par transaction</p>
            <p className="font-medium">{formatCurrency(performer.avg_transaction || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopPerformers = ({ performers, formatCurrency, formatNumber }) => {
  const [activeTab, setActiveTab] = useState('partners');

  const tabs = [
    { id: 'partners', label: 'Partenaires', icon: Building2 },
    { id: 'agents', label: 'Agents', icon: Users }
  ];

  const data = activeTab === 'partners' ? performers.top_partners : performers.top_agents;

  if (!data || data.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg p-6">
        <div className="text-center py-8">
          <Users className="w-16 h-16 mx-auto text-base-content/30 mb-3" />
          <p className="text-base-content/50">Aucun performer disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-base-content">
          Meilleurs performeurs
        </h3>
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm gap-2 ${
                activeTab === tab.id ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((performer, index) => (
          <PerformerCard
            key={performer.id}
            performer={performer}
            rank={index}
            type={activeTab}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        ))}
      </div>
    </div>
  );
};

export default TopPerformers;