import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../../../../Icons';

export interface Message {
    id: string;
    text: string;
    sender: 'me' | 'customer';
    timestamp: string;
}

interface Props {
    customerName: string;
    messages: Message[];
    onSendMessage: (text: string) => void;
    onBackToChecklist: () => void;
    onGoToBudget: () => void;
}

export const RunnerMessages: React.FC<Props> = ({ customerName, messages, onSendMessage, onBackToChecklist, onGoToBudget }) => {
    const [inputText, setInputText] = useState('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        onSendMessage(inputText);
        setInputText('');
    };

    return (
        <div className="relative flex h-[100dvh] w-full max-w-md mx-auto flex-col bg-[#f8f6f6] text-slate-900 font-sans animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center bg-white p-3 justify-between border-b border-slate-200">
                <div onClick={onBackToChecklist} className="text-slate-900 flex size-10 shrink-0 items-center justify-center cursor-pointer rounded-full hover:bg-slate-100 transition-colors">
                    <Icon name="arrow_back" className="text-xl" />
                </div>
                <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight flex-1 text-center">Active Shopping</h2>
                <div className="flex w-10 items-center justify-end">
                    <button className="flex items-center justify-center rounded-full size-10 hover:bg-slate-100 transition-colors text-slate-900">
                        <Icon name="info" className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="shrink-0 bg-white">
                <div className="flex border-b border-slate-200 px-2 justify-between">
                    <div onClick={onBackToChecklist} className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-slate-500 pb-2 pt-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold leading-normal tracking-wide">Checklist</p>
                    </div>
                    <div onClick={onGoToBudget} className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-slate-500 pb-2 pt-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold leading-normal tracking-wide">Live Budget</p>
                    </div>
                    <div className="flex flex-col items-center justify-center border-b-[3px] border-b-violet-500 text-violet-500 pb-2 pt-3 flex-1">
                        <p className="text-xs font-bold leading-normal tracking-wide">Messages</p>
                    </div>
                </div>
            </div>

            {/* Customer Info Bar */}
            <div className="shrink-0 bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                <div className="size-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                    {customerName.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">{customerName}</p>
                    <p className="text-xs text-slate-500">Customer</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <Icon name="call" className="text-sm" />
                    </button>
                </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
                            <div className={`px-4 py-2.5 rounded-2xl ${isMe ? 'bg-violet-500 text-white rounded-tr-sm' : 'bg-white text-slate-900 rounded-tl-sm border border-slate-200'}`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-3 bg-white border-t border-slate-200 flex items-end gap-2 z-10">
                <button className="shrink-0 size-10 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <Icon name="add_photo_alternate" className="text-xl" />
                </button>
                <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:border-violet-500/50 focus-within:bg-white transition-all flex items-center overflow-hidden">
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type a message..."
                        className="w-full bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400"
                        rows={1}
                    />
                </div>
                <button 
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className={`shrink-0 size-10 rounded-full flex items-center justify-center transition-colors ${inputText.trim() ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-md shadow-violet-500/20' : 'bg-slate-100 text-slate-400'}`}
                >
                    <Icon name="send" className="text-lg ml-0.5" />
                </button>
            </div>
        </div>
    );
};
