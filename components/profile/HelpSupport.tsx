import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GoogleGenAI, Chat } from "@google/genai";

interface HelpSupportProps {
    onBack: () => void;
    role: 'CREATOR' | 'DRIVER';
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    time: string;
}

export const HelpSupport: React.FC<HelpSupportProps> = ({ onBack, role }) => {
    const [messages, setMessages] = useState<Message[]>([
        { 
            id: '1', 
            text: `Sawubona! I'm your SwiftZA Assistant. I can help you with ${role === 'DRIVER' ? 'earnings, trips, and vehicle' : 'bookings, payments, and safety'} questions in any of our 11 official languages.`, 
            sender: 'ai', 
            time: 'Just now' 
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatSessionRef = useRef<Chat | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Initialize Gemini Chat Session with SwiftZA Context
    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemPrompt = `
            You are the official AI Support Agent for SwiftZA, a South African ride-hailing, errand-running, and moving app.
            
            Current User Context:
            - Role: ${role} (The user is a ${role === 'DRIVER' ? 'Driver/Service Provider' : 'Creator/Customer'})
            
            Your Capabilities:
            1. Explain App Features: Rides (Standard, XL), Errands (Shopping, Delivery), Moves (Bakkie/Truck).
            2. Safety: Always prioritize safety. If a user indicates danger, tell them to press the red 'Panic Button' on the tracking screen or call 10111 immediately.
            3. South African Context: You understand local slang (howzit, bakkie, robot, now-now) and all 11 official languages. Reply in the language the user speaks to you, or English by default.
            4. Support: Help with app navigation, wallet/payment issues, and account verification.
            
            Tone:
            - Friendly, professional, and helpful. 
            - Use South African warmth (e.g., "Sure thing," "No problem," "Eish, sorry about that").
            - Be concise (mobile chat interface).

            Specific App Knowledge:
            - Payments: We use Cash, Card, and PayStack.
            - Driver Commission: 20% flat rate.
            - Verification: Drivers need ID, PrDP, and Vehicle NATIS documents.
            
            If you cannot help, ask them to email support@swiftza.app.
        `;

        chatSessionRef.current = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
            }
        });
    }, [role]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;
        
        const userText = inputValue;
        setInputValue(''); // Clear input immediately
        
        // 1. Add User Message
        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, newUserMsg]);
        setIsTyping(true);

        try {
            // 2. Call Gemini API
            if (!chatSessionRef.current) {
                 // Fallback re-init
                 const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                 chatSessionRef.current = ai.chats.create({ model: 'gemini-3-flash-preview' });
            }

            const response = await chatSessionRef.current.sendMessage({ message: userText });
            const aiResponseText = response.text || "I'm having a bit of trouble connecting to the network. Please try again now-now.";

            // 3. Add AI Message
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Eish, connection error. Please check your internet or try again later.",
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#f6f7f8] text-[#0d141b] flex flex-col font-sans animate-slide-up h-[100dvh]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 pt-safe-top shrink-0">
                <div className="flex items-center p-4 justify-between w-full h-[60px]">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onBack}
                            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
                        >
                            <span className="material-symbols-rounded text-[#0d141b]">arrow_back_ios_new</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-rounded text-primary text-2xl">auto_awesome</span>
                                </div>
                                <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h1 className="text-[#0d141b] text-base font-bold leading-tight">SwiftZA AI Assistant</h1>
                                <p className="text-[11px] text-[#4c739a] font-medium uppercase tracking-wide">Supports 11 Languages</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shadow-sm active:scale-95">
                        <span className="material-symbols-rounded text-primary text-[22px]">language</span>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 w-full px-4 overflow-y-auto pt-6 space-y-6 pb-32 no-scrollbar">
                <div className="flex justify-center">
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
                </div>

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-col items-end' : ''}`}>
                        {msg.sender === 'ai' && (
                            <div className="size-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center self-end mb-1 border border-primary/10">
                                <span className="material-symbols-rounded text-primary text-lg">auto_awesome</span>
                            </div>
                        )}
                        
                        <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : ''}`}>
                            <div className={`p-4 rounded-2xl shadow-sm border ${
                                msg.sender === 'user' 
                                ? 'bg-primary text-white rounded-br-none shadow-primary/10 border-transparent' 
                                : 'bg-white text-[#0d141b] rounded-bl-none border-slate-100'
                            }`}>
                                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 mx-1 uppercase">{msg.time}</span>
                        </div>
                    </div>
                ))}
                
                {/* Typing Bubble */}
                {isTyping && (
                    <div className="flex gap-3 max-w-[85%] animate-fade-in">
                        <div className="size-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center self-end mb-1 border border-primary/10">
                            <span className="material-symbols-rounded text-primary text-lg">auto_awesome</span>
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex gap-1.5 items-center h-[46px]">
                            <div className="size-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
                
                {/* Status Indicator */}
                 <div className="flex justify-center py-2">
                    <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full transition-colors ${isTyping ? 'bg-primary/5 border-primary/20' : 'bg-white/50 border-slate-100'}`}>
                        <span className={`size-1.5 rounded-full ${isTyping ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></span>
                        <span className="text-[10px] font-medium text-slate-500 italic">
                            {isTyping ? 'SwiftZA AI is thinking...' : 'Listening for Zulu, Xhosa, Afrikaans & more'}
                        </span>
                    </div>
                </div>
                
                <div ref={messagesEndRef} />
            </main>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-8 pt-3 px-4 z-20">
                <div className="w-full">
                    <div className="flex items-end gap-2 bg-slate-50 rounded-2xl p-2 border border-slate-200 shadow-inner">
                        <button className="flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-white text-slate-500 transition-colors">
                            <span className="material-symbols-rounded">attachment</span>
                        </button>
                        <textarea 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2.5 px-1 max-h-32 resize-none text-[#0d141b] placeholder:text-slate-400 outline-none" 
                            placeholder="Message in your language..." 
                            rows={1}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform ${(!inputValue.trim() || isTyping) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="material-symbols-rounded">send</span>
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-3 px-1">
                        <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-medium">AI response may vary</p>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-rounded text-[10px] text-slate-400">lock</span>
                            <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-medium">Encrypted</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>,
        document.body
    );
};