
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icons';
import { useApp } from '../../context/AppContext';
import { loadGoogleMaps } from '../../utils/mapLoader';

declare var google: any;

interface SavedPlacesProps {
    onBack: () => void;
}

const FAVORITES_DATA = [
    { id: 'home', icon: 'home', label: 'Home', address: '150 Rivonia Rd, Sandton, Johannesburg', type: 'fav' },
    { id: 'work', icon: 'work', label: 'Work', address: '82 Maude St, Sandown, Sandton', type: 'fav' }
];

const INITIAL_OTHER_PLACES = [
    { id: 'gym', icon: 'fitness_center', label: 'Virgin Active', address: 'Alice Lane, Sandton', type: 'other' },
    { id: 'mom', icon: 'favorite', label: "Mom's House", address: '45 Jan Smuts Ave, Parktown', type: 'other' },
    { id: 'mall', icon: 'shopping_bag', label: 'Mall of Africa', address: 'Magwa Cres, Midrand', type: 'other' },
    { id: 'coffee', icon: 'coffee', label: 'Starbucks Rosebank', address: 'Rosebank Mall, Bath Ave', type: 'other' },
];

const PLACE_ICONS = [
    { id: 'home', label: 'Home' },
    { id: 'work', label: 'Work' },
    { id: 'fitness_center', label: 'Gym' },
    { id: 'shopping_bag', label: 'Mall' },
    { id: 'school', label: 'School' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'restaurant', label: 'Food' },
    { id: 'local_hospital', label: 'Health' },
    { id: 'park', label: 'Park' },
    { id: 'place', label: 'Other' }
];

