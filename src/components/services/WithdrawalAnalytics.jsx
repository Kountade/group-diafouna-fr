import React from 'react';
import { TrendingDown, Users, DollarSign } from 'lucide-react';

const WithdrawalAnalytics = ({ analytics, formatCurrency, formatNumber }) => {
  const {
    total_withdrawals,
    total_amount,
    avg_amount,
    top_recipients,
    amount_distribution
  } = analytics;

  const distributionColors = {
    '0-1000': 'bg-success',
    '1000-5000': 'bg-info',
    '5000-10000': 'bg-warning',
    '10000-50000': 'bg-error',
    '50000+': 'bg-secondary'
  };

  return (
    <div className="card bg-base-100 shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-6 h-6 text-error" />
        <h3 className="text-lg font-semibold text-base-content">
          Analyses des retraits
        </h3>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat bg-base-200 rounded-lg p-3">
          <div className="stat-title text-xs">Total retraits</div>
          <div className="stat-value text-lg">{formatNumber(total_withdrawals)}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-3">
          <div className="stat-title text-xs">Montant total</div>
          <div className="stat-value text-lg">{formatCurrency(total_amount)}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-3">
          <div className="stat-title text-xs">Moyenne</div>
          <div className="stat-value text-lg">{formatCurrency(avg_amount)}</div>
        </div>
      </div>

      {/* Distribution des montants */}
      <div className="mb-6">
        <p className="text-sm font-medium text-base-content/70 mb-2">
          Distribution des montants
        </p>
        <div className="space-y-2">
          {Object.entries(amount_distribution).map(([range, count]) => {
            const percentage = total_withdrawals > 0 ? (count / total_withdrawals) * 100 : 0;
            return (
              <div key={range} className="flex items-center gap-3">
                <span className="text-xs text-base-content/60 w-20">
                  {range} CFA
                </span>
                <div className="flex-1 h-5 bg-base-200 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${distributionColors[range] || 'bg-primary'}`}
                    style={{ width: `${Math.max(percentage, 1)}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-12 text-right">
                  {formatNumber(count)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top bénéficiaires */}
      {top_recipients && top_recipients.length > 0 && (
        <div>
          <p className="text-sm font-medium text-base-content/70 mb-2">
            Top bénéficiaires
          </p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {top_recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="w-4 h-4 text-base-content/40 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-base-content truncate">
                      {recipient.name}
                    </p>
                    <p className="text-xs text-base-content/50 truncate">
                      {recipient.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-medium text-base-content">
                    {formatCurrency(recipient.total_amount)}
                  </p>
                  <p className="text-xs text-base-content/50">
                    {formatNumber(recipient.count)} retraits
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

export default WithdrawalAnalytics;