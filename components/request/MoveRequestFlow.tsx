
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RideStatus, PaymentMethod, AppView, ErrandCategory } from '../../types';
import { Button } from '../Button';
import { useApp } from '../../context/AppContext';
import { getMoverOptions } from '../../utils/paymentEngine';
import { RideService } from '../../services/RideService';
import { Icon } from '../Icons';
import { loadGoogleMaps } from '../../utils/mapLoader';
import { useSpeechToText } from '../../hooks/useSpeechToText';

declare var google: any;

const MAP_STYLES = [
    { featureType: "all", elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] }
];

export const MoveRequestFlow: React.FC = () => {
  const { navigate, goBack, setActiveRide, user, setAvailableJobs, initialRequestQuery, initialPickup, setInitialPickup, initialDropoff, setInitialDropoff } = useApp();
  
  // Internal selection defaults to 1.5 Ton Truck (m2) since cards are removed
  const [selectedRide] = useState<string>('m2'); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Move Specifics
  const [helpersCount, setHelpersCount] = useState(0);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Locations
  const [pickupAddr, setPickupAddr] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [waypoints, setWaypoints] = useState<{id: string, address: string, coords: {lat: number, lng: number} | null}[]>([]);
  const [dropoffAddr, setDropoffAddr] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState<{lat: number, lng: number} | null>(null);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [routeDistance, setRouteDistance] = useState(0);

  // Refs
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const geocoder = useRef<any>(null);
  const directionsService = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);

  // Speech
  const { isListening, transcript, startListening, setTranscript } = useSpeechToText();

  // --- INIT MAP ---
  useEffect(() => {
      if (initialRequestQuery) setInstructions(initialRequestQuery);
      if (initialPickup) {
          setPickupAddr(initialPickup.address);
          setPickupCoords({ lat: initialPickup.lat, lng: initialPickup.lng });
          setInitialPickup(null);
      }
      if (initialDropoff) {
          setDropoffAddr(initialDropoff.address);
          setDropoffCoords({ lat: initialDropoff.lat, lng: initialDropoff.lng });
          setInitialDropoff(null);
      }

      loadGoogleMaps().then(() => {
          if (typeof google !== 'undefined') {
              autocompleteService.current = new google.maps.places.AutocompleteService();
              placesService.current = new google.maps.places.PlacesService(document.createElement('div'));
              geocoder.current = new google.maps.Geocoder();
              directionsService.current = new google.maps.DirectionsService();

              if (mapContainerRef.current && !mapInstanceRef.current) {
                  mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
                      center: { lat: -26.1076, lng: 28.0567 },
                      zoom: 13,
                      disableDefaultUI: true,
                      zoomControl: false,
                      styles: MAP_STYLES
                  });

                  directionsRendererRef.current = new google.maps.DirectionsRenderer({
                      map: mapInstanceRef.current,
                      suppressMarkers: true,
                      polylineOptions: { strokeColor: '#9333ea', strokeWeight: 5, strokeOpacity: 0.8 }
                  });
              }
          }
      });
  }, []);

  const zoomIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (mapInstanceRef.current) mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
  };
  const zoomOut = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (mapInstanceRef.current) mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
  };
  const geolocateCenter = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.geolocation && mapInstanceRef.current) {
          navigator.geolocation.getCurrentPosition((pos) => {
              const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              mapInstanceRef.current.panTo(loc);
              mapInstanceRef.current.setZoom(16);
          });
      }
  };

  // --- SPEECH HANDLING ---
  useEffect(() => {
      if (transcript) {
          if (activeInput === 'pickup') {
              setPickupAddr(transcript);
          } else if (activeInput === 'dropoff') {
              setDropoffAddr(transcript);
          } else if (activeInput?.startsWith('waypoint-')) {
              const idx = parseInt(activeInput.split('-')[1]);
              const newWps = [...waypoints];
              if(newWps[idx]) {
                  newWps[idx].address = transcript;
                  setWaypoints(newWps);
              }
          } else if (activeInput === 'instructions') {
              setInstructions(prev => (prev ? prev + ' ' + transcript : transcript));
              setTranscript('');
          }
      }
  }, [transcript, activeInput, setTranscript]);

  const handleVoiceInput = (field: string) => {
      setActiveInput(field);
      setTranscript('');
      startListening();
  };

  // --- MAP UPDATE LOGIC ---
  useEffect(() => {
      if (!mapInstanceRef.current || typeof google === 'undefined') return;

      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
      
      const bounds = new google.maps.LatLngBounds();
      let hasPoints = false;

      const addMarker = (position: any, color: string, label?: string) => {
          const marker = new google.maps.Marker({
              position,
              map: mapInstanceRef.current,
              label: label ? { text: label, color: "white", fontSize: "10px", fontWeight: "bold" } : null,
              icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: color,
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#ffffff"
              }
          });
          markersRef.current.push(marker);
          bounds.extend(position);
          hasPoints = true;
      };

      if (pickupCoords) addMarker(pickupCoords, "#9333ea");
      waypoints.forEach((wp, idx) => {
          if (wp.coords) addMarker(wp.coords, "#6366f1", `${idx + 1}`);
      });
      if (dropoffCoords) addMarker(dropoffCoords, "#0f172a");

      if (pickupCoords && dropoffCoords && directionsService.current) {
          const waypts = waypoints.filter(w => w.coords).map(w => ({ location: w.coords, stopover: true }));
          directionsService.current.route({
              origin: pickupCoords,
              destination: dropoffCoords,
              waypoints: waypts,
              travelMode: google.maps.TravelMode.DRIVING
          }, (result: any, status: any) => {
              if (status === 'OK') {
                  directionsRendererRef.current.setDirections(result);
                  
                  // Calculate total distance
                  let totalMeters = 0;
                  const route = result.routes[0];
                  if (route && route.legs) {
                      route.legs.forEach((leg: any) => {
                          totalMeters += leg.distance.value;
                      });
                  }
                  setRouteDistance(totalMeters / 1000);

                  mapInstanceRef.current.fitBounds(result.routes[0].bounds, { top: 40, right: 40, bottom: 40, left: 40 });
              }
          });
      } else if (hasPoints) {
          mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
          const listener = google.maps.event.addListener(mapInstanceRef.current, "idle", () => { 
            if (mapInstanceRef.current.getZoom() > 16) mapInstanceRef.current.setZoom(16); 
            google.maps.event.removeListener(listener); 
          });
      }
  }, [pickupCoords, dropoffCoords, waypoints]);

  // --- AUTOCOMPLETE ---
  useEffect(() => {
      let query = '';
      if (activeInput === 'pickup') query = pickupAddr;
      else if (activeInput === 'dropoff') query = dropoffAddr;
      else if (activeInput?.startsWith('waypoint-')) {
          const idx = parseInt(activeInput.split('-')[1]);
          query = waypoints[idx]?.address || '';
      }

      if (!query || query.length < 3 || !autocompleteService.current) { setPredictions([]); return; }
      autocompleteService.current.getPlacePredictions({ input: query, componentRestrictions: { country: 'za' } }, 
        (results: any) => setPredictions(results || []));
  }, [pickupAddr, dropoffAddr, activeInput, waypoints]);

  const selectPlace = (placeId: string, description: string) => {
      placesService.current.getDetails({ placeId, fields: ['geometry'] }, (place: any) => {
          if (place.geometry) {
              const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
              if (activeInput === 'pickup') { 
                  setPickupAddr(description); setPickupCoords(loc); 
              } else if (activeInput === 'dropoff') { 
                  setDropoffAddr(description); setDropoffCoords(loc); 
              } else if (activeInput?.startsWith('waypoint-')) {
                  const idx = parseInt(activeInput.split('-')[1]);
                  const newWps = [...waypoints];
                  newWps[idx] = { ...newWps[idx], address: description, coords: loc };
                  setWaypoints(newWps);
              }
              setPredictions([]); setActiveInput(null);
          }
      });
  };

  const handleGeolocate = (type: 'pickup' | 'dropoff' = 'pickup') => {
    if (!navigator.geolocation || !geocoder.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
        const latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        geocoder.current.geocode({ location: latLng }, (results: any) => {
            if (results[0]) {
                if (type === 'pickup') {
                    setPickupCoords(latLng);
                    setPickupAddr(results[0].formatted_address);
                } else {
                    setDropoffCoords(latLng);
                    setDropoffAddr(results[0].formatted_address);
                }
            }
        });
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => { if (e.target?.result) setAttachment(e.target.result as string); };
          reader.readAsDataURL(event.target.files[0]);
      }
  };

  // --- SUBMIT ---
  const options = useMemo(() => getMoverOptions(waypoints.length, helpersCount, routeDistance), [waypoints.length, helpersCount, routeDistance]);

  const handleRequest = async () => {
      if (!user || !pickupCoords || !dropoffCoords) return;
      setIsSubmitting(true);
      try {
          const selectedOption = options.find(o => o.id === selectedRide);
          const request = {
              type: 'Move',
              title: `${pickupAddr.split(',')[0]} to ${dropoffAddr.split(',')[0]}`,
              location: pickupAddr.split(',')[0],
              distance: 'TBD',
              price: `R ${selectedOption?.price || '450'}`,
              icon: 'local_shipping',
              color: 'text-purple-600',
              // --- Full data for when a driver accepts ---
              fullDetails: {
                  type: 'move',
                  pickup: { address: pickupAddr, lat: pickupCoords.lat, lng: pickupCoords.lng },
                  dropoff: { address: dropoffAddr, lat: dropoffCoords.lat, lng: dropoffCoords.lng },
                  waypoints: waypoints.filter(w => w.coords).map(w => ({ address: w.address, lat: w.coords!.lat, lng: w.coords!.lng })),
                  paymentMethod: PaymentMethod.PAYSTACK,
                  vehicleType: selectedOption?.name || '1.5 Ton Truck',
                  errandDetails: {
                      category: ErrandCategory.HOME_ESSENTIALS,
                      recipientName: 'Move Client',
                      packageSize: 'furniture',
                      instructions: instructions || "Moving items",
                      attachmentUrl: attachment,
                      helpersCount: helpersCount,
                      helperFee: helpersCount * 150
                  }
              }
          };
          
          console.log("Sending request to RideService...", request.fullDetails);
          
          const newJob = await RideService.requestRide(request.fullDetails, user.id);
          console.log("Job created successfully via RideService:", newJob);

          if (!newJob || !newJob.id) {
              throw new Error("Invalid response from RideService");
          }

          setActiveRide(newJob as any);
          navigate(AppView.FINDING_RUNNER);
      } catch(e: any) { alert(e.message); } 
      finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans h-[100dvh] w-full overflow-hidden pointer-events-auto">
        
        {/* Header */}
        <div className="pt-safe-top bg-white z-20 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3 px-4 py-3 h-14">
                <button 
                    onClick={() => navigate(AppView.HOME)}
                    className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-800 transition-colors active:scale-95"
                >
                    <Icon name="arrow_back" className="text-xl" />
                </button>
                <h2 className="text-lg font-extrabold text-slate-900">Plan your move</h2>
            </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 relative overflow-y-auto no-scrollbar">
            {/* Form Section - Compacted */}
            <div className="shrink-0 z-10 bg-white shadow-sm border-b border-gray-100 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="p-4 space-y-3">
                    
                    {/* 1. Pickup and Destination Card */}
                    <div className="relative flex gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex flex-col items-center pt-3 pb-3 shrink-0 w-4">
                            <div className="w-3 h-3 rounded-full border-[3px] border-purple-300 bg-white"></div>
                            <div className="w-0.5 flex-1 bg-gray-200 my-1 border-l border-dashed border-gray-300 min-h-[30px]"></div>
                            {waypoints.map((_, i) => (
                                <React.Fragment key={i}>
                                    <div className="w-2 h-2 rounded-full bg-purple-400 mb-1"></div>
                                    <div className="w-0.5 flex-1 bg-gray-200 my-1 border-l border-dashed border-gray-300 min-h-[30px]"></div>
                                </React.Fragment>
                            ))}
                            <div className="w-3 h-3 rounded-full bg-purple-600 border-[3px] border-white ring-1 ring-purple-600"></div>
                        </div>

                        <div className="flex-1 flex flex-col gap-3 min-w-0">
                            {/* Pickup */}
                            <div className="relative">
                                <label className="text-[10px] text-purple-500 font-bold uppercase mb-1 block">Pickup</label>
                                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-purple-300 focus-within:bg-white transition-colors">
                                    <input 
                                        type="text" 
                                        value={pickupAddr} 
                                        onFocus={() => setActiveInput('pickup')} 
                                        onChange={e => setPickupAddr(e.target.value)} 
                                        placeholder="Current address" 
                                        className="flex-1 bg-transparent font-bold text-slate-900 outline-none text-sm min-w-0 truncate" 
                                    />
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => handleVoiceInput('pickup')} className={`p-1.5 rounded-full hover:bg-gray-200 ${isListening && activeInput === 'pickup' ? 'text-purple-500 animate-pulse' : 'text-gray-400'}`}>
                                            <Icon name="mic" className="text-lg" />
                                        </button>
                                        <button onClick={() => handleGeolocate('pickup')} className="text-purple-500 hover:bg-purple-50 p-1.5 rounded-full"><Icon name="my_location" className="text-lg" /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Waypoints */}
                            {waypoints.map((wp, idx) => (
                                <div key={wp.id} className="relative animate-slide-up">
                                    <label className="text-[10px] text-purple-400 font-bold uppercase block mb-1">Stop {idx + 1}</label>
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-purple-300 focus-within:bg-white transition-colors">
                                        <input 
                                            type="text" 
                                            value={wp.address}
                                            onFocus={() => setActiveInput(`waypoint-${idx}`)}
                                            onChange={(e) => {
                                                const newWps = [...waypoints];
                                                newWps[idx].address = e.target.value;
                                                setWaypoints(newWps);
                                            }}
                                            placeholder="Add a stop"
                                            className="flex-1 bg-transparent font-bold text-slate-900 outline-none text-sm min-w-0 truncate" 
                                        />
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => handleVoiceInput(`waypoint-${idx}`)} className={`p-1.5 rounded-full hover:bg-gray-200 ${isListening && activeInput === `waypoint-${idx}` ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                                                <Icon name="mic" className="text-lg" />
                                            </button>
                                            <button onClick={() => setWaypoints(waypoints.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full"><Icon name="close" className="text-lg" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Dropoff */}
                            <div className="relative">
                                <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Destination</label>
                                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-purple-300 focus-within:bg-white transition-colors">
                                    <input 
                                        type="text" 
                                        value={dropoffAddr} 
                                        onFocus={() => setActiveInput('dropoff')} 
                                        onChange={e => setDropoffAddr(e.target.value)} 
                                        placeholder="Delivery address" 
                                        className="flex-1 bg-transparent font-bold text-slate-900 outline-none text-sm min-w-0 truncate" 
                                    />
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => handleVoiceInput('dropoff')} className={`p-1.5 rounded-full hover:bg-gray-200 ${isListening && activeInput === 'dropoff' ? 'text-purple-500 animate-pulse' : 'text-gray-400'}`}>
                                            <Icon name="mic" className="text-lg" />
                                        </button>
                                        <button onClick={() => handleGeolocate('dropoff')} className="text-gray-400 hover:bg-gray-50 p-1.5 rounded-full"><Icon name="my_location" className="text-lg" /></button>
                                        {waypoints.length < 3 && (
                                            <button onClick={() => setWaypoints([...waypoints, { id: Date.now().toString(), address: '', coords: null }])} className="text-purple-500 hover:bg-purple-50 p-1.5 rounded-full">
                                                <Icon name="add_circle" className="text-lg" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {predictions.length > 0 && (
                                <div className="absolute top-[100%] left-0 right-0 bg-white shadow-xl rounded-xl z-50 border border-gray-100 max-h-40 overflow-auto">
                                    {predictions.map((p) => (
                                        <div key={p.place_id} onClick={() => selectPlace(p.place_id, p.description)} className="p-3 border-b border-gray-50 text-sm hover:bg-gray-50 cursor-pointer">
                                            <span className="font-bold block text-gray-900 truncate">{p.structured_formatting.main_text}</span>
                                            <span className="text-xs text-gray-500 truncate">{p.structured_formatting.secondary_text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Describe Items Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm flex flex-col gap-2 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-50 transition-all">
                        <label className="text-[10px] text-gray-400 font-bold uppercase px-1">What items are we moving?</label>
                        <div className="flex items-center gap-2">
                            <textarea 
                                value={instructions} 
                                onFocus={() => setActiveInput('instructions')}
                                onChange={e => setInstructions(e.target.value)} 
                                placeholder="e.g. 1 Bed, 2 Sofas, 10 Boxes..." 
                                className="flex-1 outline-none text-sm font-medium resize-none bg-transparent py-1 max-h-20 no-scrollbar" 
                                rows={2} 
                            />
                            <div className="flex items-center gap-1 shrink-0 self-end pb-1">
                                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    className={`size-9 rounded-full flex items-center justify-center transition-colors ${attachment ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                    <Icon name={attachment ? "check" : "camera_alt"} className="text-xl" />
                                </button>
                                <button 
                                    onClick={() => handleVoiceInput('instructions')} 
                                    className={`size-9 rounded-full flex items-center justify-center transition-colors ${isListening && activeInput === 'instructions' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                    <Icon name="mic" className="text-xl" />
                                </button>
                            </div>
                        </div>
                        {attachment && (
                            <div className="flex items-center gap-2 mt-1 px-1">
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full flex items-center gap-1">
                                    <Icon name="check" className="text-[10px]" /> Photo Attached
                                </span>
                                <button onClick={() => setAttachment(null)} className="text-[10px] font-bold text-gray-400 hover:text-red-500">Remove</button>
                            </div>
                        )}
                    </div>

                    {/* 3. Loading Assistants Counter - NEW COMPACT LAYOUT */}
                    <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-200 text-orange-700 size-10 rounded-xl flex items-center justify-center shrink-0">
                                <Icon name="pan_tool" className="text-xl" />
                            </div>
                            <div className="flex flex-col">
                                <p className="font-extrabold text-orange-900 text-sm leading-tight">Helpers Needed?</p>
                                <p className="text-[10px] text-orange-600 font-bold uppercase">R150 / ea</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center bg-white rounded-xl border border-orange-200 shadow-sm h-10 px-1 w-28">
                            <button onClick={() => setHelpersCount(Math.max(0, helpersCount - 1))} className="w-8 h-8 flex items-center justify-center text-orange-700 hover:bg-orange-50 rounded-lg font-bold text-lg">-</button>
                            <div className="flex-1 text-center">
                                <span className="text-sm font-black text-slate-800 leading-none">{helpersCount}</span>
                            </div>
                            <button onClick={() => setHelpersCount(Math.min(3, helpersCount + 1))} className="w-8 h-8 flex items-center justify-center text-orange-700 hover:bg-orange-50 rounded-lg font-bold text-lg">+</button>
                        </div>
                    </div>

                </div>
            </div>

            {/* 4. Map Interface */}
            <div className="flex-[1.5] relative bg-purple-50 w-full min-h-[300px]">
                <div className="absolute inset-2 rounded-3xl overflow-hidden border-[6px] border-white shadow-2xl ring-1 ring-black/5">
                    <div ref={mapContainerRef} className="w-full h-full opacity-90" />
                    
                    {/* Standardized Map Controls Stack (Bottom Right) */}
                    <div className="absolute right-3 bottom-3 flex flex-col gap-2 z-10">
                        <button onClick={geolocateCenter} className="size-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-primary active:scale-90 border border-primary/10">
                            <Icon name="my_location" className="text-xl" />
                        </button>
                        <div className="flex flex-col rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
                            <button onClick={zoomIn} className="size-10 flex items-center justify-center text-slate-700 active:bg-slate-50 border-b border-slate-100"><Icon name="zoom_in" className="text-xl" /></button>
                            <button onClick={zoomOut} className="size-10 flex items-center justify-center text-slate-700 active:bg-slate-50"><Icon name="zoom_out" className="text-xl" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 pb-safe-action shrink-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Fare</span>
                <span className="text-lg font-black text-slate-900">R {options.find(o => o.id === selectedRide)?.price || '450'}</span>
            </div>
            <Button 
                fullWidth 
                onClick={handleRequest} 
                disabled={isSubmitting || !pickupAddr || !dropoffAddr}
                className="!h-14 !rounded-2xl !bg-purple-600 !text-white !font-black !text-lg shadow-xl shadow-purple-200"
            >
                {isSubmitting ? 'BOOKING...' : 'BOOK MOVE'}
            </Button>
        </div>
    </div>
  );
};
