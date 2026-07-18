import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const DATE_RANGES = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'yesterday', label: 'Hier' },
  { value: 'last_7_days', label: '7 derniers jours' },
  { value: 'last_30_days', label: '30 derniers jours' },
  { value: 'last_90_days', label: '90 derniers jours' },
  { value: 'last_180_days', label: '180 derniers jours' },
  { value: 'last_year', label: 'Dernière année' },
  { value: 'this_week', label: 'Cette semaine' },
  { value: 'this_month', label: 'Ce mois' },
  { value: 'this_quarter', label: 'Ce trimestre' },
  { value: 'all_time', label: 'Tout le temps' },
];

const DateRangeFilter = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = DATE_RANGES.find(r => r.value === value)?.label || 'Période';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline gap-2"
      >
        <Calendar className="w-5 h-5" />
        <span>{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-base-100 rounded-xl shadow-2xl border border-base-200 z-50 py-2 max-h-80 overflow-y-auto">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => {
                onChange(range.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-base-200 transition-colors ${
                value === range.value ? 'bg-primary/10 text-primary font-medium' : ''
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;