// components/marketplace/QuickBidModal.tsx
import { useState, useEffect } from 'react';
import { X, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface QuickBidModalProps {
  listing: any;
  onClose: () => void;
  onPlaceBid: (amount: number) => void;
}

const QuickBidModal = ({ listing, onClose, onPlaceBid }: QuickBidModalProps) => {
  // Safe access to currentBid with fallback
  const currentBid = typeof listing.currentBid === 'number' ? listing.currentBid : 0;
  const availableVolume = Math.max(1, Number(listing.volume) || 1);
  const minUnitBid = Math.max(0, Number(listing.currentBid || 0));
  const [quantity, setQuantity] = useState<number>(availableVolume);
  const [unitBidPrice, setUnitBidPrice] = useState<number>(minUnitBid + 100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [error, setError] = useState('');
  const totalBidPrice = Math.round(unitBidPrice * quantity);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const suggestedUnitBids = [
    minUnitBid + 100,
    minUnitBid + 250,
    minUnitBid + 500,
    minUnitBid + 1000,
  ];

  const handleSubmit = () => {
    if (!Number.isFinite(unitBidPrice) || unitBidPrice <= 0) {
      setError('Enter a valid price per unit.');
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError('Enter a valid quantity/volume.');
      return;
    }

    if (quantity > availableVolume) {
      setError(`Quantity cannot exceed available volume (${availableVolume.toLocaleString()} ${listing.unit}).`);
      return;
    }

    if (unitBidPrice <= minUnitBid) {
      setError(`Price per unit must be higher than current price per unit (RWF ${minUnitBid.toLocaleString()}).`);
      return;
    }

    if (totalBidPrice <= currentBid) {
      setError(`Total bid price must be higher than current total bid (RWF ${currentBid.toLocaleString()}).`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBidPlaced(true);
      // Notify parent after short delay so user sees success
      setTimeout(() => onPlaceBid(totalBidPrice), 1200);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
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
        <div className="p-4 sm:p-6">
          {/* Listing Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-6">
            <p className="font-semibold text-gray-900 dark:text-white">{listing.business || listing.hotel}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{listing.type} • {Math.round(listing.volume).toLocaleString()} {listing.unit}</p>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Current Total Bid</span>
              <span className="font-bold text-cyan-600">RWF {currentBid.toLocaleString()}</span>
            </div>
          </div>

          {/* Bid Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Price per Unit (RWF/{listing.unit})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">RWF</span>
              <input
                type="number"
                value={unitBidPrice}
                onChange={(e) => {
                  setUnitBidPrice(Number(e.target.value));
                  setError('');
                }}
                min={minUnitBid + 1}
                step={10}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Minimum price per unit: RWF {minUnitBid.toLocaleString()} / {listing.unit}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantity / Volume ({listing.unit})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(Number(e.target.value));
                setError('');
              }}
              min={1}
              max={availableVolume}
              step={1}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Available: {availableVolume.toLocaleString()} {listing.unit}
            </p>
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
              Suggested price per unit
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedUnitBids.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setUnitBidPrice(amount);
                    setError('');
                  }}
                  className={`p-2 border rounded-xl text-sm font-medium transition-colors ${
                    unitBidPrice === amount
                      ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:border-cyan-700'
                  }`}
                >
                  RWF {amount.toLocaleString()} / {listing.unit}
                </button>
              ))}
            </div>
          </div>

          {/* Bid Summary */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl mb-6">
            <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3">Bid Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-cyan-700 dark:text-cyan-400">Your Price per Unit</span>
                <span className="font-bold text-cyan-800 dark:text-cyan-300">RWF {unitBidPrice.toLocaleString()} / {listing.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cyan-700 dark:text-cyan-400">Quantity / Volume</span>
                <span className="text-cyan-800 dark:text-cyan-300">{quantity.toLocaleString()} {listing.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cyan-700 dark:text-cyan-400">Your Total Bid Price</span>
                <span className="font-bold text-cyan-800 dark:text-cyan-300">RWF {totalBidPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cyan-700 dark:text-cyan-400">Platform Fee (5%)</span>
                <span className="text-cyan-800 dark:text-cyan-300">RWF {Math.round(totalBidPrice * 0.05).toLocaleString()}</span>
              </div>
              <div className="border-t border-cyan-200 dark:border-cyan-800 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-cyan-800 dark:text-cyan-300">Total if you win</span>
                  <span className="text-cyan-800 dark:text-cyan-300">RWF {Math.round(totalBidPrice * 1.05).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
            By placing a bid, you agree to EcoTrade's terms of service and commit to completing the collection if you win.
          </p>

          {/* Action ButKilograms */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition-colors text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !!error || unitBidPrice <= 0 || quantity <= 0}
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
                <p className="text-sm">Total bid price RWF {totalBidPrice.toLocaleString()} on {listing.business || listing.hotel}</p>
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