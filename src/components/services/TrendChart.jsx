import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Calendar, TrendingUp } from 'lucide-react';

const TrendChart = ({ trends, formatCurrency }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!trends?.daily || trends.daily.length === 0) return;

    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = trends.daily.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Montant total',
            data: trends.daily.map(d => d.amount),
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 2
          },
          {
            label: 'Dépôts',
            data: trends.daily.map(d => d.deposits_amount || 0),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 2
          },
          {
            label: 'Retraits',
            data: trends.daily.map(d => d.withdrawals_amount || 0),
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trends, formatCurrency]);

  if (!trends?.daily || trends.daily.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg p-6">
        <div className="text-center py-8">
          <TrendingUp className="w-16 h-16 mx-auto text-base-content/30 mb-3" />
          <p className="text-base-content/50">Aucune donnée de tendance disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-base-content">
          Évolution des transactions
        </h3>
        <div className="flex items-center gap-2 text-sm text-base-content/50">
          <Calendar className="w-4 h-4" />
          <span>{trends.total_days} jours</span>
        </div>
      </div>
      <div className="h-[400px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default TrendChart;