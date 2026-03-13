import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../../Icons';
import jsQR from 'jsqr';

interface Props {
    ride?: any;
    onVerify: () => void;
}

export const HandoverQrPinShare: React.FC<Props> = ({ ride, onVerify }) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'pin'>('qr');
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [showEscrowRelease, setShowEscrowRelease] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  // Start camera when QR tab is active
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (activeTab !== 'qr' || showEscrowRelease) return;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
                requestRef.current = requestAnimationFrame(scanQR);
            };
        }
      } catch (err: any) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    requestRef.current = requestAnimationFrame(scanQR);
                };
            }
        } catch (fallbackErr: any) {
            setError("Camera access denied.");
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
      }
    };
  }, [activeTab, showEscrowRelease]);

  const scanQR = () => {
    if (showEscrowRelease) return;
    
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          setShowEscrowRelease(true);
          return;
        }
      }
    }
    
    if (activeTab === 'qr') {
        requestRef.current = requestAnimationFrame(scanQR);
    }
  };

  const handleManualVerify = () => {
      setShowEscrowRelease(true);
  };

  const handleComplete = () => {
      setShowEscrowRelease(false);
      onVerify();
  };

  const totalEarned = ride?.price || 1155;

  if (showEscrowRelease) {
    return (
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans animate-slide-up">
        {/* Header */}
        <div className="shrink-0 flex items-center p-3 border-b border-slate-200 bg-white z-10">
          <button onClick={() => setShowEscrowRelease(false)} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <Icon name="arrow_back" />
          </button>
          <h2 className="text-base font-bold flex-1 text-center pr-10">Earnings Secured</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 flex flex-col items-center text-center">
            {/* Status Illustration */}
            <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-brand-orange/10 to-brand-orange/30 flex items-center justify-center border border-brand-orange/10 mb-6">
              <div className="bg-white size-16 rounded-full shadow-lg flex items-center justify-center">
                <Icon name="lock" className="text-brand-orange text-3xl" />
              </div>
            </div>
            
            <h3 className="text-xl font-black leading-tight tracking-tight mb-2">Payment in Escrow</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-[280px]">
              Funds will be released to your wallet immediately after the client scans your handover QR code.
            </p>
          </div>

          {/* Financial Summary Card */}
          <div className="px-4 pb-6">
            <div className="flex flex-col gap-1.5 rounded-2xl p-5 bg-brand-orange/5 border border-brand-orange/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expected Net Payout</p>
              <p className="text-brand-orange text-4xl font-black tracking-tighter">R {(totalEarned * 0.8).toFixed(2)}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Icon name="info" className="text-brand-orange text-[10px]" />
                <p className="text-brand-orange text-[10px] font-black uppercase tracking-widest">-20% platform fee applied</p>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="px-6 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Details</h4>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <p className="text-slate-500 font-medium">Gross Amount</p>
                    <p className="font-bold">R {totalEarned.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <p className="text-slate-500 font-medium">Platform Fee (20%)</p>
                    <p className="font-bold text-red-500">-R {(totalEarned * 0.2).toFixed(2)}</p>
                </div>
                <div className="h-px bg-slate-100 w-full"></div>
                <div className="flex justify-between items-center">
                    <p className="text-slate-900 text-sm font-black">Net Amount</p>
                    <p className="font-black text-sm text-brand-orange">R {(totalEarned * 0.8).toFixed(2)}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="shrink-0 p-4 pb-8 bg-white border-t border-slate-100">
            <button 
                onClick={handleComplete} 
                className="w-full h-14 bg-brand-orange text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/25 active:scale-[0.98] transition-all"
            >
                <Icon name="qr_code_2" />
                <span>Show Handover QR</span>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-900 font-sans">
      <div className="absolute inset-0 z-0 bg-slate-800 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center p-4 z-10">
            <Icon name="error_outline" className="text-red-500 text-4xl mb-2" />
            <p className="text-white text-xs">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-60" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
        
        <div className="absolute inset-0 border-[30px] border-black/40 flex items-center justify-center">
          <div className="relative size-56 border-2 border-white/30 rounded-2xl">
            <div className="absolute -top-1 -left-1 size-8 border-t-4 border-l-4 border-brand-orange rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 size-8 border-t-4 border-r-4 border-brand-orange rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 size-8 border-b-4 border-l-4 border-brand-orange rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 size-8 border-b-4 border-r-4 border-brand-orange rounded-tr-lg"></div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-orange/40 shadow-[0_0_10px_rgba(236,91,19,0.8)] animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="shrink-0 flex items-center p-3 justify-between bg-gradient-to-b from-black/80 to-transparent">
          <button className="text-white size-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10">
            <Icon name="close" />
          </button>
          <h2 className="text-white text-sm font-black uppercase tracking-widest flex-1 text-center pr-10">Handover Scan</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-start pt-8 px-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center max-w-[280px]">
            <h3 className="text-white text-base font-black leading-tight mb-1">Scan Client QR</h3>
            <p className="text-white/60 text-[10px] font-medium leading-relaxed">Position the customer's QR code within the frame to release payment.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 pb-8 space-y-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 p-3">
            <div className="flex flex-col">
              <p className="text-white/50 text-[8px] font-black uppercase tracking-widest">Job Total</p>
              <p className="text-white text-2xl font-black tracking-tighter">R{totalEarned.toFixed(0)}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-orange px-2 py-1 rounded-md">
              <Icon name="shield" className="text-white text-[10px]" />
              <span className="text-white text-[8px] font-black uppercase tracking-widest">Escrow</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button className="size-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10">
              <Icon name="flashlight_on" className="text-lg" />
            </button>
            <button onClick={handleManualVerify} className="size-16 flex items-center justify-center rounded-full bg-brand-orange text-white shadow-lg shadow-brand-orange/30 ring-4 ring-white/10 active:scale-90 transition-all">
              <Icon name="qr_code_scanner" className="text-3xl" />
            </button>
            <button className="size-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10">
              <Icon name="image" className="text-lg" />
            </button>
          </div>

          <button onClick={handleManualVerify} className="w-full h-12 bg-white/5 backdrop-blur-sm border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
            Problems scanning? Enter code
          </button>
        </div>
      </div>
    </div>
  );
};
