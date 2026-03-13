
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppView, SavedPlace } from '../types';
import { Icon } from '../components/Icons';
import { LocationSearch } from '../components/LocationSearch';

const ICONS = ['home', 'work', 'favorite', 'school', 'local_mall', 'restaurant', 'fitness_center'];

export const SavedPlaces: React.FC = () => {
    const { savedPlaces, addSavedPlace, updateSavedPlace, deleteSavedPlace, navigate } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);

    const handleAddNew = () => {
        setEditingPlace(null);
        setIsAdding(true);
    };

    const handleEdit = (place: SavedPlace) => {
        setIsAdding(false);
        setEditingPlace(place);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingPlace(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this place?')) {
            try {
                await deleteSavedPlace(id);
            } catch (error) {
                console.error("Failed to delete place:", error);
                alert("Failed to delete place. Please try again.");
            }
        }
    };

    if (isAdding || editingPlace) {
        return <PlaceEditor place={editingPlace} onSave={handleCancel} onCancel={handleCancel} />;
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="bg-white p-4 pt-safe-top border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate(AppView.HOME)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                    <Icon name="arrow_back" className="text-slate-700 text-2xl" />
                </button>
                <h1 className="text-lg font-black text-slate-900">Saved Places</h1>
            </header>

            <main className="flex-1 p-4 space-y-3 overflow-y-auto">
                {savedPlaces.map(place => (
                    <div key={place.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Icon name={place.icon} className="text-slate-500 text-2xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{place.name}</p>
                            <p className="text-xs text-slate-500 truncate">{place.address}</p>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => handleEdit(place)} className="size-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
                                <Icon name="edit" className="text-base" />
                            </button>
                            <button onClick={() => handleDelete(place.id)} className="size-9 flex items-center justify-center rounded-full hover:bg-red-50 text-red-500">
                                <Icon name="delete" className="text-base" />
                            </button>
                        </div>
                    </div>
                ))}
                 {savedPlaces.length === 0 && (
                    <div className="text-center py-12">
                        <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="bookmark" className="text-slate-400 text-4xl" />
                        </div>
                        <h3 className="font-bold text-slate-700">No Saved Places Yet</h3>
                        <p className="text-sm text-slate-500 mt-1">Add your frequent spots for quicker bookings.</p>
                    </div>
                )}
            </main>

            <footer className="p-4 pb-safe bg-white border-t border-slate-100">
                <button onClick={handleAddNew} className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2">
                    <Icon name="add_location" />
                    Add New Place
                </button>
            </footer>
        </div>
    );
};

interface PlaceEditorProps {
    place: SavedPlace | null;
    onSave: () => void;
    onCancel: () => void;
}

const PlaceEditor: React.FC<PlaceEditorProps> = ({ place, onSave, onCancel }) => {
    const { addSavedPlace, updateSavedPlace } = useApp();
    const [name, setName] = useState(place?.name || '');
    const [address, setAddress] = useState(place?.address || '');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(place ? { lat: place.lat, lng: place.lng } : null);
    const [icon, setIcon] = useState(place?.icon || 'home');
    const [isLoading, setIsLoading] = useState(false);

    const handleLocationSelect = (details: { address: string; lat: number; lng: number }) => {
        setAddress(details.address);
        setLocation({ lat: details.lat, lng: details.lng });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address || !location) {
            alert("Please fill all fields and select a location.");
            return;
        }

        setIsLoading(true);
        try {
            const placeData = { name, address, lat: location.lat, lng: location.lng, icon };
            if (place) {
                await updateSavedPlace(place.id, placeData);
            } else {
                await addSavedPlace(placeData);
            }
            onSave();
        } catch (error) {
            console.error("Failed to save place:", error);
            alert("Failed to save place. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <header className="bg-white p-4 pt-safe-top border-b border-slate-100 flex items-center gap-4 sticky top-0 z-20">
                <button onClick={onCancel} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                    <Icon name="close" className="text-slate-700 text-2xl" />
                </button>
                <h1 className="text-lg font-black text-slate-900">{place ? 'Edit Place' : 'Add New Place'}</h1>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-6 overflow-y-auto">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                    <LocationSearch onLocationSelect={handleLocationSelect} initialValue={address} />
                </div>
                <div>
                    <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Label</label>
                    <input 
                        id="name" 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="e.g., Mom's House, Gym" 
                        className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:bg-white focus:border-brand-teal"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Icon</label>
                    <div className="grid grid-cols-7 gap-2 mt-2">
                        {ICONS.map(iconName => (
                            <button 
                                key={iconName} 
                                type="button"
                                onClick={() => setIcon(iconName)}
                                className={`h-12 rounded-xl flex items-center justify-center border-2 transition-all ${icon === iconName ? 'bg-brand-teal/10 border-brand-teal' : 'bg-slate-50 border-slate-100'}`}
                            >
                                <Icon name={iconName} className={`text-2xl ${icon === iconName ? 'text-brand-teal' : 'text-slate-400'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </form>

            <footer className="p-4 pb-safe bg-white border-t border-slate-100">
                <button onClick={handleSubmit} disabled={isLoading} className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
                    {isLoading ? <span className="animate-spin material-symbols-rounded">progress_activity</span> : 'Save Place'}
                </button>
            </footer>
        </div>
    );
};
