import React, { useState } from 'react';
import { Icon } from '../../../../Icons';
import { ErrandItem } from '../../../../../types';

interface Props {
    item: ErrandItem;
    onConfirm: (subName: string, subPrice: number) => void;
    onCancel: () => void;
}

export const RunnerSubstituteModal: React.FC<Props> = ({ item, onConfirm, onCancel }) => {
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState('');

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
        <div className="w-full bg-white rounded-t-[2rem] shadow-2xl overflow-hidden max-w-lg mx-auto animate-slide-up">
            {/* Handle */}
            <div className="flex flex-col items-stretch">
                <button className="flex h-6 w-full items-center justify-center pt-2" onClick={onCancel}>
                    <div className="h-1.5 w-12 rounded-full bg-slate-300"></div>
                </button>
                
                <div className="px-6 pt-4 pb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-900 text-2xl font-bold leading-tight">Substitute Item</h3>
                        <button onClick={onCancel} className="p-2 bg-slate-100 rounded-full">
                            <Icon name="close" className="text-slate-500 text-xl leading-none" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* New Item Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 text-sm font-semibold">New Item Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Icon name="edit" />
                                </div>
                                <input 
                                    type="text"
                                    value={subName}
                                    onChange={(e) => setSubName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-900 placeholder-slate-400 outline-none" 
                                    placeholder="e.g. Still Water 1.5L" 
                                />
                            </div>
                        </div>

                        {/* New Price */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 text-sm font-semibold">New Price (ZAR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R</span>
                                <input 
                                    type="number"
                                    value={subPrice}
                                    onChange={(e) => setSubPrice(e.target.value)}
                                    className="w-full pl-10 pr-4 py-4 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-900 placeholder-slate-400 outline-none" 
                                    placeholder="0.00" 
                                />
                            </div>
                        </div>

                        {/* Photo Upload Button */}
                        <div className="py-2">
                            <button className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-violet-500/40 rounded-xl bg-violet-500/5 hover:bg-violet-500/10 transition-colors text-violet-500 font-bold">
                                <Icon name="photo_camera" />
                                <span>Take Photo of Substitute</span>
                            </button>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4">
                            <button 
                                onClick={() => onConfirm(subName, parseFloat(subPrice) || 0)}
                                disabled={!subName || !subPrice}
                                className="w-full bg-violet-500 hover:bg-violet-500/90 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span>Send for Approval</span>
                                <Icon name="send" className="text-xl" />
                            </button>
                            <p className="text-center text-xs text-slate-500 mt-4">The customer will receive a notification to approve the price change.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
