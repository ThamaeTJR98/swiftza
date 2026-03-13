
import { useState, useCallback, useEffect } from 'react';

export const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    if (!supported) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-ZA'; // South African English

    recognition.onstart = () => {
        setIsListening(true);
        console.log("Speech recognition started");
    };
    
    recognition.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended");
    };
    
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        
        let errorMsg = "Speech recognition error";
        if (event.error === 'not-allowed') {
            errorMsg = "Microphone access denied. Please check your browser permissions.";
        } else if (event.error === 'network') {
            errorMsg = "Network error. Please check your internet connection.";
        } else if (event.error === 'no-speech') {
            errorMsg = "No speech detected. Please try again.";
        }
        
        setError(errorMsg);
        alert(errorMsg);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
    };

    try {
        recognition.start();
    } catch (e) {
        console.error("Recognition start failed", e);
        setIsListening(false);
    }
  }, [supported]);

  return { isListening, transcript, startListening, setTranscript, error };
};
