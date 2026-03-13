
import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../utils/mapLoader';
import { Icon } from './Icons';

declare var google: any;

interface LocationSearchProps {
    onLocationSelect: (details: { address: string; lat: number; lng: number }) => void;
    initialValue?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect, initialValue }) => {
    const [query, setQuery] = useState(initialValue || '');
    const [predictions, setPredictions] = useState<any[]>([]);
    const autocompleteService = useRef<any>(null);
    const placesService = useRef<any>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadGoogleMaps().then(() => {
            if (typeof google !== 'undefined') {
                if (!mapRef.current) return;
                const map = new google.maps.Map(mapRef.current);
                autocompleteService.current = new google.maps.places.AutocompleteService();
                placesService.current = new google.maps.places.PlacesService(map);
            }
        });
    }, []);

    useEffect(() => {
        if (initialValue) {
            setQuery(initialValue);
        }
    }, [initialValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (e.target.value.length > 2 && autocompleteService.current) {
            autocompleteService.current.getPlacePredictions(
                { input: e.target.value, componentRestrictions: { country: 'za' } },
                (results: any[]) => {
                    setPredictions(results || []);
                }
            );
        }
    };

    const handlePredictionSelect = (prediction: any) => {
        setQuery(prediction.description);
        setPredictions([]);
        placesService.current.getDetails({ placeId: prediction.place_id }, (place: any, status: any) => {
            if (status === 'OK' && place.geometry) {
                onLocationSelect({
                    address: place.formatted_address,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                });
            }
        });
    };

    return (
        <div className="relative w-full">
             <div ref={mapRef} style={{ display: 'none' }}></div>
            <div className="relative">
                <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search for an address..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:bg-white focus:border-brand-teal"
                />
            </div>
            {predictions.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                    {predictions.map(p => (
                        <button 
                            key={p.place_id} 
                            onClick={() => handlePredictionSelect(p)} 
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-semibold"
                        >
                            {p.description}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
