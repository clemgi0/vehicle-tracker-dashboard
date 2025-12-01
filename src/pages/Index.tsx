import { useEffect, useState, useRef } from 'react';
import VehicleMap from '@/components/VehicleMap';
import SpeedGauge from '@/components/SpeedGauge';
import FuelGauge from '@/components/FuelGauge';
import VehicleInfo from '@/components/VehicleInfo';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMqttPolling } from '@/hooks/get-data';

interface VehicleData {
  gas: number;
  latitude: number;
  longitude: number;
  speed: number;
  id: number;
  ts: Date;
}

const ITINERARY_TIMEOUT = 5 * 60 * 1000;

const Index = () => {
  const { toast } = useToast();

  const [vehicleData, setVehicleData] = useState<VehicleData>({
    gas: 0,
    latitude: 6.271074573357741,
    longitude: -75.55443227388572,
    speed: 0,
    id: 12345,
    ts: new Date(Date.now())
  });

  const [itinerary, setItinerary] = useState<[number, number][]>([]);
  const [itineraryTimeout, setItineraryTimeout] = useState(ITINERARY_TIMEOUT);

  const lastUpdateRef = useRef<number>(Date.now());
  const itineraryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /** Handle new vehicle data */
  const handleDataReceived = (data: VehicleData) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    if (timeSinceLastUpdate > itineraryTimeout) {
      setItinerary([[data.latitude, data.longitude]]);
      toast({
        title: 'New Itinerary Started',
        description: 'Previous itinerary ended due to inactivity',
      });
    } else {
      setItinerary(prev => [...prev, [data.latitude, data.longitude]]);
    }

    lastUpdateRef.current = now;
    setVehicleData(data);

    if (itineraryTimeoutRef.current) clearTimeout(itineraryTimeoutRef.current);

    itineraryTimeoutRef.current = setTimeout(() => {
      toast({
        title: 'Itinerary Ended',
        description: 'No location updates received',
        variant: 'destructive',
      });
    }, itineraryTimeout);
  };

  const { lastMessage: data, loading } = useMqttPolling(
    "http://localhost:3001/messages",
    1000
  );

  useEffect(() => {
    if (!data || new Date(data.timestamp ?? Date.now()).getTime() === vehicleData.ts.getTime()) return;
    console.log(new Date(data.timestamp ?? Date.now()), vehicleData.ts)

    console.log('Last Message :', data.payload, ' | Timestamp :', data.timestamp);

    const formatted: VehicleData = {
      gas: Number(data.payload.gas ?? 0),
      latitude: Number(data.payload.latitude ?? 0),
      longitude: Number(data.payload.longitude ?? 0),
      speed: Number(data.payload.speed ?? 0),
      id: Number(data.payload.id ?? 0),
      ts: new Date(data.timestamp ?? 0)
    };

    handleDataReceived(formatted);
  }, [data]);

  useEffect(() => {
    if (itinerary.length === 0) {
      setItinerary([[vehicleData.latitude, vehicleData.longitude]]);
    }

    return () => {
      if (itineraryTimeoutRef.current) clearTimeout(itineraryTimeoutRef.current);
    };
  }, []);

  const handleEmergencyStop = () => {
    fetch("http://localhost:4000/emergency-stop", { method: "POST" });

    setVehicleData(prev => ({ ...prev, speed: 0 }));

    toast({
      title: "Emergency Stop Activated",
      description: "Vehicle has been stopped remotely.",
      variant: "destructive"
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

        {/* Map + gauges */}
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
            <FuelGauge level={vehicleData.gas} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <VehicleInfo
            moduleId={vehicleData.id}
            latitude={vehicleData.latitude}
            longitude={vehicleData.longitude}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
