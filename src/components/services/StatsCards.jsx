import React from 'react';
import {
  Wallet, Users, UserCheck, TrendingUp, 
  TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const StatsCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const trendColor = trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-base-content/60';
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : null;

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="card-body p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-base-content/60">{title}</p>
            <p className="text-2xl font-bold text-base-content mt-1 truncate">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-base-content/50 mt-1 truncate">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 flex-shrink-0 ml-3`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
        {trend !== undefined && trend !== null && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            {TrendIcon && (
              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            )}
            <span className={`font-medium ${trendColor}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-base-content/40">vs période précédente</span>
          </div>
        )}
      </div>
    </div>
  );
};

const StatsCards = ({ stats, formatCurrency, formatNumber }) => {
  const { partners, agents, global_account, transactions } = stats;

  const cards = [
    {
      title: 'Solde Global',
      value: formatCurrency(global_account?.balance || 0),
      icon: Wallet,
      color: 'text-primary',
      subtitle: 'Compte principal'
    },
    {
      title: 'Partenaires',
      value: formatNumber(partners?.total || 0),
      subtitle: `${formatCurrency(partners?.total_balance || 0)} total`,
      icon: Users,
      color: 'text-success',
      trend: 5.2
    },
    {
      title: 'Agents Actifs',
      value: formatNumber(agents?.active || 0),
      subtitle: `${formatNumber(agents?.total || 0)} au total`,
      icon: UserCheck,
      color: 'text-info',
      trend: -2.1
    },
    {
      title: 'Transactions',
      value: formatNumber(transactions?.total || 0),
      subtitle: `${formatCurrency(transactions?.total_amount || 0)} total`,
      icon: TrendingUp,
      color: 'text-warning',
      trend: 8.7
    },
    {
      title: 'Dépôts',
      value: formatNumber(transactions?.deposits || 0),
      subtitle: `${formatCurrency(transactions?.deposits_amount || 0)}`,
      icon: DollarSign,
      color: 'text-success',
      trend: 12.3
    },
    {
      title: 'Retraits',
      value: formatNumber(transactions?.withdrawals || 0),
      subtitle: `${formatCurrency(transactions?.withdrawals_amount || 0)}`,
      icon: TrendingDown,
      color: 'text-error',
      trend: -3.8
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
};

export default StatsCards;