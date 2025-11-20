import { Card } from './ui/card';
import { Fuel } from 'lucide-react';

interface FuelGaugeProps {
  level: number;
}

const FuelGauge = ({ level }: FuelGaugeProps) => {
  const percentage = Math.min(Math.max(level, 0), 100);
  
  const getColor = () => {
    if (percentage < 20) return 'hsl(var(--emergency))';
    if (percentage < 40) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  return (
    <Card className="p-6 border-border bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Fuel className="w-5 h-5 text-success" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Fuel Level</h3>
        </div>
        
        <div className="space-y-3">
          <div className="relative h-32 bg-secondary rounded-lg overflow-hidden border border-border">
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
              style={{
                height: `${percentage}%`,
                background: `linear-gradient(to top, ${getColor()}, ${getColor()}dd)`,
                boxShadow: `0 0 20px ${getColor()}40`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-3xl font-bold text-foreground tabular-nums drop-shadow-lg">
                {percentage.toFixed(1)}%
              </div>
            </div>
          </div>
          
          {percentage < 20 && (
            <div className="flex items-center gap-2 text-emergency text-sm font-medium animate-pulse">
              <div className="w-2 h-2 rounded-full bg-emergency" />
              Low Fuel Warning
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FuelGauge;
