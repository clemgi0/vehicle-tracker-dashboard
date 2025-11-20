import { useEffect, useState } from 'react';
import VehicleMap from '@/components/VehicleMap';
import SpeedGauge from '@/components/SpeedGauge';
import FuelGauge from '@/components/FuelGauge';
import EmergencyStop from '@/components/EmergencyStop';
import VehicleInfo from '@/components/VehicleInfo';
import { useToast } from '@/hooks/use-toast';

interface VehicleData {
  essence: number;
  latitude: number;
  longitude: number;
  speed: number;
  moduleId: number;
}

const Index = () => {
  const { toast } = useToast();
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    essence: 75.5,
    latitude: 48.8566,
    longitude: 2.3522,
    speed: 0,
    moduleId: 12345,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleData((prev) => ({
        essence: Math.max(0, prev.essence - Math.random() * 0.5),
        latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
        speed: Math.max(0, Math.min(180, prev.speed + (Math.random() - 0.5) * 10)),
        moduleId: prev.moduleId,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleEmergencyStop = () => {
    console.log('Emergency stop triggered - sending to backend:', { stop: true });
    
    setVehicleData((prev) => ({
      ...prev,
      speed: 0,
    }));

    toast({
      title: 'Emergency Stop Activated',
      description: 'Vehicle has been stopped remotely.',
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Vehicle Tracking Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time monitoring and control</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] lg:h-[600px]">
            <VehicleMap latitude={vehicleData.latitude} longitude={vehicleData.longitude} />
          </div>

          <div className="space-y-6">
            <SpeedGauge speed={vehicleData.speed} />
            <FuelGauge level={vehicleData.essence} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VehicleInfo
            moduleId={vehicleData.moduleId}
            latitude={vehicleData.latitude}
            longitude={vehicleData.longitude}
          />
          <EmergencyStop
            isMoving={vehicleData.speed > 0}
            onStop={handleEmergencyStop}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
