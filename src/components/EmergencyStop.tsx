import { AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { useState } from 'react';

interface EmergencyStopProps {
  isMoving: boolean;
  onStop: () => void;
}

const EmergencyStop = ({ isMoving, onStop }: EmergencyStopProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleStop = () => {
    setIsPressed(true);
    onStop();
    setTimeout(() => setIsPressed(false), 2000);
  };

  return (
    <Card className="p-6 border-border bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emergency/5 to-transparent" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-emergency" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Emergency Control</h3>
        </div>
        
        <button
          onClick={handleStop}
          disabled={!isMoving || isPressed}
          className={`
            w-full py-6 px-8 rounded-lg font-bold text-lg uppercase tracking-wider
            transition-all duration-200 transform
            ${isMoving && !isPressed
              ? 'bg-emergency text-white hover:bg-emergency/90 hover:scale-105 active:scale-95 shadow-lg shadow-emergency/30'
              : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
            }
            ${isPressed ? 'animate-pulse' : ''}
          `}
        >
          {isPressed ? 'STOPPING...' : isMoving ? 'EMERGENCY STOP' : 'VEHICLE STOPPED'}
        </button>
        
        <p className="text-xs text-muted-foreground text-center">
          {isMoving 
            ? 'Press to immediately stop the vehicle'
            : 'Available only when vehicle is moving'
          }
        </p>
      </div>
    </Card>
  );
};

export default EmergencyStop;
