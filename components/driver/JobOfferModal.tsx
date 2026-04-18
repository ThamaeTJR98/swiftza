import React, { useEffect, useRef, useState } from 'react';
import { RideRequest } from '../../types';
import { loadGoogleMaps } from '../../utils/mapLoader';
import { Icon } from '../Icons';

declare var google: any;

interface JobOfferModalProps {
  job: RideRequest;
  onAccept: (job: RideRequest) => void;
  onDecline: (id: string) => void;
}

export const JobOfferModal: React.FC<JobOfferModalProps> = ({ job, onAccept, onDecline }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [viewState, setViewState] = useState<'OFFER' | 'DECLINE_REASON'>('OFFER');
  const [isErrandSummaryExpanded, setIsErrandSummaryExpanded] = useState(false);

  useEffect(() => {
      if (viewState === 'OFFER') {
          loadGoogleMaps().then(() => {
              if (mapRef.current && !mapInstanceRef.current && typeof google !== 'undefined') {
                  const map = new google.maps.Map(mapRef.current, {
                      zoom: 13,
                      center: { lat: job.pickup.lat, lng: job.pickup.lng },
                      disableDefaultUI: true,
                      zoomControl: false,
                      gestureHandling: 'greedy', 
                      styles: [
                          { featureType: "all", elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
                          { featureType: "poi", stylers: [{ visibility: "off" }] }
                      ]
                  });

                  mapInstanceRef.current = map;

                  const bounds = new google.maps.LatLngBounds();
                  const directionsService = new google.maps.DirectionsService();
                  const directionsRenderer = new google.maps.DirectionsRenderer({
                      map,
                      suppressMarkers: true,
                      polylineOptions: { strokeColor: job.type === 'errand' ? '#3b82f6' : '#00C4B4', strokeWeight: 5, strokeOpacity: 0.9 }
                  });

                  const pMarker = new google.maps.Marker({
                      position: { lat: job.pickup.lat, lng: job.pickup.lng },
                      map,
                      icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 5,
                          fillColor: "#00C4B4",
                          fillOpacity: 1,
                          strokeWeight: 2,
                          strokeColor: "#ffffff"
                      }
                  });
                  bounds.extend({ lat: job.pickup.lat, lng: job.pickup.lng });

                  const dMarker = new google.maps.Marker({
                      position: { lat: job.dropoff.lat, lng: job.dropoff.lng },
                      map,
                      icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 5,
                          fillColor: "#0f172a",
                          fillOpacity: 1,
                          strokeWeight: 2,
                          strokeColor: "#ffffff"
                      }
                  });
                  bounds.extend({ lat: job.dropoff.lat, lng: job.dropoff.lng });

                  directionsService.route({
                      origin: { lat: job.pickup.lat, lng: job.pickup.lng },
                      destination: { lat: job.dropoff.lat, lng: job.dropoff.lng },
                      travelMode: google.maps.TravelMode.DRIVING
                  }, (result: any, status: any) => {
                      if (status === 'OK') {
                          directionsRenderer.setDirections(result);
                          map.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 });
                      }
                  });
              }
          }).catch(console.error);
      }
  }, [job, viewState]);

  const handleZoomIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
      }
  };

  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
      if (isAccepting) return;
      setIsAccepting(true);
      try {
          await onAccept(job);
      } catch (e: any) {
          // The error message from the RPC will be caught here
          alert(e.message || "This job was just taken by another provider.");
          onDecline(job.id); // Close modal if failed
      } finally {
          setIsAccepting(false);
      }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
      }
  };

  if (viewState === 'DECLINE_REASON') {
      return (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onDecline(job.id)}></div>
            <div className="bg-white w-full rounded-t-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col animate-slide-up pb-safe-action">
                <div className="flex h-6 w-full items-center justify-center shrink-0 mt-2">
                    <div className="h-1.5 w-12 rounded-full bg-gray-200"></div>
                </div>
                <div className="px-6 pb-10">
                    <div className="text-center mb-6 mt-2">
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Decline Job?</h2>
                        <p className="text-gray-500 text-sm mt-1">Select a reason to help us match you better.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {['Too far away', 'Price too low', 'Unsafe area', 'Wrong vehicle'].map((reason) => (
                            <button 
                                key={reason}
                                onClick={() => onDecline(job.id)}
                                className="flex items-center justify-between w-full p-3.5 bg-gray-50 hover:bg-red-50 border border-gray-100 rounded-xl transition-all active:scale-[0.98]"
                            >
                                <span className="font-bold text-gray-700 text-sm">{reason}</span>
                                <Icon name="chevron_right" className="text-gray-300" />
                            </button>
                        ))}
                    </div>
                    <button onClick={() => onDecline(job.id)} className="w-full mt-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Close
                    </button>
                </div>
            </div>
        </div>
      );
  }

  const isErrand = job.type === 'errand' || job.type === 'move';

  return (
      <div className="fixed inset-0 z-[200] flex flex-col justify-center items-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewState('DECLINE_REASON')}></div>

          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col animate-slide-up ring-1 ring-black/5">
              
              {/* Dynamic Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-50 shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {job.type === 'errand' ? 'New Errand Request' : job.type === 'move' ? 'New Move Request' : 'New Ride Request'}
                  </span>
                  <button onClick={() => setViewState('DECLINE_REASON')} className="size-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Icon name="close" className="text-base" />
                  </button>
              </div>

              <div className="p-4 space-y-4">
                  {/* Map & Addresses */}
                  <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden h-32 border-2 border-slate-50 shadow-inner bg-slate-100">
                          <div ref={mapRef} className="w-full h-full" />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-white/50">
                              <p className="text-[10px] font-black text-slate-900 uppercase">{job.type}</p>
                          </div>
                          
                          {/* ZOOM CONTROLS */}
                          <div className="absolute bottom-2 right-2 flex flex-col gap-1.5">
                              <button 
                                onClick={handleZoomIn}
                                className="size-8 bg-white/90 backdrop-blur-md rounded-lg shadow-md flex items-center justify-center text-slate-800 active:scale-90 border border-slate-100 hover:bg-white transition-all"
                              >
                                <Icon name="add" className="text-lg font-black" />
                              </button>
                              <button 
                                onClick={handleZoomOut}
                                className="size-8 bg-white/90 backdrop-blur-md rounded-lg shadow-md flex items-center justify-center text-slate-800 active:scale-90 border border-slate-100 hover:bg-white transition-all"
                              >
                                <Icon name="remove" className="text-lg font-black" />
                              </button>
                          </div>
                      </div>

                      <div className="flex flex-col gap-2.5 px-1">
                          <div className="flex items-start gap-3">
                              <div className="size-2 rounded-full bg-brand-teal mt-1.5 shadow-[0_0_8px_rgba(0,196,180,0.5)]"></div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-slate-900 leading-none truncate">{job.pickup.address.split(',')[0]}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pickup Location</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="size-2 rounded-full bg-slate-900 mt-1.5"></div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-slate-900 leading-none truncate">{job.dropoff.address.split(',')[0]}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Destination</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Errand Specific Summary Details */}
                  {isErrand && (
                    <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 space-y-2 transition-all duration-300">
                        <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setIsErrandSummaryExpanded(!isErrandSummaryExpanded)}
                        >
                            <h5 className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                                {job.type === 'move' ? 'Move Details' : 'Errand Summary'}
                                <Icon name={isErrandSummaryExpanded ? "expand_less" : "expand_more"} className="text-sm" />
                            </h5>
                            <div className="flex gap-1.5">
                                {job.errandDetails?.helpersCount && (
                                    <span className="text-[9px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Icon name="group" className="text-[8px]" />
                                        {job.errandDetails.helpersCount} Helpers
                                    </span>
                                )}
                                <span className="text-[9px] font-black text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                                    {job.errandDetails?.items?.length || 0} Items
                                </span>
                            </div>
                        </div>
                        
                        {isErrandSummaryExpanded && (
                            <div className="flex gap-3 animate-slide-up origin-top">
                                <div className="size-9 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    <Icon name={job.type === 'move' ? "local_shipping" : "shopping_bag"} className="text-xl" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-slate-700 leading-tight">
                                        "{job.errandDetails?.instructions || 'Standard move request'}"
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">{job.errandDetails?.category?.replace(/_/g, ' ')}</span>
                                        {job.errandDetails?.packageSize && (
                                            <>
                                                <span className="text-[9px] text-slate-300">•</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">{job.errandDetails.packageSize}</span>
                                            </>
                                        )}
                                    </div>
                                    {job.errandDetails?.items && job.errandDetails.items.length > 0 && (
                                        <div className="mt-2 space-y-1 border-t border-blue-100/50 pt-2">
                                            {job.errandDetails.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-600 font-medium truncate pr-2">{item.name}</span>
                                                    <span className="text-slate-400 font-bold shrink-0">x{item.quantity}</span>
                                                </div>
                                            ))}
                                            {job.errandDetails.items.length > 3 && (
                                                <p className="text-[9px] text-blue-500 font-bold italic mt-1">
                                                    + {job.errandDetails.items.length - 3} more items
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                  )}

                  {/* Compact Stats Grid */}
                  <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Earning</p>
                          <p className="text-base font-black text-slate-900 leading-none">R{job.price.toFixed(0)}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Distance</p>
                          <p className="text-xs font-black text-slate-800 leading-none mt-1">{job.distance}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                          <div className="flex items-center justify-center gap-0.5 mt-1">
                              <span className="text-xs font-black text-slate-800 leading-none">4.9</span>
                              <Icon name="star" className="text-[10px] text-brand-gold fill-current" />
                          </div>
                      </div>
                  </div>

                  {/* Single Line Passenger/Payment */}
                  <div className="flex items-center justify-between px-2 py-1">
                      <div className="flex items-center gap-2 max-w-[60%]">
                          <div className="size-8 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0 shadow-sm">
                              <img src={`https://i.pravatar.cc/80?u=${job.id}`} alt="Rider" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-black text-slate-900 truncate">{job.errandDetails?.recipientName || 'Sarah Jenkins'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-1.5 rounded-xl shadow-md shrink-0">
                          <Icon name="account_balance_wallet" className="text-brand-teal text-xs" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{job.paymentMethod}</span>
                      </div>
                  </div>
              </div>

              {/* High Energy Footer */}
              <div className="p-4 pt-0 pb-safe-action space-y-2">
                  <button 
                      onClick={handleAccept}
                      disabled={isAccepting}
                      className={`w-full ${isAccepting ? 'bg-slate-100 text-slate-400' : 'bg-brand-teal hover:bg-[#20d87d] text-slate-900'} font-black py-4 rounded-2xl transition-all shadow-xl shadow-brand-teal/10 active:scale-[0.98] flex items-center justify-center gap-2 text-base uppercase tracking-widest disabled:cursor-not-allowed`}
                  >
                      {isAccepting ? (
                          <>
                            <span className="animate-spin material-symbols-rounded text-xl">progress_activity</span>
                            Securing Job...
                          </>
                      ) : (
                          <>
                              Accept Job
                              <Icon name="arrow_forward" className="text-lg font-black" />
                          </>
                      )}
                  </button>
                  {!isAccepting && (
                    <button 
                        onClick={() => setViewState('DECLINE_REASON')}
                        className="w-full text-slate-400 font-bold py-2 text-[10px] uppercase tracking-[0.2em] active:opacity-50"
                    >
                        Decline Request
                    </button>
                  )}
              </div>

              <div className="pb-safe-action text-center pt-2">
                  <p className="text-slate-300 text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 opacity-60">
                      <Icon name="verified_user" className="text-[10px]" />
                      Verified SwiftZA Security
                  </p>
              </div>
          </div>
      </div>
  );
};