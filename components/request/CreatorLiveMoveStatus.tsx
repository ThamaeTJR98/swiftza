import React, { useState } from 'react';
import { Icon } from '../Icons';
import { RideRequest, RideStatus, AppView } from '../../types';
import { useApp } from '../../context/AppContext';

interface Props {
    ride: RideRequest;
}

export const CreatorLiveMoveStatus: React.FC<Props> = ({ ride }) => {
  const { navigate, updateRideStatus } = useApp();
  const [showEscrow, setShowEscrow] = useState(false);

  // Determine progress based on status
  let progress = 0;
  let statusText = 'Mover is heading to pickup';
  let statusDesc = 'Estimated arrival: 15 mins';
  let milestone = 1;

  switch (ride.status) {
    case RideStatus.ACCEPTED:
    case RideStatus.DRIVER_ASSIGNED:
      progress = 10;
      statusText = 'Mover is heading to pickup';
      statusDesc = 'Estimated arrival: 15 mins';
      milestone = 1;
      break;
    case RideStatus.ARRIVED_PICKUP:
    case RideStatus.VERIFYING_RIDE:
      progress = 30;
      statusText = 'Mover has arrived at pickup';
      statusDesc = 'Team check and pre-inspection in progress';
      milestone = 1;
      break;
    case RideStatus.IN_PROGRESS:
      progress = 60;
      statusText = 'Goods Secured & In Transit';
      statusDesc = 'Professional handling in progress';
      milestone = 2;
      break;
    case RideStatus.ARRIVED_DROPOFF:
      progress = 85;
      statusText = 'Mover is Unloading your items';
      statusDesc = 'Estimated completion: 15 mins';
      milestone = 3;
      break;
    case RideStatus.COMPLETED:
      progress = 100;
      statusText = 'Move Completed';
      statusDesc = 'All items delivered successfully';
      milestone = 3;
      break;
  }

  if (showEscrow) {
    return (
      <div className="font-sans bg-slate-50 text-slate-900 min-h-[100dvh] flex items-center justify-center p-4">
        {/* Mobile Screen Container */}
        <div className="w-full max-w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 relative flex flex-col">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between mt-8">
            <button onClick={() => setShowEscrow(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100">
              <Icon name="arrow_back" />
            </button>
            <h1 className="text-lg font-bold tracking-tight">Payment in Escrow</h1>
            <div className="w-10"></div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-6 overflow-y-auto pb-8">
            {/* Hero Badge Section */}
            <div className="mt-4 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center">
                  <Icon name="verified_user" className="text-brand-orange text-5xl" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg">
                  Funds Secured
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">R{ride.price.toFixed(2)}</h2>
              <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed">
                Successfully held in SwiftZA Safe-Box for your upcoming move.
              </p>
            </div>

            {/* Financial Breakdown */}
            <div className="mt-8 bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Transaction Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Icon name="local_shipping" className="text-brand-orange text-sm" />
                    </div>
                    <span className="text-sm font-medium">Move Base Fee</span>
                  </div>
                  <span className="font-semibold text-sm">R{(ride.price * 0.7).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Icon name="groups" className="text-brand-orange text-sm" />
                    </div>
                    <span className="text-sm font-medium">Helper Package</span>
                  </div>
                  <span className="font-semibold text-sm">R{(ride.price * 0.2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Icon name="info" className="text-brand-orange text-sm" />
                    </div>
                    <span className="text-sm font-medium">Dispute Buffer (10%)</span>
                  </div>
                  <span className="font-semibold text-sm">R{(ride.price * 0.1).toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="text-base font-bold">Total Secured</span>
                  <span className="text-base font-extrabold text-brand-orange">R{ride.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security Assurance Card */}
            <div className="mt-6 bg-slate-900 p-5 rounded-2xl relative overflow-hidden">
              <div className="relative z-10 flex gap-4">
                <div className="shrink-0">
                  <Icon name="lock" className="text-brand-orange" />
                </div>
                <p className="text-[13px] leading-relaxed text-slate-100">
                  Your payment is safely held by <span className="font-bold text-brand-orange">SwiftZA</span> and will only be released once the move is confirmed as <span className="font-bold">completed</span>.
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Icon name="security" className="text-8xl" />
              </div>
            </div>

            {/* Help & Map Preview */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="h-24 bg-slate-200 rounded-xl overflow-hidden relative">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC1veG-NowlSA6AguKne5Qy9hQY6cdBNlWGON7fCftQRSksN7XQKeIhVaAZBV8T8n5Pu1gcX8ynRtXNbA-VPgq-hS1im19Sri_fw9OWZC3FB-3nWS2sRrI5TC3qRyRw2Xc02ttLA1ip7b4BAu06hdrWdL9iijsL-pX77F_TB2RNF6cdoXdiKL7a9VfjfCzj1oU7p5BuDHmVd_tWql-DcEgJqd2X-Et8PkdEGX9OQhb1Qg0quoCA4H2p1v2JN2NnRh1Hms1ZCf4re1m" alt="Map" />
                <div className="absolute inset-0 bg-brand-orange/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold bg-white px-2 py-1 rounded text-slate-900">TRACK MOVE</span>
                </div>
              </div>
              <div className="h-24 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center p-3 text-center">
                <Icon name="support_agent" className="text-brand-orange mb-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Need Help?</span>
                <span className="text-xs font-semibold">24/7 Support</span>
              </div>
            </div>
          </main>

          {/* Fixed Footer Actions */}
          <footer className="p-6 bg-white border-t border-slate-100">
            <button onClick={() => setShowEscrow(false)} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20 transition-all">
              <span>View Move Progress</span>
              <Icon name="trending_flat" className="text-sm" />
            </button>
            <div className="mt-4 flex justify-center">
              <div className="w-32 h-1.5 bg-slate-200 rounded-full"></div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-[100dvh] w-full flex-col overflow-x-hidden bg-slate-50 text-slate-900 font-sans">
      <header className="flex items-center bg-slate-50 p-4 border-b border-brand-orange/10 sticky top-0 z-50">
        <div onClick={() => navigate(AppView.HOME)} className="text-brand-orange flex size-10 shrink-0 items-center justify-center cursor-pointer">
          <Icon name="arrow_back" />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 ml-2">Move Fulfillment Tracking</h2>
        <div className="text-slate-600 flex size-10 shrink-0 items-center justify-center">
          <Icon name="more_vert" />
        </div>
      </header>

      <main className="flex flex-col h-full flex-1">
        <div className="flex flex-1 flex-col px-4 py-3">
          <div className="relative bg-slate-200 flex min-h-[400px] flex-1 flex-col justify-between px-4 pb-4 pt-5 rounded-xl overflow-hidden shadow-inner" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC9iqFu0ULJrTGIvghhk1yWH-6T47ZOFtNxqXMhhSMyp0jAPmcyVh6SnufKi6jNdffAbb4grM2dH3Xo973v3SlXlsV7-RnDmjJ-lkaGMmCLBe2teB1EVd3DrXjiWduM6KbeSrCKt4jGEx7ZLysf6M44TbU3esejuiqpfjq6eTt_1faGKJSf0r4p0yI0apZwYeceWwgFyoP_tVWXkOF2VjBMMr8tJJn27qux6-ChXZXhjgl23p8oYpu-KXlO20ejKVE18cGkWCDzMuQl')", backgroundSize: 'cover' }}>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative">
                <div className="bg-brand-orange text-white p-2 rounded-full shadow-lg border-2 border-white animate-pulse">
                  <Icon name="local_shipping" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>

            <label className="relative z-10 flex flex-col min-w-40 h-12 shadow-lg">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                <div className="text-slate-400 flex border-none bg-white items-center justify-center pl-4 rounded-l-xl">
                  <Icon name="search" />
                </div>
                <input className="form-input flex w-full min-w-0 flex-1 border-none bg-white text-slate-900 focus:ring-0 h-full placeholder:text-slate-400 px-4 rounded-r-xl text-base font-normal" placeholder="Search for locations" />
              </div>
            </label>

            <div className="relative z-10 flex flex-col items-end gap-3">
              <div className="flex flex-col gap-1 bg-white p-1 rounded-xl shadow-md border border-slate-200">
                <button className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100">
                  <Icon name="add" className="text-slate-700" />
                </button>
                <div className="h-px bg-slate-200 mx-2"></div>
                <button className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100">
                  <Icon name="remove" className="text-slate-700" />
                </button>
              </div>
              <button className="flex size-10 items-center justify-center rounded-xl bg-brand-orange text-white shadow-lg">
                <Icon name="near_me" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex flex-col gap-1 flex-[2_2_0px]">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-brand-orange"></span>
                <p className="text-brand-orange text-xs font-bold uppercase tracking-wider">Live Status</p>
              </div>
              <p className="text-slate-900 text-base font-bold leading-tight">{statusText}</p>
              <p className="text-slate-500 text-sm font-normal">{statusDesc}</p>
            </div>
            <div className="relative w-32 bg-center bg-no-repeat aspect-video bg-cover rounded-lg overflow-hidden border border-slate-200" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAC0Dq1U4jdF6OyPrlTBFy5Ybmu5CxU9Eugm9WtZP6_gjVPCV-yWOQz1Jcujm3Z3ZQxnmdDiGOf7Q6aiW1kMu2n0JHGH4qpPakuLFOjAvQhNDcj5gAJGbU3MsQgfS3I2gNLZCvoWOCdTfoyI63CZz8B8nfZzGKbnzmIt7IH5xmcTsteB90wG33t48KlymrqnpVwRyz6hOZdvmwQ-KTWbHLkSvEUjwn9d5Gu1v965woWRk6UihAMVK9TRy9C2SJQ4stk9D4DWU2QzJaL")' }}>
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Icon name="photo_camera" className="text-white/80" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex px-4 py-2">
          <div className="flex w-full flex-col gap-4 p-4 rounded-xl bg-brand-orange/5 border border-brand-orange/10 md:flex-row md:justify-between md:items-center">
            <div className="flex gap-4">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-16 w-16 border-2 border-white shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuASUS4JeQVN6VzBkWD8rSw0yz8bcG8eoQ9Wxg1AZ6QvrA_sYvSlafoJYS4e-p8Mgi-K0GTup-KtydVrWYMl98ElsH27xBpOQb7644mVoKhXS248dAUjq4M_s-qdNf7onF1vxYbexw6I4tIyVJlqQ_0X7fedMN-Oxo1cufF0we12ej1pXwkbXg0oeAdyuiqag6U6p7nIM-mL76aMXzz_RtRusIEUaDGTnY7VbDxLv_-dSSVQAQEFAiiSJ1HMvybUDFP9SMTxY7bix-_w")' }}>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-slate-900 text-lg font-bold leading-tight">{ride.driver?.name || 'Expert Moving Team'}</p>
                <p className="text-slate-500 text-sm font-normal">Team ID: #MV4592 • 4.9 <Icon name="star" className="text-xs align-middle" /></p>
              </div>
            </div>
            <div className="flex w-full max-w-[480px] gap-3 md:w-auto">
              <button className="flex min-w-[100px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-4 bg-slate-200 text-slate-900 text-sm font-bold transition-colors hover:bg-slate-300 flex-1 md:flex-auto">
                <Icon name="chat_bubble" className="text-sm" />
                <span>Chat</span>
              </button>
              <button onClick={() => setShowEscrow(true)} className="flex min-w-[100px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-4 bg-brand-orange text-white text-sm font-bold transition-opacity hover:opacity-90 flex-1 md:flex-auto shadow-md shadow-brand-orange/20">
                <Icon name="lock" className="text-sm" />
                <span>Escrow</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex gap-6 justify-between items-end">
            <div>
              <p className="text-slate-900 text-base font-semibold leading-normal">Move Progress</p>
              <p className="text-slate-500 text-sm">Based on milestones</p>
            </div>
            <p className="text-brand-orange text-xl font-bold leading-none">{progress}%</p>
          </div>
          <div className="rounded-full h-3 bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-brand-orange transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex items-center gap-2 text-brand-orange font-medium text-sm">
            <Icon name="celebration" className="text-sm" />
            <p>Your move is progressing well!</p>
          </div>
        </div>

        <div className="mt-4 px-4 pb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Milestones</h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
              
              <div className="flex gap-4 relative">
                <div className={`z-10 size-4 rounded-full ring-4 ring-white mt-1 ${milestone >= 1 ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <div>
                    <p className={`text-sm font-bold ${milestone >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>Pick-up Completed</p>
                  <p className="text-xs text-slate-500">Downtown Residence</p>
                </div>
              </div>
            </div>

              <div className="flex gap-4 relative">
                <div className={`z-10 size-4 rounded-full ring-4 ring-white mt-1 ${milestone >= 2 ? (milestone === 2 ? 'bg-brand-orange animate-pulse' : 'bg-green-500') : 'bg-slate-300'}`}>
                  <div>
                    <p className={`text-sm font-bold ${milestone >= 2 ? (milestone === 2 ? 'text-brand-orange' : 'text-slate-900') : 'text-slate-500'}`}>In Transit</p>
                  <p className="text-xs text-slate-500">Route optimization active</p>
                </div>
              </div>
            </div>

              <div className="flex gap-4 relative">
                <div className={`z-10 size-4 rounded-full ring-4 ring-white mt-1 ${milestone >= 3 ? (milestone === 3 ? 'bg-brand-orange animate-pulse' : 'bg-green-500') : 'bg-slate-300'}`}>
                  <div>
                    <p className={`text-sm font-bold ${milestone >= 3 ? (milestone === 3 ? 'text-brand-orange' : 'text-slate-900') : 'text-slate-500'}`}>Arrived &amp; Unloading</p>
                  <p className="text-xs text-slate-500">New Apartment Complex</p>
                </div>
              </div>
            </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