export const SavedPlaces: React.FC<SavedPlacesProps> = ({ onBack }) => {
    const { user } = useApp();
    const [sections, setSections] = useState({ favs: true, other: true });
    const [searchQuery, setSearchQuery] = useState('');

    // --- Data State ---
    const [savedPlaces, setSavedPlaces] = useState<any[]>(user?.isDemo ? INITIAL_OTHER_PLACES : []);
    
    // --- Add Place Flow State ---
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('place');

    // --- Map State ---
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const geocoderRef = useRef<any>(null);

    // --- Filter Logic ---
    const favsList = user?.isDemo ? FAVORITES_DATA : [];
    
    const filteredFavs = favsList.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.address.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredOther = savedPlaces.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleSection = (section: 'favs' | 'other') => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        alert(`Edit feature coming soon for item: ${id}`);
    };

    const handleSelect = (place: any) => {
        console.log("Selected:", place);
    };

    const handleSaveNewPlace = () => {
        if (!newLabel.trim() || !newAddress.trim()) {
            alert("Please enter a name and address.");
            return;
        }

        const newPlace = {
            id: Date.now().toString(),
            icon: selectedIcon,
            label: newLabel,
            address: newAddress,
            type: 'other'
        };

        setSavedPlaces(prev => [newPlace, ...prev]);
        setSections(prev => ({ ...prev, other: true }));
        
        // Reset and close
        setNewLabel('');
        setNewAddress('');
        setSelectedIcon('place');
        setIsAdding(false);
    };

    const handleLocateMe = () => {
        if (navigator.geolocation && mapInstance.current && markerRef.current && geocoderRef.current && typeof google !== 'undefined') {
             navigator.geolocation.getCurrentPosition((pos) => {
                const userLoc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                mapInstance.current.setCenter(userLoc);
                mapInstance.current.setZoom(17);
                markerRef.current.setPosition(userLoc);
                
                geocoderRef.current.geocode({ location: userLoc }, (results: any, status: any) => {
                    if (status === 'OK' && results[0]) {
                        setNewAddress(results[0].formatted_address);
                    }
                });
            });
        }
    };

    useEffect(() => {
        if (isAdding) {
            loadGoogleMaps().then(() => {
                if (!mapRef.current || mapInstance.current || typeof google === 'undefined') return;

                const sandton = { lat: -26.1076, lng: 28.0567 };
                
                geocoderRef.current = new google.maps.Geocoder();
                
                mapInstance.current = new google.maps.Map(mapRef.current, {
                    center: sandton,
                    zoom: 14,
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                        { featureType: "all", elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
                        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
                        { featureType: "poi", stylers: [{ visibility: "off" }] }
                    ]
                });

                markerRef.current = new google.maps.Marker({
                    position: sandton,
                    map: mapInstance.current,
                    draggable: true,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#00C4B4",
                        fillOpacity: 1,
                        strokeWeight: 3,
                        strokeColor: "#ffffff"
                    }
                });

                const updateFromMap = (latLng: any) => {
                    markerRef.current.setPosition(latLng);
                    mapInstance.current.panTo(latLng);
                    
                    geocoderRef.current.geocode({ location: latLng }, (results: any, status: any) => {
                        if (status === 'OK' && results[0]) {
                            setNewAddress(results[0].formatted_address);
                        }
                    });
                };

                mapInstance.current.addListener('click', (e: any) => updateFromMap(e.latLng));
                markerRef.current.addListener('dragend', (e: any) => updateFromMap(e.latLng));

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const userLoc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                        mapInstance.current.setCenter(userLoc);
                        mapInstance.current.setZoom(16);
                        markerRef.current.setPosition(userLoc);
                    });
                }
            }).catch(console.error);
        } else {
            mapInstance.current = null;
        }
    }, [isAdding]);

    const renderPlaceItem = (item: any, isFav: boolean = false) => (
        <div 
            key={item.id}
            onClick={() => handleSelect(item)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group border-b border-slate-50 last:border-0"
        >
            <div className={`flex items-center justify-center rounded-xl shrink-0 size-10 shadow-sm transition-colors ${isFav ? 'bg-primary/10 text-primary group-hover:bg-primary/20' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                <Icon name={item.icon} className="text-xl" style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-sm font-bold leading-tight truncate">{item.label}</p>
                <p className="text-slate-500 text-[10px] font-medium leading-tight truncate mt-0.5">{item.address}</p>
            </div>
            <div className="shrink-0 flex items-center gap-1">
                <button 
                    onClick={(e) => handleEdit(e, item.id)} 
                    className="p-1.5 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
                >
                    <Icon name="edit" className="text-lg" />
                </button>
                <Icon name="chevron_right" className="text-slate-300 text-lg group-hover:text-slate-400" />
            </div>
        </div>
    );

    // --- ADD PLACE VIEW (Full Screen Overlay) ---
    if (isAdding) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-white font-sans animate-slide-up">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 pt-safe-top border-b border-slate-100 shrink-0 h-[60px] bg-white">
                    <button 
                        onClick={() => setIsAdding(false)} 
                        className="size-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors active:scale-90"
                    >
                        <Icon name="close" className="text-lg" />
                    </button>
                    <h2 className="text-slate-900 text-lg font-bold">Add New Place</h2>
                </div>

                {/* Form */}
                <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6 bg-slate-50/30">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Name / Label</label>
                        <input 
                            type="text" 
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="e.g. Gym, School, My Flat"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            autoFocus
                        />
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Location</label>
                        <input 
                            type="text" 
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="Enter address or tap map"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all mb-4"
                        />
                        
                        {/* Interactive Map */}
                        <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-gray-100">
                            <div ref={mapRef} className="w-full h-full" />
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                                <button 
                                    onClick={handleLocateMe}
                                    className="size-10 bg-white rounded-xl shadow-md flex items-center justify-center text-slate-600 active:scale-90 hover:bg-slate-50 transition-all"
                                >
                                    <Icon name="my_location" className="text-xl text-primary" />
                                </button>
                            </div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-white/50 pointer-events-none">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tap to place pin</p>
                            </div>
                        </div>
                    </div>

                    {/* Icon Selection Grid */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Choose Icon</label>
                        <div className="grid grid-cols-5 gap-3">
                            {PLACE_ICONS.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => setSelectedIcon(item.id)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all active:scale-95 ${selectedIcon === item.id ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-slate-50 text-slate-400'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${selectedIcon === item.id ? 'bg-primary text-white shadow-md' : 'bg-slate-100'}`}>
                                        <Icon name={item.id} className="text-lg" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase truncate w-full text-center">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Action - Safe Area */}
                <div className="p-4 border-t border-slate-100 pb-safe bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                    <button 
                        onClick={handleSaveNewPlace}
                        disabled={!newLabel || !newAddress}
                        className={`w-full h-14 rounded-2xl font-bold text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${(!newLabel || !newAddress) ? 'bg-slate-100 text-slate-400' : 'bg-primary text-slate-900 shadow-primary/20'}`}
                    >
                        <Icon name="check" className="text-xl" />
                        Save Place
                    </button>
                </div>
            </div>
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white font-sans animate-slide-up h-[100dvh]">
            
            {/* 1. Compact Header */}
            <div className="flex items-center justify-between px-4 py-3 pt-safe-top border-b border-slate-100 bg-white z-20 shrink-0 h-[60px]">
                <button 
                    onClick={onBack} 
                    className="size-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors active:scale-90"
                >
                    <Icon name="arrow_back_ios_new" className="text-lg" />
                </button>
                <h2 className="text-slate-900 text-sm font-bold uppercase tracking-wide">Saved Places</h2>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="size-9 flex items-center justify-center rounded-full text-primary bg-primary/5 hover:bg-primary/10 transition-colors active:scale-90"
                >
                    <Icon name="add" className="text-2xl" />
                </button>
            </div>

            {/* 2. Content Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                
                {/* Search (Sticky) */}
                <div className="px-4 py-3 shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-50">
                    <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/50 rounded-xl px-3 py-2.5 transition-all focus-within:bg-white focus-within:border-primary/30 focus-within:shadow-sm focus-within:ring-2 focus-within:ring-primary/5">
                        <Icon name="search" className="text-slate-400 text-lg" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your places..." 
                            className="flex-1 bg-transparent outline-none text-xs text-slate-800 placeholder-slate-400 font-bold"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                                <Icon name="cancel" className="text-base" />
                            </button>
                        )}
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
                    
                    {/* Favorites Section */}
                    {filteredFavs.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <button 
                                onClick={() => toggleSection('favs')}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50"
                            >
                                <div className="flex items-center gap-2">
                                    <Icon name="star" className="text-primary text-base" />
                                    <h3 className="text-slate-800 text-xs font-extrabold uppercase tracking-wide">Favorites</h3>
                                </div>
                                <div className={`transition-transform duration-300 ${sections.favs ? 'rotate-180' : ''}`}>
                                    <Icon name="expand_more" className="text-slate-400 text-lg" />
                                </div>
                            </button>
                            
                            <div className={`transition-all duration-300 ease-in-out ${sections.favs ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                {filteredFavs.map((item) => renderPlaceItem(item, true))}
                            </div>
                        </div>
                    )}

                    {/* Other Places Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <button 
                            onClick={() => toggleSection('other')}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50"
                        >
                            <div className="flex items-center gap-2">
                                <Icon name="place" className="text-slate-400 text-base" />
                                <h3 className="text-slate-800 text-xs font-extrabold uppercase tracking-wide">Other Places</h3>
                            </div>
                             <div className={`transition-transform duration-300 ${sections.other ? 'rotate-180' : ''}`}>
                                <Icon name="expand_more" className="text-slate-400 text-lg" />
                            </div>
                        </button>

                         <div className={`transition-all duration-300 ease-in-out ${sections.other ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            {filteredOther.length > 0 ? (
                                filteredOther.map((item) => renderPlaceItem(item))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-xs text-slate-400 italic">No saved places found.</p>
                                    <button className="mt-2 text-xs font-bold text-primary hover:underline" onClick={() => setIsAdding(true)}>Add one now</button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Add New Footer Action - Visible in List View */}
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
                    >
                        <Icon name="add_location" className="text-lg" />
                        Add New Place
                    </button>

                </div>
            </div>
        </div>,
        document.body
    );
};
