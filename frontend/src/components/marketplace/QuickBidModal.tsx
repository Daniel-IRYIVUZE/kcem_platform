// components/marketplace/QuickBidModal.tsx
import { useState, useEffect } from 'react';
import { X, TrendingUp, AlertCircle } from 'lucide-react';

interface QuickBidModalProps {
  listing: any;
  onClose: () => void;
  onPlaceBid: (amount: number) => void;
}

const QuickBidModal = ({ listing, onClose, onPlaceBid }: QuickBidModalProps) => {
  const availableVolume = Math.max(1, Number(listing.volume) || 1);

  // currentBid is the TOTAL highest bid amount (e.g. 40,000 RWF for 200 kg)
  const currentBidTotal = typeof listing.currentBid === 'number' ? listing.currentBid : 0;

  // minBid is per-unit floor set by the hotel (e.g. 100 RWF/kg)
  const listingMinPerUnit = Math.max(0, Number(listing.minBid || 0));

  // Derive current per-unit price from total bid ÷ volume
  const currentBidPerUnit = currentBidTotal > 0 ? Math.ceil(currentBidTotal / availableVolume) : 0;

  // New bid must beat both the hotel's floor and the current highest per-unit price
  const minUnitBid = Math.max(listingMinPerUnit, currentBidPerUnit);

  const [quantity, setQuantity] = useState<number>(availableVolume);
  const [unitBidPrice, setUnitBidPrice] = useState<number>(minUnitBid + 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Recalculate initial price whenever minUnitBid changes (e.g. listing prop update)
  useEffect(() => {
    setUnitBidPrice(minUnitBid + 1);
  }, [minUnitBid]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const totalBidPrice = Math.round(unitBidPrice * quantity);

  // Suggested per-unit prices (small increments above the minimum)
  const suggestedUnitBids = [
    minUnitBid + 1,
    minUnitBid + 50,
    minUnitBid + 100,
    minUnitBid + 200,
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
      setError(`Price per unit must be above RWF ${minUnitBid.toLocaleString()} / ${listing.unit}.`);
      return;
    }
    if (currentBidTotal > 0 && totalBidPrice <= currentBidTotal) {
      setError(`Total bid must exceed current total bid (RWF ${currentBidTotal.toLocaleString()}).`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    // Call parent handler which performs the actual API call
    onPlaceBid(totalBidPrice);
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
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6">
            <p className="font-semibold text-gray-900 dark:text-white">{listing.business || listing.hotel}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {listing.type} • {Math.round(listing.volume).toLocaleString()} {listing.unit}
            </p>
            <div className="flex justify-between mt-2">
              {currentBidTotal > 0 ? (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Total Bid</span>
                  <span className="font-bold text-cyan-600">RWF {currentBidTotal.toLocaleString()}</span>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Min Bid (per {listing.unit})</span>
                  <span className="font-bold text-cyan-600">RWF {listingMinPerUnit.toLocaleString()} / {listing.unit}</span>
                </>
              )}
            </div>
          </div>

          {/* Price per Unit Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Price per Unit (RWF/{listing.unit})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">RWF</span>
              <input
                type="number"
                value={unitBidPrice}
                onChange={(e) => { setUnitBidPrice(Number(e.target.value)); setError(''); }}
                min={minUnitBid + 1}
                step={1}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Minimum price per unit: RWF {minUnitBid.toLocaleString()} / {listing.unit}
              {currentBidTotal > 0 && currentBidPerUnit > listingMinPerUnit && (
                <span className="ml-1 text-gray-400">(based on current bid)</span>
              )}
            </p>
          </div>

          {/* Quantity Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantity / Volume ({listing.unit})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => { setQuantity(Number(e.target.value)); setError(''); }}
              min={1}
              max={availableVolume}
              step={1}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Available: {availableVolume.toLocaleString()} {listing.unit}
            </p>
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Suggested Prices */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Suggested price per unit
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedUnitBids.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setUnitBidPrice(amount); setError(''); }}
                  className={`p-2 border rounded-xl text-sm font-medium transition-colors ${
                    unitBidPrice === amount
                      ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700 text-gray-700 dark:text-gray-300'
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
                <span className="text-cyan-700 dark:text-cyan-400">Your Total Bid</span>
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || unitBidPrice <= minUnitBid || quantity <= 0 || quantity > availableVolume}
              className="flex-1 bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Placing…
                </>
              ) : (
                'Place Bid'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBidModal;
