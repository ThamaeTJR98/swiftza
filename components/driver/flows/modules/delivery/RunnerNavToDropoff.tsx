import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '../../../../Icons';
import { RideStop } from '../../../../../types';
import { GoogleMapComponent } from '../../../../shared/GoogleMapComponent';
import { DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

interface Props {
    currentStop: RideStop;
    onArrive: () => void;
    onCancel: () => void;
}

export const RunnerNavToDropoff: React.FC<Props> = ({ currentStop, onArrive, onCancel }) => {
    const [sliderVal, setSliderVal] = useState(0);
    const [isCardExpanded, setIsCardExpanded] = useState(true);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [currentStep, setCurrentStep] = useState<google.maps.DirectionsStep | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    useEffect(() => {
        // Mock current location for demo purposes (slightly offset from destination)
        // In production, use navigator.geolocation.watchPosition
        setCurrentLocation({
            lat: currentStop.lat - 0.01,
            lng: currentStop.lng - 0.01
        });
    }, [currentStop]);

    useEffect(() => {
        if (isLoaded && currentLocation && currentStop) {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: currentLocation,
                    destination: { lat: currentStop.lat, lng: currentStop.lng },
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK && result) {
                        setDirections(result);
                        if (result.routes[0]?.legs[0]?.steps[0]) {
                            setCurrentStep(result.routes[0].legs[0].steps[0]);
                        }
                    }
                }
            );
        }
    }, [isLoaded, currentLocation, currentStop]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setSliderVal(val);
        if (val >= 95) {
            setSliderVal(100);
            onArrive();
        }
    };

    const handleZoomIn = () => {
        if (map) map.setZoom((map.getZoom() || 15) + 1);
    };

    const handleZoomOut = () => {
        if (map) map.setZoom((map.getZoom() || 15) - 1);
    };

    const handleGeolocate = () => {
        if (map && currentLocation) {
            map.panTo(currentLocation);
            map.setZoom(17);
        }
    };

    const stripHtmlTags = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    return (
        <div className="relative flex h-[100dvh] w-full flex-col bg-slate-900 font-sans overflow-hidden">
            {/* Map Area - Full Page */}
            <div className="absolute inset-0 z-0">
                <GoogleMapComponent 
                    lat={currentStop.lat} 
                    lng={currentStop.lng}
                    onLoad={(m) => setMap(m)}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: false,
                    }}
                >
                    {directions && (
                        <DirectionsRenderer 
                            directions={directions} 
                            options={{
                                suppressMarkers: false,
                                polylineOptions: {
                                    strokeColor: '#8b5cf6',
                                    strokeWeight: 5,
                                }
                            }}
                        />
                    )}
                </GoogleMapComponent>
            </div>

            {/* Top Navigation - Clean Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between">
                <button onClick={onCancel} className="text-white bg-black/40 backdrop-blur-md size-10 flex items-center justify-center rounded-full shadow-lg">
                    <Icon name="arrow_back" />
                </button>
                <h2 className="text-white text-sm font-bold bg-black/40 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">Delivering to Customer</h2>
                <div className="size-10" /> {/* Spacer */}
            </div>

            {/* Turn-by-Turn Navigation Card */}
            {currentStep && (
                <div className="absolute top-20 left-4 right-4 z-10 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-4 border border-slate-100">
                    <div className="size-12 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Icon name="directions" className="text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{currentStep.distance?.text}</p>
                        <p className="text-lg font-bold text-slate-900 truncate">{stripHtmlTags(currentStep.instructions)}</p>
                    </div>
                </div>
            )}

            {/* Map Controls - Right Side */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
                <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-slate-200">
                    <button onClick={handleZoomIn} className="size-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors border-b border-slate-200">
                        <Icon name="add" />
                    </button>
                    <button onClick={handleZoomOut} className="size-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors">
                        <Icon name="remove" />
                    </button>
                </div>
                <button onClick={handleGeolocate} className="size-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-brand-purple hover:bg-slate-100 active:bg-slate-200 transition-colors border border-slate-200">
                    <Icon name="my_location" />
                </button>
            </div>

            {/* Bottom Info Card - Retractable */}
            <div className={`absolute bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out ${isCardExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
                <div className="bg-white rounded-t-3xl p-5 pb-safe-action shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-200">
                    <button 
                        onClick={() => setIsCardExpanded(!isCardExpanded)} 
                        className="w-full flex justify-center pb-4 pt-1 cursor-pointer"
                    >
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                    </button>
                    
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-purple mb-1 block">Next Stop</span>
                            <p className="text-xl font-black text-slate-900 truncate">{currentStop.customerName}</p>
                            <p className="text-sm text-slate-500 truncate mt-0.5">{currentStop.address}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button className="size-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm">
                                <Icon name="chat_bubble" />
                            </button>
                        </div>
                    </div>

                    {/* Slide to Arrive */}
                    <div className="relative flex items-center w-full h-16 bg-slate-100 rounded-2xl p-1.5 overflow-hidden shadow-inner border border-slate-200/50">
                        <div className="absolute inset-0 bg-brand-purple/10" style={{ width: `${sliderVal}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Slide to Arrive</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={sliderVal}
                            onChange={handleSliderChange}
                            onTouchEnd={() => { if (sliderVal < 100) setSliderVal(0); }}
                            onMouseUp={() => { if (sliderVal < 100) setSliderVal(0); }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div 
                            className="z-10 flex h-13 w-13 items-center justify-center rounded-xl bg-brand-purple text-white shadow-md cursor-grab active:cursor-grabbing transition-transform absolute left-1.5 bottom-1.5 top-1.5 aspect-square"
                            style={{ transform: `translateX(${sliderVal * (window.innerWidth - 80) / 100}px)` }}
                        >
                            <Icon name="double_arrow" className="text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Retracted Widget (Visible when card is collapsed) */}
            {!isCardExpanded && (
                <div className="absolute bottom-4 left-4 z-10">
                    <button 
                        onClick={() => setIsCardExpanded(true)}
                        className="bg-white rounded-2xl p-3 shadow-xl flex items-center gap-3 border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <div className="size-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                            <Icon name="location_on" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Next Stop</p>
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{currentStop.customerName}</p>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};
