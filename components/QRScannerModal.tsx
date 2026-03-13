import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Icon } from './Icons';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
    title?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan, title = "Scan QR Code" }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && !scannerRef.current) {
            // Initialize scanner
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            
            scanner.render(
                (decodedText) => {
                    onScan(decodedText);
                    scanner.clear();
                    onClose();
                },
                (errorMessage) => {
                    // Handle scan error (optional)
                    // console.warn(errorMessage);
                }
            );

            scannerRef.current = scanner;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
                scannerRef.current = null;
            }
        };
    }, [isOpen, onScan, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl relative">
                <div className="p-4 flex justify-between items-center border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-900">{title}</h3>
                    <button onClick={onClose} className="size-8 bg-slate-50 rounded-full flex items-center justify-center"><Icon name="close" /></button>
                </div>
                
                <div className="p-4 bg-black relative">
                    <div id="reader" className="w-full h-64 bg-black rounded-xl overflow-hidden"></div>
                    <div className="absolute inset-0 pointer-events-none border-2 border-brand-teal/50 rounded-xl m-4 animate-pulse"></div>
                </div>

                <div className="p-6 text-center">
                    <p className="text-xs font-bold text-slate-500">Align the QR code within the frame to scan.</p>
                </div>
            </div>
        </div>,
        document.body
    );
};
