// components/dashboard/business/BusinessNewListing.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { listingsAPI } from '../../../services/api';
import { syncFromAPI } from '../../../utils/apiSync';
import { CheckCircle, Image, AlertTriangle } from 'lucide-react';

export default function BusinessNewListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    wasteType: '', quantity: '', unit: 'kg', description: '',
    minPrice: '', pickupDate: '', pickupTime: '', specialInstructions: '',
    photos: [] as string[],
  });
  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.wasteType || !form.quantity || !form.minPrice || !form.pickupDate) return;
    
    setIsLoading(true);
    try {
      const pickupDate = new Date(form.pickupDate);
      const expiresAt = new Date(pickupDate);
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Create listing via API
      await listingsAPI.create({
        waste_type: form.wasteType,
        volume: parseFloat(form.quantity) || 0,
        unit: form.unit === 'L' ? 'liters' : 'kg',
        quality: 'A',
        min_bid: parseInt(form.minPrice) || 0,
        reserve_price: 0,
        auction_duration: '7d',
        special_instructions: form.description + (form.specialInstructions ? '\n' + form.specialInstructions : ''),
        collection_date: form.pickupDate,
        collection_time: form.pickupTime,
        location: 'Kigali',
        status: 'open',
      } as any);

      // Sync data from backend so dashboard shows new listing
      if (user) {
        await syncFromAPI(user.role);
        window.dispatchEvent(new Event('ecotrade_data_change'));
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Waste Listing</h1>
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>{s}</div>
            {s < 3 && <div className={`w-16 sm:w-24 h-1 mx-1 ${step > s ? 'bg-cyan-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
        <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">{step === 1 ? 'Waste Details' : step === 2 ? 'Pickup & Pricing' : 'Review & Submit'}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Waste Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waste Type *</label>
                <select value={form.wasteType} onChange={e => update('wasteType', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="">Select type...</option><option value="UCO">Used Cooking Oil (UCO)</option><option value="Glass">Glass</option><option value="Paper/Cardboard">Paper/Cardboard</option><option value="Organic Waste">Organic Waste</option><option value="Plastic">Plastic</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity *</label><input type="number" value={form.quantity} onChange={e => update('quantity', e.target.value)} placeholder="e.g. 500" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
                <div className="w-24"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label><select value={form.unit} onChange={e => update('unit', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="kg">kg</option><option value="L">Liters</option><option value="tons">Tons</option></select></div>
              </div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="Describe the waste quality, source, and any relevant details..." className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photos</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                <Image size={32} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" /><p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p><p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG up to 5MB each</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pickup & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Price (RWF) *</label><input type="number" value={form.minPrice} onChange={e => update('minPrice', e.target.value)} placeholder="e.g. 250000" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Pickup Date *</label><input type="date" value={form.pickupDate} onChange={e => update('pickupDate', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Pickup Time</label><input type="time" value={form.pickupTime} onChange={e => update('pickupTime', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Instructions</label><textarea value={form.specialInstructions} onChange={e => update('specialInstructions', e.target.value)} rows={3} placeholder="Loading dock access, parking instructions, contact person..." className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
          </div>
        )}

        {submitted && (
          <div className="text-center py-12">
            <CheckCircle size={56} className="mx-auto text-green-500 mb-4"/>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Listing Published!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Your waste listing is now live on the marketplace and visible to all verified recyclers.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate('/marketplace')} className="px-5 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">View on Marketplace</button>
              <button onClick={() => { setSubmitted(false); setStep(1); setForm({ wasteType: '', quantity: '', unit: 'kg', description: '', minPrice: '', pickupDate: '', pickupTime: '', specialInstructions: '', photos: [] }); }} className="px-5 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">Add Another</button>
              <button onClick={() => navigate('listings')} className="px-5 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">View My Listings</button>
            </div>
          </div>
        )}
        {!submitted && step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Submit</h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Waste Type</p><p className="font-medium text-gray-900 dark:text-white">{form.wasteType || '—'}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p><p className="font-medium text-gray-900 dark:text-white">{form.quantity ? `${form.quantity} ${form.unit}` : '—'}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Minimum Price</p><p className="font-medium text-gray-900 dark:text-white">{form.minPrice ? `RWF ${parseInt(form.minPrice).toLocaleString()}` : '—'}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Pickup Date</p><p className="font-medium text-gray-900 dark:text-white">{form.pickupDate || '—'}</p></div>
              </div>
              {form.description && <div><p className="text-xs text-gray-500 dark:text-gray-400">Description</p><p className="text-sm text-gray-700 dark:text-gray-300">{form.description}</p></div>}
              {form.specialInstructions && <div><p className="text-xs text-gray-500 dark:text-gray-400">Special Instructions</p><p className="text-sm text-gray-700 dark:text-gray-300">{form.specialInstructions}</p></div>}
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertTriangle size={16} className="text-yellow-700 dark:text-yellow-700 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Once submitted, your listing will be visible to all verified recyclers on the platform. You can manage bids from your listings page.</p>
            </div>
          </div>
        )}

        {!submitted && <div className="flex justify-between mt-6 pt-4 border-t">
          <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || isLoading} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 disabled:opacity-50 text-gray-700 dark:text-gray-300">Back</button>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 1 && (!form.wasteType || !form.quantity)} className="px-6 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50">Next</button>
          ) : (
            <button onClick={handleSubmit} disabled={!form.wasteType || !form.quantity || !form.minPrice || !form.pickupDate || isLoading} className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">{isLoading ? 'Submitting...' : <><CheckCircle size={16} /> Submit Listing</>}</button>
          )}
        </div>}
      </div>
    </div>
  );
}
