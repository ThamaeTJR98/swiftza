
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../Icons';

interface EditProfileProps {
    onBack: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ onBack }) => {
    const { user, updateUserProfile } = useApp();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.profileUrl || '');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setAvatarUrl(ev.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !phone.trim()) {
            alert("Name and Phone are required.");
            return;
        }
        if (!avatarUrl) {
            alert("Mandatory Profile Picture: Please upload a clear photo of yourself for safety.");
            return;
        }

        setIsSaving(true);
        try {
            await updateUserProfile({
                full_name: name,
                phone: phone,
                avatar_url: avatarUrl
                // Email update is skipped for now as it usually requires re-auth
            });
            onBack();
        } catch (error) {
            console.error(error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans animate-slide-up h-[100dvh]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 pt-safe-top border-b border-slate-100 bg-white sticky top-0 z-20 h-[60px]">
                <button 
                    onClick={onBack}
                    className="size-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors active:scale-90"
                >
                    <Icon name="arrow_back_ios_new" className="text-lg" />
                </button>
                <h2 className="text-slate-900 text-sm font-bold uppercase tracking-wide">Edit Profile</h2>
                <div className="w-9"></div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-40">
                
                {/* Avatar Uploader */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-lg bg-slate-100 flex items-center justify-center relative">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Icon name="person" className="text-5xl text-slate-300" />
                            )}
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icon name="add_a_photo" className="text-white text-2xl" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md border-2 border-white">
                            <Icon name="edit" className="text-sm" />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    <p className="text-xs text-slate-400 mt-3 font-medium">Tap to change photo (Mandatory)</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <Icon name="person" className="text-slate-400 text-lg" />
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-900"
                                placeholder="Enter your name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Phone Number</label>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <Icon name="call" className="text-slate-400 text-lg" />
                            <input 
                                type="tel" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-900"
                                placeholder="082 123 4567"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                        <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 opacity-70">
                            <Icon name="markunread_mailbox" className="text-slate-400 text-lg" />
                            <input 
                                type="email" 
                                value={email} 
                                disabled
                                className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-500 cursor-not-allowed"
                            />
                            <Icon name="lock" className="text-slate-400 text-sm" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 pl-1">Email cannot be changed directly.</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 pb-10 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.03)] relative z-20">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-black disabled:opacity-70"
                >
                    {isSaving ? (
                        <span className="material-symbols-rounded animate-spin">progress_activity</span>
                    ) : (
                        <>
                            <Icon name="check" className="text-lg" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>,
        document.body
    );
};
