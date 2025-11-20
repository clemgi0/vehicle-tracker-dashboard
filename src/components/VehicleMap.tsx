import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface VehicleMapProps {
  latitude: number;
  longitude: number;
  itinerary: [number, number][];
}

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  const prevCenterRef = useRef(center);

  useEffect(() => {
    const [prevLat, prevLng] = prevCenterRef.current;
    const [newLat, newLng] = center;
    
    // Only update if position has changed
    if (prevLat !== newLat || prevLng !== newLng) {
      map.flyTo(center, map.getZoom(), {
        duration: 1,
      });
      prevCenterRef.current = center;
    }
  }, [center, map]);

  return null;
};

const VehicleMap = ({ latitude, longitude, itinerary }: VehicleMapProps) => {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border shadow-lg shadow-dashboard-glow/10">
      <MapContainer
        center={position}
        zoom={15}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw the itinerary path */}
        {itinerary.length > 1 && (
          <Polyline
            positions={itinerary}
            pathOptions={{
              color: '#00BFFF',
              weight: 4,
              opacity: 0.7,
            }}
          />
        )}
        
        {/* Current position marker */}
        <Marker position={position} />
        
        {/* Update map center when position changes */}
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
};

export default VehicleMap;
