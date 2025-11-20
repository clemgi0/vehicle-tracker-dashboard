import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface VehicleMapProps {
  latitude: number;
  longitude: number;
}

const VehicleMap = ({ latitude, longitude }: VehicleMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [longitude, latitude],
      zoom: 15,
      pitch: 45,
    });

    marker.current = new mapboxgl.Marker({
      color: '#00BFFF',
      scale: 1.2,
    })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken]);

  useEffect(() => {
    if (marker.current && map.current) {
      marker.current.setLngLat([longitude, latitude]);
      map.current.flyTo({
        center: [longitude, latitude],
        essential: true,
        duration: 1000,
      });
    }
  }, [latitude, longitude]);

  if (!isTokenSet) {
    return (
      <Card className="p-6 border-border bg-card">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Enter Mapbox Token</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get your token at{' '}
              <a
                href="https://mapbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <Input
            type="text"
            placeholder="pk.eyJ1..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="bg-secondary border-border"
          />
          <button
            onClick={() => setIsTokenSet(true)}
            disabled={!mapboxToken}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Load Map
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border shadow-lg shadow-dashboard-glow/10">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default VehicleMap;
