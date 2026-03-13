
import React, { useState } from 'react';
import { AppView, RideStatus } from '../types';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';

export const RideComplete: React.FC = () => {
  const { setView, activeRide, setActiveRide } = useApp();
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  const [comment, setComment] = useState('');
  
  // Tags based on service type
  const RIDE_TAGS = ['Safe Driving', 'Clean Car', 'Friendly', 'Good Music', 'Quiet'];
  const ERRAND_TAGS = ['Fast Delivery', 'Items Correct', 'Followed Instructions', 'Helpful'];
  
  const tags = activeRide?.type === 'errand' ? ERRAND_TAGS : RIDE_TAGS;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!activeRide) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    // In production: Submit review API call here
    // alert(`Rated: ${rating}, Tip: R${tip}`);
    
    // Clear active ride and go home
    setActiveRide(null);
    setView(AppView.HOME);
  };

  return (
    <div className="h-full bg-white flex flex-col items-center justify-center p-6 pb-safe animate-slide-up relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
            
            <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 animate-bounce">
                    <span className="material-symbols-rounded text-4xl">check_circle</span>
                </div>
                <h1 className="text-2xl font-extrabold text-text-main">
                    {activeRide.type === 'errand' ? 'Errand Complete!' : 'You\'ve Arrived!'}
                </h1>
                <p className="text-gray-500">How was your experience with {activeRide.driver?.name}?</p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                    >
                        ★
                    </button>
                ))}
            </div>

            {/* Tags */}
            {rating > 0 && (
                <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
                    {tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${selectedTags.includes(tag) ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-gray-500 border-gray-200'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Tipping Section */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-bold text-center mb-4 text-gray-700">Add a Tip for {activeRide.driver?.name.split(' ')[0]}?</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {[0, 5, 10, 20].map((amount) => (
                        <button
                            key={amount}
                            onClick={() => setTip(amount)}
                            className={`py-2 rounded-lg font-bold text-sm border transition-all ${tip === amount ? 'bg-brand-teal text-white border-brand-teal shadow-lg' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                            {amount === 0 ? 'No' : `R${amount}`}
                        </button>
                    ))}
                </div>
                {tip > 0 && (
                    <p className="text-center text-xs text-gray-500">100% of the tip goes to the runner.</p>
                )}
            </div>
            
            {/* Comment Box */}
            <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment (Optional)..."
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-brand-purple resize-none h-20"
            />

            <Button fullWidth onClick={handleSubmit} disabled={rating === 0}>
                Submit Review
            </Button>
        </div>
    </div>
  );
};
