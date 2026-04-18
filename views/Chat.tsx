import React, { useState, useEffect, useRef } from 'react';
import { AppView, ChatMessage, UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { useSpeechToText } from '../hooks/useSpeechToText';

export const Chat: React.FC = () => {
    const { navigate, goBack, user, activeRide } = useApp();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { isListening, transcript, startListening, setTranscript } = useSpeechToText();

    const isDriver = user?.role === UserRole.DRIVER;
    const otherName = isDriver ? 'Rider' : (activeRide?.driver?.name || 'Driver');

    // Update input when speech transcript changes
    useEffect(() => {
        if (transcript) {
            setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
            setTranscript('');
        }
    }, [transcript, setTranscript]);

    // Initial Message Seeding
    useEffect(() => {
        setMessages([
            {
                id: '1',
                sender: 'other',
                text: isDriver ? "Hi, I'm waiting at the pickup point." : "Hello! I'm on my way to the pickup point.",
                timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
                isRead: true
            }
        ]);
    }, [isDriver]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'me',
            text: inputValue,
            timestamp: new Date(),
            isRead: false
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');

        // Simulate Reply
        setTimeout(() => {
            const reply: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'other',
                text: "Got it, thanks!",
                timestamp: new Date(),
                isRead: true
            };
            setMessages(prev => [...prev, reply]);
        }, 2000);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#e5ddd5] relative">
            {/* Header */}
            <div className="bg-[#075e54] text-white p-3 flex items-center gap-3 shadow-md z-10 pt-safe-top md:rounded-t-2xl">
                <button 
                    onClick={() => goBack()} 
                    className="flex items-center gap-1 -ml-1 active:bg-white/10 rounded-full"
                >
                    <span className="material-symbols-rounded text-2xl">arrow_back</span>
                    <div className="w-9 h-9 bg-gray-300 rounded-full overflow-hidden border border-white/30">
                        <img src={`https://i.pravatar.cc/100?img=${isDriver ? '11' : '33'}`} alt="Avatar" className="w-full h-full object-cover"/>
                    </div>
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-base leading-tight">{otherName}</h3>
                    <p className="text-xs text-white/80">Online</p>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full">
                    <span className="material-symbols-rounded text-xl">call</span>
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full">
                    <span className="material-symbols-rounded text-xl">more_vert</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 relative bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-95">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`max-w-[75%] px-3 py-1.5 rounded-lg shadow-sm text-sm relative leading-relaxed ${
                            msg.sender === 'me' 
                            ? 'self-end bg-[#dcf8c6] rounded-tr-none' 
                            : 'self-start bg-white rounded-tl-none'
                        }`}
                    >
                        <p className="text-gray-800 pr-6 break-words">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 absolute bottom-1 right-2">
                            <span className="text-[10px] text-gray-500">{formatTime(msg.timestamp)}</span>
                            {msg.sender === 'me' && (
                                <span className={`material-symbols-rounded text-[14px] ${msg.isRead ? 'text-blue-500' : 'text-gray-400'}`}>done_all</span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="bg-[#f0f0f0] px-2 py-2 flex items-center gap-2 pb-safe md:rounded-b-2xl">
                <button type="button" className="p-2 text-gray-500 hover:text-gray-600">
                    <span className="material-symbols-rounded text-2xl">add</span>
                </button>
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 py-2 px-4 rounded-full bg-white border-none focus:ring-0 outline-none text-base"
                />
                {inputValue.trim() ? (
                    <button type="submit" className="p-3 bg-[#075e54] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
                        <span className="material-symbols-rounded text-xl">send</span>
                    </button>
                ) : (
                    <button 
                        type="button" 
                        onClick={startListening}
                        className={`p-3 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#075e54] text-white'}`}
                    >
                         <span className="material-symbols-rounded text-xl">mic</span>
                    </button>
                )}
            </form>
        </div>
    );
};