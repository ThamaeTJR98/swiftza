
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { LocationSearch } from './LocationSearch';
import { Icon } from './Icons';
import { loadGoogleMaps } from '../utils/mapLoader';
import { AppView } from '../types';

declare var google: any;

interface AddPlaceModalProps {
    placeName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ placeName, onClose, onSuccess }) => {
    const { addSavedPlace, navigate, setInitialDropoff } = useApp();
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const marker = useRef<any>(null);
    const geocoder = useRef<any>(null);

    useEffect(() => {
        loadGoogleMaps().then(() => {
            if (typeof google !== 'undefined' && mapRef.current && !mapInstance.current) {
                geocoder.current = new google.maps.Geocoder();
                mapInstance.current = new google.maps.Map(mapRef.current, {
                    center: { lat: -26.1076, lng: 28.0567 },
                    zoom: 13,
                    disableDefaultUI: true,
                    zoomControl: false,
                    styles: [
                        { featureType: "all", elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
                        { featureType: "poi", stylers: [{ visibility: "off" }] }
                    ]
                });

                mapInstance.current.addListener('click', (e: any) => {
                    const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    updateLocationFromMap(latLng);
                });
            }
        });
    }, []);

    const updateLocationFromMap = (latLng: { lat: number; lng: number }) => {
        setLocation(latLng);
        if (marker.current) {
            marker.current.setPosition(latLng);
        } else {
            marker.current = new google.maps.Marker({
                position: latLng,
                map: mapInstance.current,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#00C4B4',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                }
            });
        }
        mapInstance.current.panTo(latLng);

        geocoder.current.geocode({ location: latLng }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
                setAddress(results[0].formatted_address);
            }
        });
    };

    const handleLocationSelect = (details: { address: string; lat: number; lng: number }) => {
        setAddress(details.address);
        const latLng = { lat: details.lat, lng: details.lng };
        setLocation(latLng);
        
        if (mapInstance.current) {
            mapInstance.current.setCenter(latLng);
            mapInstance.current.setZoom(16);
            if (marker.current) {
                marker.current.setPosition(latLng);
            } else {
                marker.current = new google.maps.Marker({
                    position: latLng,
                    map: mapInstance.current,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#00C4B4',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                    }
                });
            }
        }
    };

    const handleSave = async () => {
        if (!address || !location) {
            alert('Please select a location from the search results or pin it on the map.');
            return;
        }
        setIsLoading(true);
        try {
            await addSavedPlace({
                name: placeName,
                address,
                lat: location.lat,
                lng: location.lng,
                icon: placeName.toLowerCase(),
            });
            
            // Set as dropoff and navigate
            setInitialDropoff({ address, lat: location.lat, lng: location.lng });
            navigate(AppView.REQUEST_RIDE);
            onSuccess();
        } catch (error) {
            console.error('Failed to add place:', error);
            alert('Could not save place. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <Icon name="close" className="text-xl" />
                </button>

                <div className="text-center mb-6">
                    <div className={`w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500`}>
                        <Icon name={placeName.toLowerCase()} className="text-3xl" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">Set Your {placeName} Location</h2>
                    <p className="text-sm text-slate-500 mt-1">Search for the address to save it as a quick link.</p>
                </div>

                <div className="space-y-4">
                    <LocationSearch onLocationSelect={handleLocationSelect} />
                    
                    <div className="relative w-full h-40 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                        <div ref={mapRef} className="w-full h-full" />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            {!location && (
                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
                                    <Icon name="touch_app" className="text-brand-teal text-sm" />
                                    <span className="text-[10px] font-bold text-slate-600">Tap map to pin</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={handleSave} 
                        disabled={isLoading || !location}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-base shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isLoading ? <span className="animate-spin material-symbols-rounded">progress_activity</span> : `Save ${placeName}`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
