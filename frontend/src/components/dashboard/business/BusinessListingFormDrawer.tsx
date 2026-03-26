import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Trash2, UploadCloud, X } from 'lucide-react';
import { listingsAPI } from '../../../services/api';

interface BusinessListingFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type ListingForm = {
  wasteType: string;
  quantity: string;
  unit: string;
  description: string;
  unitPrice: string;
  pickupDate: string;
  pickupTime: string;
  specialInstructions: string;
};

const MAX_FILES = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const getFileSignature = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const defaultForm: ListingForm = {
  wasteType: '',
  quantity: '',
  unit: 'kg',
  description: '',
  unitPrice: '',
  pickupDate: '',
  pickupTime: '',
  specialInstructions: '',
};

const wasteTypeOptions = [
  'UCO',
  'Glass',
  'Paper/Cardboard',
  'Organic',
  'Plastic',
  'Metal',
  'Electronic',
  'Textile',
  'Mixed',
  'Other',
];

export default function BusinessListingFormDrawer({ open, onClose, onCreated }: BusinessListingFormDrawerProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState<ListingForm>(defaultForm);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setError(null);
      setDragActive(false);
      setIsLoading(false);
      setForm(defaultForm);
      setFiles([]);
    }
  }, [open]);

  const previews = useMemo(
    () => files.map((file) => ({ key: `${file.name}-${file.size}-${file.lastModified}`, url: URL.createObjectURL(file), file })),
    [files],
  );

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const update = (field: keyof ListingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;

    const validIncoming = Array.from(incoming).filter((file) => ACCEPTED_TYPES.includes(file.type));
    if (validIncoming.length === 0) {
      setError('Only JPG, PNG, and WEBP images are allowed.');
      return;
    }

    setFiles((prev) => {
      const existing = new Set(prev.map(getFileSignature));
      const uniqueIncoming = validIncoming.filter((file) => !existing.has(getFileSignature(file)));
      const deduped = [...prev, ...uniqueIncoming];

      if (uniqueIncoming.length < validIncoming.length) {
        setError('Duplicate images were skipped.');
      }

      if (deduped.length > MAX_FILES) {
        setError(`You can upload a maximum of ${MAX_FILES} images.`);
      }
      return deduped.slice(0, MAX_FILES);
    });
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const quantityValue = Number.parseFloat(form.quantity);
  const unitPriceValue = Number.parseFloat(form.unitPrice);
  const remainingSlots = Math.max(0, MAX_FILES - files.length);
  const totalMinPrice =
    Number.isFinite(quantityValue) && quantityValue > 0 && Number.isFinite(unitPriceValue) && unitPriceValue > 0
      ? quantityValue * unitPriceValue
      : 0;

  const canGoStep2 = Boolean(form.wasteType && form.quantity);
  const canGoStep3 = Boolean(totalMinPrice > 0 && form.pickupDate);

  const handleSubmit = async () => {
    if (!canGoStep2 || !canGoStep3 || files.length === 0) {
      setError('Please complete required fields and add at least one image.');
      return;
    }

    if (files.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} images.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const qty = Number.parseFloat(form.quantity);
      const minBid = unitPriceValue; // store per-unit price; Total Amount = volume × min_bid
      const startAt = form.pickupDate ? new Date(`${form.pickupDate}T${form.pickupTime || '09:00'}`) : null;
      const endAt = startAt ? new Date(startAt.getTime() + 2 * 60 * 60 * 1000) : null;
      const expiresAt = startAt ? new Date(startAt) : new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const created = await listingsAPI.create({
        title: `${form.wasteType} - ${qty} ${form.unit}`,
        waste_type: form.wasteType,
        volume: Number.isFinite(qty) ? qty : 0,
        unit: form.unit,
        min_bid: Number.isFinite(minBid) ? minBid : 0,
        description: form.description || undefined,
        collection_window_start: startAt?.toISOString(),
        collection_window_end: endAt?.toISOString(),
        expires_at: expiresAt.toISOString(),
        notes: form.specialInstructions || undefined,
      });

      let primaryUrl: string | undefined;
      for (let i = 0; i < files.length; i += 1) {
        const img = await listingsAPI.uploadImage(created.id, files[i]);
        if (i === 0) primaryUrl = img.url;
      }

      if (primaryUrl) {
        await listingsAPI.update(created.id, { image_url: primaryUrl });
      }

      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full sm:w-170 bg-white dark:bg-gray-900 z-50 shadow-2xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Listing</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mb-6 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-1 mx-1 rounded ${step > s ? 'bg-cyan-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Waste Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Waste Type *</label>
                  <select value={form.wasteType} onChange={(e) => update('wasteType', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <option value="">Select type...</option>
                    {wasteTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity *</label>
                    <input type="number" min="0" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" placeholder="e.g. 500" />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Unit</label>
                    <select value={form.unit} onChange={(e) => update('unit', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <option value="kg">kg</option>
                      <option value="liters">liters</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" placeholder="Describe quality and source..." />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Images * (max {MAX_FILES})</label>
                  <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">{files.length}/{MAX_FILES} images</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.currentTarget.value = '';
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    addFiles(e.dataTransfer.files);
                  }}
                  className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition ${dragActive ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-cyan-400'}`}
                >
                  <UploadCloud className="mx-auto mb-2 text-gray-400" size={28} />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drag and drop images here</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">or click to select files</p>
                  <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">Remaining slots: {remainingSlots}</p>
                </button>

                {files.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previews.map((p, idx) => (
                      <div key={p.key} className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={p.url} alt={p.file.name} className="w-full h-24 object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[10px] px-2 py-1 truncate">{p.file.name}</div>
                        <button type="button" onClick={() => removeFile(idx)} className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white hover:bg-black/75" aria-label="Remove image">
                          <Trash2 size={12} />
                        </button>
                        {idx === 0 && <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-cyan-600 text-white">Primary</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pickup & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price per {form.unit || 'unit'} (RWF) *</label>
                  <input type="number" min="0" value={form.unitPrice} onChange={(e) => update('unitPrice', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" placeholder="e.g. 500" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum price = Quantity × Price per {form.unit || 'unit'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Pickup Date *</label>
                  <input type="date" value={form.pickupDate} onChange={(e) => update('pickupDate', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Pickup Time</label>
                  <input type="time" value={form.pickupTime} onChange={(e) => update('pickupTime', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" />
                </div>
              </div>
              <div className="rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 p-3">
                <p className="text-xs text-cyan-700 dark:text-cyan-300">Total Minimum Price</p>
                <p className="text-lg font-bold text-cyan-700 dark:text-cyan-300">RWF {totalMinPrice.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Special Instructions</label>
                <textarea value={form.specialInstructions} onChange={(e) => update('specialInstructions', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" placeholder="Loading dock access, contact person, etc." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Submit</h3>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500">Waste Type</p><p className="font-semibold text-gray-900 dark:text-white">{form.wasteType || '—'}</p></div>
                  <div><p className="text-gray-500">Quantity</p><p className="font-semibold text-gray-900 dark:text-white">{form.quantity ? `${form.quantity} ${form.unit}` : '—'}</p></div>
                  <div><p className="text-gray-500">Price per {form.unit || 'unit'}</p><p className="font-semibold text-gray-900 dark:text-white">{form.unitPrice ? `RWF ${Number.parseInt(form.unitPrice, 10).toLocaleString()}` : '—'}</p></div>
                  <div><p className="text-gray-500">Total Amount</p><p className="font-semibold text-gray-900 dark:text-white">RWF {totalMinPrice.toLocaleString()}</p></div>
                  <div><p className="text-gray-500">Pickup</p><p className="font-semibold text-gray-900 dark:text-white">{form.pickupDate || '—'} {form.pickupTime || ''}</p></div>
                </div>
                <div><p className="text-gray-500 text-sm">Images</p><p className="font-semibold text-gray-900 dark:text-white">{files.length}/{MAX_FILES} selected</p></div>
                {form.description && <div><p className="text-gray-500 text-sm">Description</p><p className="text-sm text-gray-700 dark:text-gray-300">{form.description}</p></div>}
              </div>

              <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 flex gap-2">
                <AlertTriangle size={16} className="text-yellow-700 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">After submit, this listing becomes visible to recyclers and bidding can start immediately.</p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || isLoading}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={isLoading || (step === 1 ? !canGoStep2 || files.length === 0 : !canGoStep3)}
              className="px-5 py-2 text-sm rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || files.length === 0}
              className="px-5 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={15} /> Publishing...</> : <><CheckCircle2 size={15} /> Publish Listing</>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
