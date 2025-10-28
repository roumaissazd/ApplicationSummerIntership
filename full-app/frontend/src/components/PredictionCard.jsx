import React from 'react';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

const PredictionCard = ({ predictions }) => {
  const getCardStyle = (level) => {
    switch (level) {
      case 'high':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-accent-red" />,
          bgColor: 'bg-accent-red/10',
          borderColor: 'border-accent-red/30',
          textColor: 'text-accent-red',
          title: 'Risque Élevé',
        };
      case 'medium':
        return {
          icon: <Zap className="h-8 w-8 text-accent-yellow" />,
          bgColor: 'bg-accent-yellow/10',
          borderColor: 'border-accent-yellow/30',
          textColor: 'text-accent-yellow',
          title: 'Risque Modéré',
        };
      default:
        return {
          icon: <ShieldCheck className="h-8 w-8 text-accent-green" />,
          bgColor: 'bg-accent-green/10',
          borderColor: 'border-accent-green/30',
          textColor: 'text-accent-green',
          title: 'Risque Faible',
        };
    }
  };

  return (
    <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
      <h3 className="text-lg font-semibold text-text-primary font-sans mb-4">🔮 Prédictions de Pannes (IA)</h3>
      <div className="space-y-4">
        {predictions.length === 0 ? (
          <p className="text-text-secondary text-sm">Aucune prédiction disponible pour le moment.</p>
        ) : (
          predictions.map((pred, index) => {
            const style = getCardStyle(pred.riskLevel);
            return (
              <div key={index} className={`p-4 rounded-lg border ${style.bgColor} ${style.borderColor}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">{style.icon}</div>
                  <div>
                    <p className={`font-bold ${style.textColor}`}>{style.title} sur {pred.component}</p>
                    <p className="text-sm text-text-secondary mt-1">{pred.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PredictionCard;