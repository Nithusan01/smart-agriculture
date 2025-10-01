import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers not showing in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for the default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// Component for picking location on map
const LocationPicker = ({ location, setLocation }) => {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={location.lat && location.lng ? [location.lat, location.lng] : [7.8731, 80.7718]}
      zoom={7}
      style={{ height: '300px', width: '100%', marginBottom: '1rem' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {location.lat && location.lng && <Marker position={[location.lat, location.lng]} />}
      <MapEvents />
    </MapContainer>
  );
};

export default LocationPicker;