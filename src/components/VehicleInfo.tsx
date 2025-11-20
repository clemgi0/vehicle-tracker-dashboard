import { Card } from './ui/card';
import { Car } from 'lucide-react';

interface VehicleInfoProps {
  moduleId: number;
  latitude: number;
  longitude: number;
}

const VehicleInfo = ({ moduleId, latitude, longitude }: VehicleInfoProps) => {
  return (
    <Card className="p-6 border-border bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Vehicle Info</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Module ID</div>
            <div className="text-xl font-bold text-foreground tabular-nums">{moduleId}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Latitude</div>
              <div className="text-sm font-mono text-foreground">{latitude.toFixed(6)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Longitude</div>
              <div className="text-sm font-mono text-foreground">{longitude.toFixed(6)}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VehicleInfo;
