// components/marketplace/QuickBidModal.tsx
import { useState, useEffect } from 'react';
import { X, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface QuickBidModalProps {
  listing: any;
  onClose: () => void;
  onPlaceBid: (amount: number) => void;
}

const QuickBidModal = ({ listing, onClose, onPlaceBid }: QuickBidModalProps) => {
  const [bidAmount, setBidAmount] = useState<number>(listing.currentBid + 1000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const suggestedBids = [
    listing.currentBid + 500,
    listing.currentBid + 1000,
    listing.currentBid + 2000,
    listing.currentBid + 5000
  ];

  const handleSubmit = () => {
    if (bidAmount <= listing.currentBid) {
      setError(`Bid must be higher than current bid (RWF ${listing.currentBid.toLocaleString()})`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBidPlaced(true);
      // Notify parent after short delay so user sees success
      setTimeout(() => onPlaceBid(bidAmount), 1200);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Place Your Bid</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Listing Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-6">
            <p className="font-semibold text-gray-900 dark:text-white">{listing.hotel}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{listing.type} • {listing.volume}{listing.unit}</p>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Current Bid</span>
              <span className="font-bold text-cyan-600">RWF {listing.currentBid.toLocaleString()}</span>
            </div>
          </div>

          {/* Bid Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Bid Amount (RWF)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">RWF</span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => {
                  setBidAmount(Number(e.target.value));
                  setError('');
                }}
                min={listing.currentBid + 100}
                step={100}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>

          {/* Suggested Bids */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Suggested bids
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedBids.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setBidAmount(amount);
                    setError('');
                  }}
                  className={`p-2 border rounded-xl text-sm font-medium transition-colors ${
                    bidAmount === amount
                      ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:border-cyan-700'
                  }`}
                >
                  RWF {amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Bid Summary */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl mb-6">
            <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3">Bid Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-cyan-700 dark:text-cyan-400">Your Bid</span>
                <span className="font-bold text-cyan-800 dark:text-cyan-300">RWF {bidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cyan-700 dark:text-cyan-400">Platform Fee (5%)</span>
                <span className="text-cyan-800 dark:text-cyan-300">RWF {Math.round(bidAmount * 0.05).toLocaleString()}</span>
              </div>
              <div className="border-t border-cyan-200 dark:border-cyan-800 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-cyan-800 dark:text-cyan-300">Total if you win</span>
                  <span className="text-cyan-800 dark:text-cyan-300">RWF {Math.round(bidAmount * 1.05).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
            By placing a bid, you agree to EcoTrade's terms of service and commit to completing the collection if you win.
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition-colors text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !!error}
              className="flex-1 bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Placing...
                </>
              ) : (
                'Place Bid'
              )}
            </button>
          </div>

          {/* Success Message */}
          {bidPlaced && (
            <div className="mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-cyan-600" />
              <div>
                <p className="font-semibold">Bid placed successfully!</p>
                <p className="text-sm">RWF {bidAmount.toLocaleString()} on {listing.hotel}</p>
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {isSubmitting && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 rounded-xl flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Processing your bid...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickBidModal;