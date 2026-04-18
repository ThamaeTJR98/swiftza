import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  onLoad?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
  options?: google.maps.MapOptions;
}

export const GoogleMapComponent: React.FC<Props> = ({ lat, lng, zoom = 15, origin, destination, onLoad, children, options }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const center = { lat, lng };
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      options={options}
    >
      {children ? children : (
        origin && destination ? (
          <DirectionsService
            options={{
              origin,
              destination,
              travelMode: google.maps.TravelMode.DRIVING
            }}
            callback={(result) => {
              if (result !== null) {
                setDirections(result);
              }
            }}
          />
        ) : (
          <Marker position={center} />
        )
      )}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  ) : (
    <div className="h-full w-full flex items-center justify-center bg-slate-200">
      <p className="text-slate-500">Loading Map...</p>
    </div>
  );
};
