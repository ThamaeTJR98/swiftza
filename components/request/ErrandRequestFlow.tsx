
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RideOption, RideStatus, PaymentMethod, ErrandItem, AppView, ErrandCategory, RunnerMode } from '../../types';
import { Button } from '../Button';
import { useApp } from '../../context/AppContext';
import { getErrandOptions } from '../../utils/paymentEngine';
import { RideService } from '../../services/RideService';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { Icon } from '../Icons';
import { loadGoogleMaps } from '../../utils/mapLoader';

declare var google: any;

const MAP_STYLES = [
    { featureType: "all", elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] }
];

export const ErrandRequestFlow: React.FC = () => {
  const { navigate, setView, goBack, setActiveRide, user, initialRequestQuery, setAvailableJobs, errandCategory, setErrandCategory, initialPickup, setInitialPickup, initialDropoff, setInitialDropoff } = useApp();
  const [step, setStep] = useState<'details' | 'vehicle'>('details');
  const [selectedRide, setSelectedRide] = useState<string>('e1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errand Specific State
  const [errandMode, setErrandMode] = useState<'HUB' | 'LIST'>('HUB');
  const [errandItems, setErrandItems] = useState<ErrandItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [estimatedGoodsCost, setEstimatedGoodsCost] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isItemsRetracted, setIsItemsRetracted] = useState(false);
  const [isHeavyLoad, setIsHeavyLoad] = useState(false);
  const [isExpress, setIsExpress] = useState(false);
  const [shoppingListImage, setShoppingListImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location State
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
  
  const { isListening, transcript, startListening, setTranscript } = useSpeechToText();

  // --- INIT & MAP ---
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
      
      const authHandler = (e: any) => {
          alert(`Google Maps Error: ${e.detail?.message || "API Key Rejected"}. Please check your Google Cloud Console settings.`);
      };
      window.addEventListener('map-auth-failure', authHandler);

      console.log("Initializing Google Maps...");
      let isMounted = true;

      loadGoogleMaps().then(() => {
          if (!isMounted) return;
          console.log("Google Maps script loaded.");
          if (typeof google !== 'undefined') {
              console.log("Initializing Services...");
              autocompleteService.current = new google.maps.places.AutocompleteService();
              placesService.current = new google.maps.places.PlacesService(document.createElement('div'));
              geocoder.current = new google.maps.Geocoder();
              directionsService.current = new google.maps.DirectionsService();

              if (mapContainerRef.current && !mapInstanceRef.current) {
                  console.log("Initializing Map Instance...");
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
                      polylineOptions: { strokeColor: '#3b82f6', strokeWeight: 5, strokeOpacity: 0.8 }
                  });
              }
          } else {
              console.error("Google object is undefined after load.");
          }
      }).catch(err => console.error("Failed to load Google Maps:", err));
      
      return () => {
          isMounted = false;
          window.removeEventListener('map-auth-failure', authHandler);
      };
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
          if (activeInput === 'instructions') {
              setInstructions(prev => prev + ' ' + transcript);
              setTranscript('');
          } else if (activeInput === 'pickup') {
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
          } else if (errandMode === 'LIST' && !activeInput) {
              const items = transcript.split(/ and |,| next /i);
              const newItems = items.map(text => ({
                  id: Date.now() + Math.random().toString(),
                  name: text.trim(),
                  quantity: '1'
                })).filter(i => i.name.length > 2);
              setErrandItems(prev => [...prev, ...newItems]);
              setTranscript('');
          }
      }
  }, [transcript, activeInput, errandMode]);

  const handleVoiceInput = (field: string) => {
      setActiveInput(field);
      setTranscript('');
      startListening();
  };

  const handleAddItem = () => {
      if (!newItemName.trim()) return;
      setErrandItems([...errandItems, { id: Date.now().toString(), name: newItemName.trim(), quantity: '1' }]);
      setNewItemName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setShoppingListImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
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

      if (pickupCoords) addMarker(pickupCoords, "#3b82f6"); 
      waypoints.forEach((wp, idx) => {
          if (wp.coords) addMarker(wp.coords, "#60a5fa", `${idx + 1}`);
      });
      if (dropoffCoords) addMarker(dropoffCoords, "#1e3a8a"); 

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

  // --- AUTOCOMPLETE LOGIC ---
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

  const handleBack = () => {
      if (step === 'vehicle') {
          setStep('details');
      } else {
          navigate(AppView.HOME);
      }
  };

  const options = useMemo(() => getErrandOptions(waypoints.length, pickupAddr, routeDistance), [waypoints.length, pickupAddr, routeDistance]);

  const handleRequest = async () => {
      if (!user) {
          alert("Please log in to continue.");
          return;
      }

      setIsSubmitting(true);
      console.log("Starting request submission...");

      try {
          // Lazy Geocoding Helper with Timeout
          const geocodeWithTimeout = (address: string) => {
              return new Promise<any>((resolve, reject) => {
                  const timeoutId = setTimeout(() => reject("Geocoding timed out"), 5000);
                  geocoder.current.geocode({ address: address + ', South Africa' }, (res: any, status: any) => {
                      clearTimeout(timeoutId);
                      if (status === 'OK' && res[0]) resolve(res);
                      else reject(status);
                  });
              });
          };

          // Lazy Geocoding: If coords are missing but text exists, try to resolve them now
          let finalPickupCoords = pickupCoords;
          let finalDropoffCoords = dropoffCoords;

          if (!finalPickupCoords && pickupAddr && geocoder.current) {
              console.log("Attempting lazy geocode for pickup...");
              try {
                  const results = await geocodeWithTimeout(pickupAddr);
                  finalPickupCoords = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
                  setPickupCoords(finalPickupCoords);
              } catch (e) {
                  console.warn("Lazy geocode failed for pickup:", e);
              }
          }

          if (!finalDropoffCoords && dropoffAddr && geocoder.current) {
              console.log("Attempting lazy geocode for dropoff...");
              try {
                  const results = await geocodeWithTimeout(dropoffAddr);
                  finalDropoffCoords = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
                  setDropoffCoords(finalDropoffCoords);
              } catch (e) {
                  console.warn("Lazy geocode failed for dropoff:", e);
              }
          }

          // Final Validation
          if (!finalPickupCoords) {
              alert("Please select a valid pickup location from the list.");
              setIsSubmitting(false);
              return;
          }
          if (!finalDropoffCoords) {
              alert("Please select a valid drop-off location from the list.");
              setIsSubmitting(false);
              return;
          }

          const selectedOption = options.find(o => o.id === selectedRide);
          if (!selectedOption) {
              alert("Please select a runner type.");
              setIsSubmitting(false);
              return;
          }

          const errandDetails = {
              category: errandCategory,
              recipientName: errandCategory === ErrandCategory.GOVT_QUEUE ? 'Queue Location' : 'Store',
              packageSize: 'medium',
              instructions: instructions || (errandCategory === ErrandCategory.GOVT_QUEUE ? "Queueing task" : "See shopping list"),
              items: errandItems,
              attachmentUrl: shoppingListImage || undefined,
              estimatedGoodsCost: estimatedGoodsCost ? parseFloat(estimatedGoodsCost) : 0,
              queueRatePerHour: errandCategory === ErrandCategory.GOVT_QUEUE ? 120 : undefined,
              isHeavyLoad,
              isExpress
          };

          const request = {
              type: 'Errand',
              title: errandDetails.instructions.substring(0, 30) + '...',
              location: pickupAddr.split(',')[0],
              distance: 'TBD',
              price: `R ${selectedOption.price}`,
              icon: 'directions_run',
              color: 'text-blue-600',
              fullDetails: {
                  type: 'errand',
                  pickup: { address: pickupAddr, lat: finalPickupCoords.lat, lng: finalPickupCoords.lng },
                  dropoff: { address: dropoffAddr, lat: finalDropoffCoords.lat, lng: finalDropoffCoords.lng },
                  waypoints: waypoints.filter(w => w.coords).map(w => ({ address: w.address, lat: w.coords!.lat, lng: w.coords!.lng })),
                  paymentMethod: PaymentMethod.CARD, 
                  vehicleType: selectedOption.name,
                  errandDetails: errandDetails
              }
          };
          
          console.log("Sending request to RideService...", request.fullDetails);
          
          const newJob = await RideService.requestRide(request.fullDetails, user.id);
          console.log("Job created successfully via RideService:", newJob);

          if (!newJob || !newJob.id) {
              throw new Error("Invalid response from RideService");
          }

          setActiveRide(newJob as any);
          
          console.log("Navigating to FINDING_RUNNER...");
          // Force navigation in next tick to ensure state updates don't conflict
          setTimeout(() => {
              console.log("Executing delayed navigation to FINDING_RUNNER");
              setView(AppView.FINDING_RUNNER);
          }, 100);

      } catch(e: any) { 
          console.error("Request failed:", e);
          alert("Error: " + (e.message || "Request timed out")); 
          setIsSubmitting(false);
      } 
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans h-[100dvh] w-full overflow-hidden pointer-events-auto">
        
        <div className="pt-safe-top bg-white z-20 border-b border-gray-50 shrink-0">
            <div className="flex items-center gap-3 px-4 py-3 h-14">
                <button 
                    onClick={handleBack}
                    className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-800 transition-colors active:scale-95"
                >
                    <Icon name="arrow_back" className="text-xl" />
                </button>
                <h2 className="text-lg font-extrabold text-slate-900">{step === 'details' ? 'Errand Details' : 'Choose Runner'}</h2>
            </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 relative">
            
            {step === 'details' ? (
                <>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className={`p-4 space-y-4 pb-24 transition-all duration-300 ${errandCategory === ErrandCategory.GROCERY_SHOPPING ? 'bg-slate-50' : 'bg-white'}`}>
                            
                            {/* Category Selector */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {[
                                    { id: ErrandCategory.GROCERY_SHOPPING, label: 'Shopping', icon: 'shopping_bag' },
                                    { id: ErrandCategory.PACKAGE_DELIVERY, label: 'Delivery', icon: 'package_2' },
                                    { id: ErrandCategory.GOVT_QUEUE, label: 'Queueing', icon: 'hourglass_empty' },
                                    { id: ErrandCategory.HOME_ESSENTIALS, label: 'Household', icon: 'home_repair_service' },
                                    { id: ErrandCategory.GIFT_EVENT, label: 'Lifestyle', icon: 'favorite' },
                                    { id: ErrandCategory.OFFICE_SUPPLIES, label: 'Business', icon: 'business_center' },
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setErrandCategory(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border-2 ${errandCategory === cat.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-slate-500 hover:border-blue-100'}`}
                                    >
                                        <Icon name={cat.icon} className="text-sm" />
                                        <span className="text-xs font-bold">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="relative flex gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm transition-all">
                                <div className="flex flex-col items-center pt-3 pb-3 shrink-0 w-4">
                                    <div className="w-3 h-3 rounded-full border-[3px] border-blue-300 bg-white"></div>
                                    <div className="w-0.5 flex-1 bg-gray-100 my-1 border-l border-dashed border-gray-300 min-h-[24px]"></div>
                                    {waypoints.map((_, i) => (
                                        <React.Fragment key={i}>
                                            <div className="w-2 h-2 rounded-full bg-blue-400 mb-1"></div>
                                            <div className="w-0.5 flex-1 bg-gray-100 my-1 border-l border-dashed border-gray-200 min-h-[24px]"></div>
                                        </React.Fragment>
                                    ))}
                                    <div className="w-3 h-3 rounded-full bg-blue-600 border-[3px] border-white ring-1 ring-blue-600"></div>
                                </div>

                                <div className="flex-1 flex flex-col gap-4 min-w-0">
                                    <div className="relative">
                                        <label className="text-[10px] text-blue-500 font-bold uppercase mb-1 block">
                                            {errandCategory === ErrandCategory.GOVT_QUEUE ? 'Queue Location' : 
                                             errandCategory === ErrandCategory.PACKAGE_DELIVERY ? 'Pickup Location' : 
                                             'Store / Pickup'}
                                        </label>
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-colors shadow-inner">
                                            <input 
                                                type="text" 
                                                value={pickupAddr} 
                                                onFocus={() => setActiveInput('pickup')} 
                                                onChange={e => setPickupAddr(e.target.value)} 
                                                placeholder={errandCategory === ErrandCategory.GOVT_QUEUE ? "Where is the queue?" : 
                                                             errandCategory === ErrandCategory.PACKAGE_DELIVERY ? 'Where are we picking up the item?' : 
                                                             'Enter store location'} 
                                                className="flex-1 bg-transparent font-bold text-slate-900 outline-none text-sm min-w-0 truncate" 
                                            />
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => handleVoiceInput('pickup')} className={`p-1.5 rounded-full hover:bg-gray-200 ${isListening && activeInput === 'pickup' ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`}>
                                                    <Icon name="mic" className="text-lg" />
                                                </button>
                                                <button onClick={() => handleGeolocate('pickup')} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full"><Icon name="my_location" className="text-lg" /></button>
                                            </div>
                                        </div>
                                    </div>

                                    {waypoints.map((wp, idx) => (
                                        <div key={wp.id} className="relative animate-slide-up">
                                            <label className="text-[10px] text-blue-400 font-bold uppercase block mb-1">Stop {idx + 1}</label>
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-colors">
                                                <input 
                                                    type="text" 
                                                    value={wp.address}
                                                    onFocus={() => setActiveInput(`waypoint-${idx}`)}
                                                    onChange={(e) => {
                                                        const newWps = [...waypoints];
                                                        newWps[idx].address = e.target.value;
                                                        setWaypoints(newWps);
                                                    }}
                                                    placeholder="Add another stop"
                                                    className="flex-1 bg-transparent font-bold text-slate-900 outline-none text-sm min-w-0 truncate"
                                                />
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button onClick={() => handleVoiceInput(`waypoint-${idx}`)} className={`p-1.5 rounded-full hover:bg-gray-200 ${isListening && activeInput === `waypoint-${idx}` ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`}>
                                                        <Icon name="mic" className="text-lg" />
                                                    </button>
                                                    <button onClick={() => setWaypoints(waypoints.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full"><Icon name="close" className="text-lg" /></button>
                                                </div>
                                            </div>
                                            {/* Task for this stop */}
                                            <div className="mt-2 pl-2 border-l-2 border-blue-100 ml-2">
                                                <input
                                                    type="text"
                                                    placeholder={`Task at Stop ${idx + 1} (e.g. Pick up flowers)`}
                                                    className="w-full bg-transparent text-xs font-medium text-slate-600 outline-none placeholder:text-slate-300"
                                                    onChange={(e) => {
                                                        // In a real app, we'd store this in the waypoint object
                                                        // For now, we just append it to the main instructions for simplicity
                                                        if (!instructions.includes(`Stop ${idx + 1}:`)) {
                                                            setInstructions(prev => prev + `\n[Stop ${idx + 1}: ${e.target.value}]`);
                                                        } else {
                                                            setInstructions(prev => prev.replace(new RegExp(`\\[Stop ${idx + 1}: .*\\]`), `[Stop ${idx + 1}: ${e.target.value}]`));
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="relative">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">
                                            {errandCategory === ErrandCategory.PACKAGE_DELIVERY ? 'Drop-off Location' : 'Delivery To'}
                                         </label>
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-colors">
                                            <input 
                                                type="text" 
                                                value={dropoffAddr} 
                                                onFocus={() => setActiveInput('dropoff')} 
                                                onChange={e => setDropoffAddr(e.target.value)} 
                                                placeholder={errandCategory === ErrandCategory.PACKAGE_DELIVERY ? 'Where does the item need to go?' : 'Your address'} 
                                                className="flex-1 bg-transparent font-bold text-slate-900 outline-none text-sm min-w-0 truncate" 
                                            />
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => handleVoiceInput('dropoff')} className={`p-1.5 rounded-full hover:bg-gray-200 ${isListening && activeInput === 'dropoff' ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`}>
                                                    <Icon name="mic" className="text-lg" />
                                                </button>
                                                <button onClick={() => handleGeolocate('dropoff')} className="text-gray-400 hover:bg-gray-50 p-1.5 rounded-full"><Icon name="my_location" className="text-lg" /></button>
                                                {waypoints.length < 3 && (
                                                    <button onClick={() => setWaypoints([...waypoints, { id: Date.now().toString(), address: '', coords: null }])} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full" title="Add stop">
                                                        <Icon name="add_circle" className="text-lg" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {predictions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-blue-100 z-[100] max-h-52 overflow-y-auto overflow-x-hidden">
                                            {predictions.map((p) => (
                                                <div key={p.place_id} onClick={() => selectPlace(p.place_id, p.description)} className="p-3 border-b border-gray-50 text-sm hover:bg-blue-50 cursor-pointer active:bg-blue-100 transition-colors">
                                                    <span className="font-bold block text-slate-900 truncate">{p.structured_formatting.main_text}</span>
                                                    <span className="text-[10px] text-slate-400 truncate">{p.structured_formatting.secondary_text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            
                            {/* --- UNIVERSAL INSTRUCTIONS --- */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-2">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Icon name="notes" className="text-blue-500 text-base" />
                                    Instructions
                                </h3>
                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-start gap-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                                    <textarea 
                                        value={instructions}
                                        onFocus={() => setActiveInput('instructions')}
                                        onChange={e => setInstructions(e.target.value)} 
                                        placeholder="Provide details for your runner..." 
                                        className="flex-1 outline-none text-xs resize-none bg-transparent font-medium py-3 h-20"
                                    />
                                    <div className="flex flex-col items-center gap-2 py-2">
                                        <button onClick={() => handleVoiceInput('instructions')} className={`p-1.5 rounded-full ${isListening && activeInput === 'instructions' ? 'text-red-500 bg-red-100 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}><Icon name="mic" className="text-lg" /></button>
                                        <button className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"><Icon name="attach_file" className="text-lg" /></button>
                                    </div>
                                </div>
                            </div>

                            {/* --- SERVICE ADD-ONS --- */}
                            <div className="grid grid-cols-2 gap-3">
                                <div 
                                    onClick={() => setIsHeavyLoad(!isHeavyLoad)}
                                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-center ${isHeavyLoad ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-100 hover:border-blue-100'}`}
                                >
                                    <Icon name="weight" className={`text-2xl ${isHeavyLoad ? 'text-blue-600' : 'text-slate-300'}`} />
                                    <span className={`text-[10px] font-black uppercase ${isHeavyLoad ? 'text-blue-700' : 'text-slate-400'}`}>Heavy Load</span>
                                    {isHeavyLoad && <span className="text-[9px] font-bold text-blue-500">+R20</span>}
                                </div>

                                <div 
                                    onClick={() => setIsExpress(!isExpress)}
                                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-center ${isExpress ? 'bg-amber-50 border-amber-500' : 'bg-white border-gray-100 hover:border-amber-100'}`}
                                >
                                    <Icon name="bolt" className={`text-2xl ${isExpress ? 'text-amber-500' : 'text-slate-300'}`} />
                                    <span className={`text-[10px] font-black uppercase ${isExpress ? 'text-amber-700' : 'text-slate-400'}`}>Express Priority</span>
                                    {isExpress && <span className="text-[9px] font-bold text-amber-600">+R30-R50</span>}
                                </div>
                            </div>

                            {/* --- ADAPTIVE SECTIONS --- */}
                            {errandCategory === ErrandCategory.GROCERY_SHOPPING && (
                                <div className="animate-fade-in space-y-4">
                                    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${isItemsRetracted ? 'max-h-14' : 'max-h-[600px]'}`}>
                                        <div 
                                            onClick={() => setIsItemsRetracted(!isItemsRetracted)}
                                            className="p-3 border-b border-gray-50 bg-slate-50/50 flex justify-between items-center shrink-0 cursor-pointer hover:bg-slate-100 transition-colors"
                                        >
                                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                                <Icon name="shopping_cart" className="text-blue-500 text-base" />
                                                Shopping List
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{errandItems.length} Items</span>
                                                <Icon name={isItemsRetracted ? "expand_more" : "expand_less"} className="text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="max-h-[300px] overflow-y-auto no-scrollbar p-3 space-y-2">
                                            {errandItems.length === 0 ? (
                                                <div className="py-8 flex flex-col items-center justify-center opacity-30 text-slate-400">
                                                    <Icon name="post_add" className="text-4xl mb-2" />
                                                    <p className="text-[10px] font-bold uppercase">List is empty</p>
                                                </div>
                                            ) : (
                                                errandItems.map(i => (
                                                    <div key={i.id} className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center group animate-fade-in hover:bg-white hover:border-blue-200 transition-all shadow-sm">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div className="size-2 rounded-full bg-blue-400 shadow-sm"></div>
                                                            <span className="font-bold text-slate-700 truncate">{i.name}</span>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setErrandItems(prev => prev.filter(x => x.id !== i.id)); }} 
                                                            className="size-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Icon name="delete" className="text-base" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="p-3 bg-white border-t border-slate-50">
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={newItemName} 
                                                    onChange={e => setNewItemName(e.target.value)} 
                                                    onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                                                    placeholder="Add item (e.g. Milk)" 
                                                    className="flex-1 bg-slate-50 p-2.5 rounded-xl text-xs font-bold border border-slate-100 outline-none focus:bg-white focus:border-blue-300 transition-all" 
                                                />
                                                <button 
                                                    onClick={handleAddItem} 
                                                    className="bg-blue-600 text-white size-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                                                >
                                                    <Icon name="add" className="text-lg font-black" />
                                                </button>
                                            </div>
                                            
                                            <div className="mt-3 flex justify-center gap-3">
                                                <button 
                                                    onClick={() => { setErrandMode('LIST'); setActiveInput(null); startListening(); }}
                                                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                                                >
                                                    <Icon name="mic" className="text-xs" />
                                                    Voice Dictation
                                                </button>
                                                <button 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                                                >
                                                    <Icon name="add_a_photo" className="text-xs" />
                                                    Upload List
                                                </button>
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef} 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    onChange={handleFileUpload} 
                                                />
                                            </div>
                                            
                                            {shoppingListImage && (
                                                <div className="mt-3 relative group">
                                                    <img src={shoppingListImage} alt="Shopping List" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                                                    <button 
                                                        onClick={() => setShoppingListImage(null)}
                                                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                                    >
                                                        <Icon name="close" className="text-sm" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full bg-white border border-gray-200 rounded-xl px-3 flex flex-col justify-center shadow-sm py-2">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-0.5">Estimated Cost of Goods</span>
                                        <div className="flex items-center">
                                            <span className="text-xs font-black text-slate-400 mr-1">R</span>
                                            <input type="number" value={estimatedGoodsCost} onChange={e => setEstimatedGoodsCost(e.target.value)} placeholder="0" className="w-full bg-transparent outline-none text-sm font-black text-slate-800" />
                                        </div>
                                    </div>
                                </div>
                            )}



                            <div className="relative h-[180px] w-full min-h-[150px] shrink-0 rounded-2xl overflow-hidden border-4 border-white shadow-lg ring-1 ring-black/5 bg-gray-200">
                                <div ref={mapContainerRef} className="w-full h-full opacity-90" />
                                
                                {/* Standardized Map Controls Stack (Bottom Right) */}
                                <div className="absolute right-3 bottom-4 flex flex-col gap-2 z-10">
                                    <button onClick={geolocateCenter} className="size-8 bg-white/90 backdrop-blur rounded-lg shadow flex items-center justify-center text-primary active:scale-90 border border-primary/10">
                                        <Icon name="my_location" className="text-base" />
                                    </button>
                                    <div className="flex flex-col rounded-lg bg-white/90 backdrop-blur shadow border border-slate-100 overflow-hidden">
                                        <button onClick={zoomIn} className="size-8 flex items-center justify-center text-slate-700 active:bg-slate-50 border-b border-slate-100"><Icon name="zoom_in" className="text-base" /></button>
                                        <button onClick={zoomOut} className="size-8 flex items-center justify-center text-slate-700 active:bg-slate-50"><Icon name="zoom_out" className="text-base" /></button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-slate-50">
                    {options?.map(opt => (
                        <div key={opt.id} onClick={() => setSelectedRide(opt.id)} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${selectedRide === opt.id ? 'border-blue-500 bg-white shadow-md' : 'border-transparent bg-white shadow-sm hover:border-blue-100'}`}>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-rounded text-2xl text-blue-600">{opt.icon}</span>
                                <div><p className="font-extrabold text-slate-900">{opt.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{opt.desc}</p></div>
                            </div>
                            <p className="font-black text-lg text-slate-900">R{opt.price}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 pb-safe-action shrink-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            {step === 'vehicle' && (
                <p className="text-[10px] text-center text-slate-400 font-medium mb-3 px-4">
                    Rates are calculated based on your specific zone and traffic conditions. Prices are final.
                </p>
            )}
            {step === 'details' ? (
                <Button 
                    fullWidth 
                    onClick={() => setStep('vehicle')} 
                    disabled={!pickupAddr || !dropoffAddr}
                    className="!rounded-2xl !h-14 font-black text-lg shadow-xl shadow-blue-500/20"
                >
                    Next: Choose Runner
                </Button>
            ) : (
                <Button 
                    fullWidth 
                    onClick={handleRequest} 
                    disabled={isSubmitting}
                    className="!rounded-2xl !h-14 font-black text-lg !bg-blue-600 !text-white shadow-xl shadow-blue-500/20"
                >
                    {isSubmitting ? 'Processing...' : 'Confirm Errand'}
                </Button>
            )}
        </div>
    </div>
  );
};
