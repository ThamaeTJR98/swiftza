import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Icon } from '../components/Icons';
import { RegulatoryService } from '../services/RegulatoryService';

export const AdminDashboard: React.FC = () => {
    const { logout } = useApp();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'RIDES' | 'FINANCE' | 'SYSTEM' | 'DISPUTES'>('OVERVIEW');
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [disputes, setDisputes] = useState<any[]>([]);
    const [isResolving, setIsResolving] = useState<string | null>(null);
    
    // Document Viewing State
    const [viewingDoc, setViewingDoc] = useState<{url: string, type: string} | null>(null);

    // Calculate Webhook URL dynamically
    const webhookUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/kyc-webhook`;

    useEffect(() => {
        if (activeTab === 'USERS') {
            fetchPendingDrivers();
        } else if (activeTab === 'DISPUTES') {
            fetchDisputes();
        }
    }, [activeTab]);

    const fetchPendingDrivers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'DRIVER')
            .eq('is_verified', false);
        
        if (data) setPendingUsers(data);
    }

    const fetchDisputes = async () => {
        const { data, error } = await supabase
            .from('disputes')
            .select(`
                *,
                rides:ride_id (
                    id,
                    price,
                    pickup_address,
                    dropoff_address,
                    driver_id,
                    profiles:reporter_id (full_name)
                )
            `)
            .order('created_at', { ascending: false });
        
        if (data) setDisputes(data);
        if (error) console.error("Disputes Fetch Error:", error);
    }

    const handleResolveDispute = async (id: string, resolution: 'REFUND' | 'CREDIT' | 'NONE') => {
        setIsResolving(id);
        try {
            if (resolution === 'REFUND') {
                // Call Edge Function for actual financial refund
                const { data, error } = await supabase.functions.invoke('refund-payment', {
                    body: {
                        dispute_id: id,
                        resolution: resolution,
                        notes: `Resolved as ${resolution} by Admin (Paystack Refund Initiated)`
                    }
                });

                if (error) throw error;
                if (data?.error) throw new Error(data.error);

            } else {
                // For CREDIT or NONE, just update the DB via RPC
                const { data, error } = await supabase.rpc('resolve_dispute', {
                    dispute_id_input: id,
                    resolution: resolution,
                    notes: `Resolved as ${resolution} by Admin`
                });

                if (error) throw error;
            }
            
            alert(`Dispute resolved with ${resolution}`);
            fetchDisputes();
        } catch (err: any) {
            console.error("Resolve Error:", err);
            alert(`Failed to resolve dispute: ${err.message || 'Unknown error'}`);
        } finally {
            setIsResolving(null);
        }
    }

    const approveDriver = async (id: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', id);

        if (!error) {
            alert("Driver Approved Successfully");
            fetchPendingDrivers();
        }
    }

    // Mock Document Viewer (In production, use signed URLs from Supabase Storage)
    const handleViewDoc = (userId: string) => {
        setViewingDoc({
            url: 'https://via.placeholder.com/600x400?text=License+Card', // Replace with user.documents_data.license_url
            type: 'License Card'
        });
    };

    const generateACBFile = () => {
        // Logic to generate CSV for South African Banks (FNB/Standard Bank)
        const csvContent = "data:text/csv;charset=utf-8,Account Holder,Bank Code,Account Number,Amount,Reference\nJohn Doe,250655,1234567890,350.00,SWIFTZA_PAYOUT";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payouts_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    // ... (Overview Render same as before)
    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <p className="text-gray-500 text-xs font-bold uppercase mb-2">Daily Revenue</p>
                 <h3 className="text-3xl font-extrabold text-text-main">R 15,400</h3>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <p className="text-gray-500 text-xs font-bold uppercase mb-2">Active Drivers</p>
                 <h3 className="text-3xl font-extrabold text-brand-teal">42</h3>
             </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6 animate-slide-up">
            <h3 className="font-bold text-gray-800">Pending Approvals ({pendingUsers.length})</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Vehicle</th>
                            <th className="p-4">Docs</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingUsers.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">No pending approvals</td></tr>
                        ) : (
                            pendingUsers.map(u => (
                                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-bold">{u.full_name}</td>
                                    <td className="p-4">{u.vehicle_type}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleViewDoc(u.id)} className="text-blue-600 hover:underline">View License</button>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => approveDriver(u.id)} className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">Approve</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderFinance = () => (
        <div className="animate-slide-up space-y-6">
             <div className="bg-white p-6 rounded-2xl border border-gray-100">
                 <h3 className="text-lg font-bold mb-4">Weekly Payouts</h3>
                 <p className="text-gray-500 text-sm mb-6">Generate the ACB/CSV file for bulk payments to drivers.</p>
                 <Button onClick={generateACBFile} className="!bg-brand-teal text-white">
                     <span className="material-symbols-rounded mr-2">download</span>
                     Download Payment File
                 </Button>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-gray-100">
                 <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Icon name="gavel" className="text-slate-900" />
                    Regulatory Compliance
                 </h3>
                 <p className="text-gray-500 text-sm mb-6">Export full driver & vehicle data for NPTR/SARS audits.</p>
                 <Button onClick={() => RegulatoryService.generateNPTRReport()} className="!bg-slate-900 text-white w-full md:w-auto">
                     <span className="material-symbols-rounded mr-2">description</span>
                     Download NPTR Audit Report
                 </Button>
             </div>
        </div>
    );

    const renderDisputes = () => (
        <div className="space-y-6 animate-slide-up">
            <h3 className="font-bold text-gray-800">Pending Disputes ({disputes.filter(d => d.status === 'PENDING').length})</h3>
            <div className="grid grid-cols-1 gap-4">
                {disputes.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-400">
                        No disputes reported yet.
                    </div>
                ) : (
                    disputes.map(d => (
                        <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                        d.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                                        d.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {d.status}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono">#{d.id.slice(0,8)}</span>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(d.created_at).toLocaleString()}</span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reason</p>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">{d.reason}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{d.description || 'No additional details provided.'}</p>
                                    
                                    {d.evidence_url && (
                                        <button 
                                            onClick={() => setViewingDoc({ url: d.evidence_url, type: 'Dispute Evidence' })}
                                            className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                        >
                                            <Icon name="image" className="text-sm" /> View Evidence
                                        </button>
                                    )}
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ride Details</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Amount:</span>
                                            <span className="font-bold text-slate-900">R{d.rides?.price}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">From:</span>
                                            <span className="text-slate-700 truncate ml-4">{d.rides?.pickup_address}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">To:</span>
                                            <span className="text-slate-700 truncate ml-4">{d.rides?.dropoff_address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {d.status === 'PENDING' && (
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                    <button 
                                        disabled={isResolving === d.id}
                                        onClick={() => handleResolveDispute(d.id, 'REFUND')}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isResolving === d.id ? <span className="animate-spin material-symbols-rounded text-sm">progress_activity</span> : <Icon name="undo" className="text-sm" />}
                                        Issue Refund
                                    </button>
                                    <button 
                                        disabled={isResolving === d.id}
                                        onClick={() => handleResolveDispute(d.id, 'CREDIT')}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Icon name="account_balance_wallet" className="text-sm" /> Issue Credit
                                    </button>
                                    <button 
                                        disabled={isResolving === d.id}
                                        onClick={() => handleResolveDispute(d.id, 'NONE')}
                                        className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-bold text-xs hover:bg-slate-300 transition-colors"
                                    >
                                        Reject Dispute
                                    </button>
                                </div>
                            )}
                            {d.status === 'RESOLVED' && (
                                <div className="p-4 bg-green-50 border-t border-green-100">
                                    <p className="text-xs text-green-700 font-bold flex items-center gap-2">
                                        <Icon name="check_circle" className="text-sm" />
                                        Resolved with {d.resolution_type}
                                    </p>
                                    {d.admin_notes && <p className="text-[10px] text-green-600 mt-1 italic">Notes: {d.admin_notes}</p>}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderSystem = () => (
        <div className="animate-slide-up max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Integrations & API</h3>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Icon name="verified_user" className="text-xl" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Didit Identity Verification</h4>
                        <p className="text-xs text-gray-500">Status: <span className="text-green-600 font-bold">Active</span></p>
                    </div>
                </div>
                
                <div className="p-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Webhook Endpoint URL</label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-slate-900 text-white p-3 rounded-xl text-xs font-mono break-all">
                            {webhookUrl}
                        </code>
                        <button 
                            onClick={() => copyToClipboard(webhookUrl)}
                            className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl text-gray-700 transition-colors"
                            title="Copy to clipboard"
                        >
                            <span className="material-symbols-rounded">content_copy</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                        Paste this URL into your <strong>Didit Dashboard</strong> &gt; <strong>Webhooks</strong> settings. 
                        Ensure 'Enforce JWT' is disabled on the Supabase Edge Function.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center">
                            <Icon name="local_taxi" className="text-white text-lg" />
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900">SwiftZA <span className="text-brand-teal">Admin</span></h1>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button onClick={() => setActiveTab('OVERVIEW')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'OVERVIEW' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Icon name="home" /> Overview
                    </button>
                    <button onClick={() => setActiveTab('USERS')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'USERS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Icon name="person" /> Users
                    </button>
                    <button onClick={() => setActiveTab('DISPUTES')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'DISPUTES' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Icon name="gavel" /> Disputes
                    </button>
                    <button onClick={() => setActiveTab('FINANCE')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'FINANCE' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Icon name="payments" /> Finance
                    </button>
                    <button onClick={() => setActiveTab('SYSTEM')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'SYSTEM' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Icon name="settings" /> System
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-50">
                    <button onClick={logout} className="w-full py-3 text-red-500 font-bold bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                        <Icon name="logout" /> Log Out
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto relative">
                {activeTab === 'OVERVIEW' && renderOverview()}
                {activeTab === 'USERS' && renderUsers()}
                {activeTab === 'DISPUTES' && renderDisputes()}
                {activeTab === 'FINANCE' && renderFinance()}
                {activeTab === 'SYSTEM' && renderSystem()}

                {/* Doc Viewer Modal */}
                {viewingDoc && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingDoc(null)}>
                        <div className="bg-white rounded-xl overflow-hidden max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-slate-900">{viewingDoc.type}</h3>
                                <button onClick={() => setViewingDoc(null)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200">
                                    <Icon name="close" />
                                </button>
                            </div>
                            <div className="p-8 bg-slate-200 flex justify-center">
                                <img src={viewingDoc.url} alt="Doc" className="max-w-full h-auto rounded shadow-lg" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};