import { Card } from './ui/card';
import { Gauge } from 'lucide-react';

interface SpeedGaugeProps {
  speed: number;
}

const SpeedGauge = ({ speed }: SpeedGaugeProps) => {
  const maxSpeed = 200;
  const percentage = Math.min((speed / maxSpeed) * 100, 100);
  const rotation = (percentage / 100) * 270 - 135;

  return (
    <Card className="p-6 border-border bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Speed</h3>
        </div>
        
        <div className="relative w-40 h-40 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 439.6} 439.6`}
              className="transition-all duration-500 ease-out"
              style={{
                filter: 'drop-shadow(0 0 8px hsl(var(--dashboard-glow)))',
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-foreground tabular-nums">
              {Math.round(speed)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">km/h</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SpeedGauge;
