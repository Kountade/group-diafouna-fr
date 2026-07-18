import React from 'react';
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const AlertIcon = ({ type }) => {
  switch (type) {
    case 'danger':
      return <AlertCircle className="w-5 h-5 text-error" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case 'success':
      return <CheckCircle className="w-5 h-5 text-success" />;
    default:
      return <Info className="w-5 h-5 text-info" />;
  }
};

const AlertCard = ({ alert, onRead, formatDate }) => {
  const handleMarkRead = async () => {
    try {
      await AxiosInstance.post(`/api/dashboard/alerts/${alert.id}/read/`);
      if (onRead) onRead();
    } catch (error) {
      console.error('Erreur lors du marquage de l\'alerte:', error);
    }
  };

  const getAlertClass = (type) => {
    switch (type) {
      case 'danger': return 'border-error bg-error/5';
      case 'warning': return 'border-warning bg-warning/5';
      case 'success': return 'border-success bg-success/5';
      default: return 'border-info bg-info/5';
    }
  };

  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${getAlertClass(alert.alert_type)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <AlertIcon type={alert.alert_type} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-base-content">{alert.title}</p>
            <p className="text-sm text-base-content/70 mt-1">{alert.message}</p>
            <p className="text-xs text-base-content/40 mt-2">
              {formatDate(alert.created_at)}
            </p>
          </div>
        </div>
        <button
          onClick={handleMarkRead}
          className="btn btn-ghost btn-sm btn-square"
          title="Marquer comme lu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AlertsPanel = ({ alerts, onAlertRead, formatDate }) => {
  if (!alerts.alerts || alerts.alerts.length === 0) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-5 h-5 text-warning" />
        <h4 className="font-semibold text-base-content">
          Alertes ({alerts.total_unread || alerts.alerts.length})
        </h4>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {alerts.alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onRead={onAlertRead}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;