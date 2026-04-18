import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icons';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface ReportProblemModalProps {
    rideId: string;
    onClose: () => void;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ rideId, onClose }) => {
    const { user } = useApp();
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const reasons = [
        'Items missing from errand',
        'Items damaged during move',
        'Driver was unprofessional',
        'Overcharged / Price dispute',
        'Safety concern',
        'Other'
    ];

    const handleSubmit = async () => {
        if (!reason || !user) return;
        
        setIsSubmitting(true);
        try {
            let evidence_url = null;

            // 1. Upload Evidence if provided
            if (evidenceFile) {
                const fileExt = evidenceFile.name.split('.').pop();
                const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('disputes')
                    .upload(fileName, evidenceFile);

                if (uploadError) {
                    console.error("Upload Error:", uploadError);
                    // We continue even if upload fails, but ideally we'd alert the user
                } else if (uploadData) {
                    const { data: publicUrlData } = supabase.storage
                        .from('disputes')
                        .getPublicUrl(fileName);
                    evidence_url = publicUrlData.publicUrl;
                }
            }

            // 2. Create Dispute Record
            const { error } = await supabase.from('disputes').insert({
                ride_id: rideId,
                reporter_id: user.id,
                reason,
                description,
                evidence_url,
                status: 'PENDING'
            });

            if (error) throw error;
            
            setIsSuccess(true);
            setTimeout(onClose, 2000);
        } catch (err) {
            console.error("Dispute Error:", err);
            alert("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File is too large. Please select an image under 5MB.");
                return;
            }
            setEvidenceFile(file);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 pb-safe animate-slide-up shadow-2xl flex flex-col max-h-[90dvh]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-xl font-extrabold text-slate-900">Report a Problem</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <Icon name="close" className="text-xl" />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="py-12 text-center animate-fade-in flex-1 overflow-y-auto">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <Icon name="check_circle" className="text-5xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Report Received</h3>
                        <p className="text-slate-500">Our support team will investigate and get back to you within 24 hours.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Why are you reporting this?</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {reasons.map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setReason(r)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-bold ${
                                                reason === r 
                                                ? 'border-primary bg-primary/5 text-primary' 
                                                : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Additional Details (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell us more about what happened..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-primary outline-none min-h-[100px] resize-none mb-4"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Evidence (Optional)</label>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={`w-full border-2 border-dashed rounded-2xl p-4 flex items-center justify-center gap-3 transition-colors ${
                                        evidenceFile ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                                    }`}>
                                        <Icon name={evidenceFile ? "check_circle" : "add_photo_alternate"} className="text-xl" />
                                        <span className="text-sm font-bold truncate">
                                            {evidenceFile ? evidenceFile.name : 'Upload Photo (Max 5MB)'}
                                        </span>
                                    </div>
                                </div>
                                {evidenceFile && (
                                    <button 
                                        onClick={() => setEvidenceFile(null)}
                                        className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-wider hover:underline"
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 pt-4 mt-auto">
                            <button
                                onClick={handleSubmit}
                                disabled={!reason || isSubmitting}
                                className={`w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                                    (!reason || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin material-symbols-rounded">progress_activity</span>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Report'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};
