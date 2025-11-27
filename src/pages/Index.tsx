import { useEffect, useState, useRef } from 'react';
import VehicleMap from '@/components/VehicleMap';
import SpeedGauge from '@/components/SpeedGauge';
import FuelGauge from '@/components/FuelGauge';
import EmergencyStop from '@/components/EmergencyStop';
import VehicleInfo from '@/components/VehicleInfo';
import MQTTConfig from '@/components/MQTTConfig';
import { useMQTT } from '@/hooks/useMQTT';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VehicleData {
  essence: number;
  latitude: number;
  longitude: number;
  speed: number;
  moduleId: number;
}

interface MQTTConfigData {
  brokerUrl: string;
  topic: string;
  username?: string;
  password?: string;
  caCert?: string;
  clientCert?: string;
  clientKey?: string;
}

// Configurable timeout in milliseconds (default: 5 minutes)
const ITINERARY_TIMEOUT = 5 * 60 * 1000;

const Index = () => {
  const { toast } = useToast();
  const [mqttConfig, setMqttConfig] = useState<MQTTConfigData | null>(null);
  const [itineraryTimeout, setItineraryTimeout] = useState(ITINERARY_TIMEOUT);
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    essence: 75.5,
    latitude: 48.8566,
    longitude: 2.3522,
    speed: 0,
    moduleId: 12345,
  });
  const [itinerary, setItinerary] = useState<[number, number][]>([]);
  const lastUpdateRef = useRef<number>(Date.now());
  const itineraryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDataReceived = (data: VehicleData) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // If too much time has passed, reset the itinerary
    if (timeSinceLastUpdate > itineraryTimeout) {
      setItinerary([[data.latitude, data.longitude]]);
      toast({
        title: 'New Itinerary Started',
        description: 'Previous itinerary ended due to inactivity',
      });
    } else {
      // Add new position to itinerary
      setItinerary((prev) => [...prev, [data.latitude, data.longitude]]);
    }

    lastUpdateRef.current = now;
    setVehicleData(data);

    // Reset the timeout
    if (itineraryTimeoutRef.current) {
      clearTimeout(itineraryTimeoutRef.current);
    }
    itineraryTimeoutRef.current = setTimeout(() => {
      toast({
        title: 'Itinerary Ended',
        description: 'No location updates received',
        variant: 'destructive',
      });
    }, itineraryTimeout);
  };

  const { isConnected, publish } = useMQTT(mqttConfig, handleDataReceived);

  useEffect(() => {
    // Initialize itinerary with current position
    if (itinerary.length === 0) {
      setItinerary([[vehicleData.latitude, vehicleData.longitude]]);
    }

    return () => {
      if (itineraryTimeoutRef.current) {
        clearTimeout(itineraryTimeoutRef.current);
      }
    };
  }, []);

  const handleEmergencyStop = () => {
    console.log('Emergency stop triggered - sending to backend:', { stop: true });
    
    if (isConnected && mqttConfig) {
      // Publish stop command to MQTT
      publish(`${mqttConfig.topic}/command`, JSON.stringify({ stop: true }));
    }
    
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

  const handleMQTTConnect = (config: MQTTConfigData) => {
    setMqttConfig(config);
  };

  if (!mqttConfig) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <MQTTConfig onConnect={handleMQTTConnect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Vehicle Tracking Dashboard
          </h1>
          <div className="flex items-center justify-center gap-4">
            <p className="text-muted-foreground">Real-time monitoring and control</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'MQTT Connected' : 'MQTT Disconnected'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMqttConfig(null)}
            >
              Change Configuration
            </Button>
          </div>
        </div>

        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-4">
            <Label htmlFor="itinerary-timeout" className="whitespace-nowrap">
              Itinerary Timeout (minutes):
            </Label>
            <Input
              id="itinerary-timeout"
              type="number"
              min="1"
              value={itineraryTimeout / 60000}
              onChange={(e) => setItineraryTimeout(Number(e.target.value) * 60000)}
              className="bg-secondary border-border max-w-[120px]"
            />
            <span className="text-sm text-muted-foreground">
              Current itinerary: {itinerary.length} points
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] lg:h-[600px]">
            <VehicleMap 
              latitude={vehicleData.latitude} 
              longitude={vehicleData.longitude}
              itinerary={itinerary}
            />
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
