import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onUpload: (file: File) => void;
    onCancel: () => void;
}

export const RunnerReceiptUpload: React.FC<Props> = ({ onUpload, onCancel }) => {
    const [showHelpModal, setShowHelpModal] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                // Try to get the rear camera first
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err: any) {
                console.warn("Environment camera failed, trying any camera...", err);
                try {
                    // Fallback to any available camera
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
                        video: true 
                    });
                    if (videoRef.current) {
                        videoRef.current.srcObject = fallbackStream;
                    }
                } catch (fallbackErr: any) {
                    console.error("Error accessing camera:", fallbackErr);
                    if (fallbackErr.name === 'NotAllowedError' || fallbackErr.message.includes('Permission denied')) {
                        setError("Camera access denied. Please enable camera permissions in your browser settings and try again.");
                    } else if (fallbackErr.name === 'NotFoundError' || fallbackErr.message.includes('Requested device not found')) {
                        setError("No camera found on this device.");
                    } else {
                        setError(`Could not access camera: ${fallbackErr.message || 'Unknown error'}`);
                    }
                }
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                
                canvasRef.current.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
                        onUpload(file);
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-black font-sans overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center p-4 justify-between absolute top-0 w-full z-10">
                <button onClick={onCancel} className="text-white flex size-10 items-center justify-center cursor-pointer rounded-full bg-black/40 backdrop-blur-md">
                    <Icon name="arrow_back" />
                </button>
                <h2 className="text-white text-sm font-bold">Scan Receipt</h2>
                <button onClick={() => setShowHelpModal(true)} className="text-white flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
                    <Icon name="help_outline" />
                </button>
            </div>

            {/* Camera Viewfinder */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
                    {error ? (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                            <Icon name="error_outline" className="text-red-500 text-5xl mb-4" />
                            <p className="text-white text-sm mb-6">{error}</p>
                            <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition-colors">
                                Upload from Device
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            onUpload(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    ) : (
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    )}
                    
                    {/* Overlay Guides - Only show if no error */}
                    {!error && (
                        <>
                            <div className="absolute inset-12 border-2 border-white/50 rounded-2xl pointer-events-none">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                            </div>

                            {/* Instructions */}
                            <div className="absolute bottom-32 left-0 right-0 text-center">
                                <p className="text-white text-xs font-medium bg-black/50 inline-block px-4 py-2 rounded-full backdrop-blur-md">Align receipt within frame</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Hidden Canvas for Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Capture Controls - Only show if no error */}
            {!error && (
                <div className="p-8 pb-safe-action flex items-center justify-center bg-black shrink-0">
                    <button 
                        onClick={capturePhoto}
                        className="size-20 rounded-full bg-white border-4 border-slate-800 shadow-xl flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <div className="size-16 rounded-full bg-purple-600"></div>
                    </button>
                </div>
            )}

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-3">How to Upload Receipt</h3>
                        <p className="text-sm text-slate-600 mb-6">
                            To ensure accurate processing, please take a clear, well-lit photo of the entire receipt. 
                            <br/><br/>
                            1. Place the receipt on a flat, dark surface.
                            <br/>
                            2. Align the receipt within the frame.
                            <br/>
                            3. Tap the capture button.
                            <br/><br/>
                            Only live photos are accepted to ensure receipt authenticity.
                        </p>
                        <button 
                            onClick={() => setShowHelpModal(false)}
                            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
