import React, { useState } from 'react';
import { Wallet, Users, Building2 } from 'lucide-react';

const BalanceSnapshot = ({ snapshot, formatCurrency, formatNumber }) => {
  const [activeTab, setActiveTab] = useState('partners');

  const tabs = [
    { id: 'partners', label: 'Partenaires', icon: Building2 },
    { id: 'agents', label: 'Agents', icon: Users }
  ];

  const data = activeTab === 'partners' 
    ? snapshot.partner_accounts 
    : snapshot.agent_accounts;

  if (!data || data.total === 0) {
    return (
      <div className="card bg-base-100 shadow-lg p-6">
        <div className="text-center py-8">
          <Wallet className="w-16 h-16 mx-auto text-base-content/30 mb-3" />
          <p className="text-base-content/50">Aucun compte disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-base-content">
            Soldes
          </h3>
        </div>
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

      {/* Résumé */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="stat bg-base-200 rounded-lg p-3">
          <div className="stat-title text-xs">Total comptes</div>
          <div className="stat-value text-lg">{formatNumber(data.total)}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-3">
          <div className="stat-title text-xs">Solde total</div>
          <div className="stat-value text-lg">{formatCurrency(data.total_balance)}</div>
        </div>
      </div>

      {/* Top soldes */}
      {data.top_balances && data.top_balances.length > 0 && (
        <div>
          <p className="text-sm font-medium text-base-content/70 mb-2">
            Top soldes
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {data.top_balances.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-base-content/40 w-6">
                    #{index + 1}
                  </span>
                  <p className="font-medium text-base-content truncate">
                    {item.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-medium text-base-content">
                    {formatCurrency(item.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSnapshot;