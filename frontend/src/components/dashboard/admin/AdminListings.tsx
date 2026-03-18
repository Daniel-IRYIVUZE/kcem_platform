// pages/dashboard/admin/Listings.tsx
import { useState, useEffect } from 'react';
import { 
  Search, Eye, CheckCircle, XCircle, Trash2, X, 
  Package, Edit2, Download, Star,
} from 'lucide-react';
import { adminAPI, listingsAPI, resolveMediaUrl, type WasteListing, type ListingImage } from '../../../services/api';
import { downloadCSV } from '../../../utils/dataStore';

const MAX_LISTING_IMAGES = 5;

const emitListingsChanged = () => {
  window.dispatchEvent(new Event('ecotrade_data_change'));
};

const ALL_STATUSES = ['open', 'draft', 'accepting', 'closed', 'collected', 'completed', 'cancelled', 'expired'] as const;

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  draft: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  accepting: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  closed: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  completed: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  expired: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  collected: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

export default function AdminListings() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [usingListingsFallback, setUsingListingsFallback] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashType, setFlashType] = useState<'success' | 'error'>('success');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [wasteFilter, setWasteFilter] = useState('all');
  const [modal, setModal] = useState<'view' | 'delete' | 'edit' | null>(null);
  const [selected, setSelected] = useState<WasteListing | null>(null);
  const [loadingViewDetails, setLoadingViewDetails] = useState(false);
  const [editForm, setEditForm] = useState({
    waste_type: '',
    volume: '',
    unit: 'kg',
    min_bid: '',
    status: 'open',
    image_url: '',
  });
  const [loadingEditDetails, setLoadingEditDetails] = useState(false);
  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [primaryImageTarget, setPrimaryImageTarget] = useState<{ type: 'existing'; id: number } | { type: 'new'; index: number } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (newImageFiles.length === 0) {
      setNewImagePreviews([]);
      return;
    }
    const objectUrls = newImageFiles.map(file => URL.createObjectURL(file));
    setNewImagePreviews(objectUrls);
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
  }, [newImageFiles]);

  const load = async () => {
    const limit = 500;
    let skip = 0;
    const all: WasteListing[] = [];
    let usedFallback = false;

    try {
      while (true) {
        const page = await adminAPI.listListings({ status: 'all', skip, limit });
        all.push(...page.items);
        usedFallback = usedFallback || page.usedFallback;
        if (page.items.length < limit) break;
        skip += limit;
      }
      setListings(all);
      setUsingListingsFallback(usedFallback);
    } catch {
      setListings([]);
      setUsingListingsFallback(false);
    }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const handleDataChange = () => {
      load();
    };
    window.addEventListener('ecotrade_data_change', handleDataChange);
    return () => window.removeEventListener('ecotrade_data_change', handleDataChange);
  }, []);

  const wasteTypes = [...new Set(listings.map(l => l.waste_type))];
  
  const filtered = listings.filter(l =>
    (statusFilter === 'all' || l.status === statusFilter) &&
    (wasteFilter === 'all' || l.waste_type === wasteFilter) &&
    ((l.hotel_name || '').toLowerCase().includes(search.toLowerCase()) || 
     l.waste_type.toLowerCase().includes(search.toLowerCase()))
  );
  const removedExistingCount = removedImageIds.length;
  const currentEditImageCount = existingImages.filter((img) => !removedImageIds.includes(img.id)).length + newImageFiles.length;
  const remainingEditImageSlots = Math.max(0, MAX_LISTING_IMAGES - currentEditImageCount);

  const handleApprove = async (l: WasteListing) => { 
    try {
      await adminAPI.updateListing(l.id, { status: 'open' });
      setFlashType('success');
      setFlash('Listing status updated and saved to database.');
      setTimeout(() => setFlash(null), 2500);
      emitListingsChanged();
      await load();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to approve listing.';
      setFlashType('error');
      setFlash(msg);
    }
  };

  const handleReject = async (l: WasteListing) => { 
    try {
      await adminAPI.updateListing(l.id, { status: 'cancelled' });
      setFlashType('success');
      setFlash('Listing status updated and saved to database.');
      setTimeout(() => setFlash(null), 2500);
      emitListingsChanged();
      await load();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to reject listing.';
      setFlashType('error');
      setFlash(msg);
    }
  };

  const handleEditOpen = async (l: WasteListing) => {
    setSelected(l);
    setEditForm({
      waste_type: l.waste_type,
      volume: String(l.volume ?? ''),
      unit: l.unit || 'kg',
      min_bid: String(l.min_bid ?? ''),
      status: l.status,
      image_url: l.image_url || '',
    });
    setLoadingEditDetails(true);
    setExistingImages([]);
    setRemovedImageIds([]);
    setNewImageFiles([]);
    setPrimaryImageTarget(null);
    setModal('edit');

    try {
      const details = await listingsAPI.get(l.id);
      setSelected(details);
      const images = details.images || [];
      setExistingImages(images);
      if (images.length > 0) {
        const primary = images.find(img => img.is_primary) || images[0];
        setPrimaryImageTarget({ type: 'existing', id: primary.id });
      }
    } catch {
      const fallbackImages = l.images || [];
      setExistingImages(fallbackImages);
      if (fallbackImages.length > 0) {
        const primary = fallbackImages.find(img => img.is_primary) || fallbackImages[0];
        setPrimaryImageTarget({ type: 'existing', id: primary.id });
      }
    } finally {
      setLoadingEditDetails(false);
    }
  };

  const removeExistingImage = (imageId: number) => {
    setRemovedImageIds(prev => (prev.includes(imageId) ? prev : [...prev, imageId]));
    if (primaryImageTarget?.type === 'existing' && primaryImageTarget.id === imageId) {
      setPrimaryImageTarget(null);
    }
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPrimaryImageTarget(prev => {
      if (!prev || prev.type !== 'new') return prev;
      if (prev.index === indexToRemove) return null;
      if (prev.index > indexToRemove) return { type: 'new', index: prev.index - 1 };
      return prev;
    });
  };

  const handleSaveEdit = async () => {
    if (!selected) return;

    const normalizedWasteType = editForm.waste_type.trim();
    const volume = Number.parseFloat(editForm.volume);
    const minBid = Number.parseFloat(editForm.min_bid);

    if (!normalizedWasteType) {
      setFlashType('error');
      setFlash('Waste type is required.');
      return;
    }

    if (!Number.isFinite(volume) || volume <= 0) {
      setFlashType('error');
      setFlash('Volume must be greater than 0.');
      return;
    }

    if (!Number.isFinite(minBid) || minBid < 0) {
      setFlashType('error');
      setFlash('Min bid must be a valid non-negative number.');
      return;
    }

    setSavingEdit(true);
    try {
      const visibleExisting = existingImages.filter(img => !removedImageIds.includes(img.id));
      if (visibleExisting.length + newImageFiles.length > MAX_LISTING_IMAGES) {
        setFlashType('error');
        setFlash(`Each listing can have at most ${MAX_LISTING_IMAGES} images.`);
        return;
      }
      const removingAllExisting = existingImages.length > 0 && visibleExisting.length === 0;

      const payload: Partial<WasteListing> = {
        waste_type: normalizedWasteType,
        volume,
        unit: editForm.unit,
        min_bid: minBid,
        status: editForm.status,
      };

      if (removingAllExisting && newImageFiles.length === 0) {
        payload.image_url = undefined;
      }

      await adminAPI.updateListing(selected.id, payload);

      for (const imageId of removedImageIds) {
        try {
          await adminAPI.deleteListingImage(selected.id, imageId);
        } catch (error) {
          const message = error instanceof Error ? error.message.toLowerCase() : '';
          if (message.includes('404') || message.includes('image not found')) {
            continue;
          }
          throw error;
        }
      }

      const uploadedNewImages: ListingImage[] = [];
      for (const file of newImageFiles) {
        const uploaded = await adminAPI.uploadListingImage(selected.id, file);
        uploadedNewImages.push(uploaded);
      }

      if (primaryImageTarget) {
        if (primaryImageTarget.type === 'existing') {
          if (!removedImageIds.includes(primaryImageTarget.id)) {
            await adminAPI.setPrimaryListingImage(selected.id, primaryImageTarget.id);
          }
        } else {
          const uploadedPrimary = uploadedNewImages[primaryImageTarget.index];
          if (uploadedPrimary) {
            await adminAPI.setPrimaryListingImage(selected.id, uploadedPrimary.id);
          }
        }
      }

      setModal(null);
      setFlashType('success');
      setFlash('Listing changes saved to database successfully.');
      setTimeout(() => setFlash(null), 2500);
      emitListingsChanged();
      await load();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save listing changes.';
      setFlashType('error');
      setFlash(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => { 
    if (selected) {
      try {
        await adminAPI.deleteListing(selected.id);
        setModal(null);
        setFlashType('success');
        setFlash('Listing deleted from database successfully.');
        setTimeout(() => setFlash(null), 2500);
        emitListingsChanged();
        await load();
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to delete listing.';
        setFlashType('error');
        setFlash(msg);
      }
    }
  };

  const listingPreviewUrl = (listing: WasteListing) => {
    const primary = listing.images?.find(img => img.is_primary)?.url;
    return resolveMediaUrl(primary || listing.image_url || listing.images?.[0]?.url) || null;
  };

  const openViewModal = async (listing: WasteListing) => {
    setSelected(listing);
    setModal('view');
    setLoadingViewDetails(true);
    try {
      const details = await listingsAPI.get(listing.id);
      setSelected(details);
    } catch {
      // keep base listing already in state
    } finally {
      setLoadingViewDetails(false);
    }
  };

  const handleExport = () => {
    downloadCSV('listings', 
      ['ID', 'Hotel', 'Waste Type', 'Volume', 'Unit', 'Min Bid', 'Status', 'Date'],
      filtered.map(l => [
        String(l.id), 
        l.hotel_name || 'N/A', 
        l.waste_type, 
        String(l.volume), 
        l.unit, 
        String(l.min_bid), 
        l.status, 
        new Date(l.created_at).toLocaleDateString()
      ])
    );
  };

  return (
    <div className="space-y-4">
      {flash && (
        <div className={`rounded-lg px-4 py-2 text-sm border ${
          flashType === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {flash}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Package size={20} className="text-cyan-600" />
          Listings Management
        </h2>
        <button 
          onClick={handleExport} 
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {usingListingsFallback && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 text-sm text-amber-800 dark:text-amber-300">
          Admin listings endpoint is unavailable. Showing fallback listing data from public listings.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search hotel, waste type..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Status</option>
          {['open', 'draft', 'accepting', 'closed', 'collected', 'completed', 'cancelled', 'expired'].map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <select 
          value={wasteFilter} 
          onChange={e => setWasteFilter(e.target.value)} 
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Types</option>
          {wasteTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Listings Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['ID', 'Hotel', 'Image', 'Waste Type', 'Volume', 'Min Bid', 'Total Amount', 'Bids', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No listings found
                  </td>
                </tr>
              )}
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                    #{String(l.id)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                    {l.hotel_name}
                  </td>
                  <td className="px-4 py-3">
                    {listingPreviewUrl(l) ? (
                      <img
                        src={listingPreviewUrl(l) || ''}
                        alt={`Listing ${l.id}`}
                        className="h-10 w-10 rounded object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded border border-dashed border-gray-300 dark:border-gray-600 text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-center">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {l.waste_type}
                  </td>
                  <td className="px-4 py-3">
                    {l.volume} {l.unit}
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                    RWF {(l.min_bid ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-300">
                    RWF {((l.volume || 0) * (l.min_bid || 0)).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                      {l.bid_count ?? 0} bids
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openViewModal(l)} 
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleEditOpen(l)} 
                        className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                        title="Edit Listing"
                      >
                        <Edit2 size={14} />
                      </button>
                      {l.status === 'draft' && (
                        <>
                          <button 
                            onClick={() => handleApprove(l)} 
                            className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button 
                            onClick={() => handleReject(l)} 
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => { setSelected(l); setModal('delete'); }} 
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Listing Details
              </h3>
              <button 
                onClick={() => setModal(null)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {loadingViewDetails && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading listing details...</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  ['ID', String(selected.id)],
                  ['Hotel', selected.hotel_name],
                  ['Waste Type', selected.waste_type],
                  ['Volume', `${selected.volume} ${selected.unit}`],
                  ['Min Bid', `RWF ${(selected.min_bid ?? 0).toLocaleString()}`],
                  ['Total Amount', `RWF ${((selected.volume || 0) * (selected.min_bid || 0)).toLocaleString()}`],
                  ['Status', selected.status],
                  ['Total Bids', selected.bid_count ?? 0],
                  ['Created', new Date(selected.created_at).toLocaleDateString()],
                  ['Expires', selected.expires_at ? new Date(selected.expires_at).toLocaleDateString() : 'N/A']
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{String(k)}:</span>{' '}
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{String(v)}</span>
                  </div>
                ))}
              </div>
              
              {selected.special_instructions && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  <strong className="block mb-1">Instructions:</strong>
                  {selected.special_instructions}
                </div>
              )}
              
              {(selected.bid_count ?? 0) > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <strong>{selected.bid_count}</strong> bid(s) placed on this listing.
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Images</p>
                {selected.images && selected.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selected.images.map(img => (
                      <div key={img.id} className="space-y-1">
                        <img src={resolveMediaUrl(img.url)} alt={`Listing ${selected.id} image`} className="h-20 w-full rounded object-cover border border-gray-200 dark:border-gray-700" />
                        {img.is_primary && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                            <Star size={11} /> Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : listingPreviewUrl(selected) ? (
                  <img src={listingPreviewUrl(selected) || ''} alt={`Listing ${selected.id}`} className="h-24 w-24 rounded object-cover border border-gray-200 dark:border-gray-700" />
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No images uploaded.</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              {selected.status === 'draft' && (
                <>
                  <button 
                    onClick={() => { handleApprove(selected); setModal(null); }} 
                    className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => { handleReject(selected); setModal(null); }} 
                    className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button 
                onClick={() => setModal(null)} 
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              Delete Listing?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
              Delete listing from <strong>{selected.hotel_name}</strong>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setModal(null)} 
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {modal === 'edit' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                Edit Listing
              </h3>
              <button 
                onClick={() => setModal(null)} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Listing <strong>#{String(selected.id)}</strong> — <strong>{selected.hotel_name}</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Waste Type</label>
                <input
                  value={editForm.waste_type}
                  onChange={e => setEditForm(prev => ({ ...prev, waste_type: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Volume</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.volume}
                  onChange={e => setEditForm(prev => ({ ...prev, volume: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Unit</label>
                <input
                  value={editForm.unit}
                  onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Min Bid (RWF)</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.min_bid}
                  onChange={e => setEditForm(prev => ({ ...prev, min_bid: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Listing Images</label>
                  <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">After save: {currentEditImageCount}/{MAX_LISTING_IMAGES}</span>
                </div>
                {removedExistingCount > 0 && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mb-1">Marked for removal: {removedExistingCount}</p>
                )}
                {loadingEditDetails ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading images...</p>
                ) : (
                  <div className="space-y-3">
                    {existingImages.length > 0 ? (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Existing Images (all visible)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {existingImages
                            .map(img => {
                              const isRemoved = removedImageIds.includes(img.id);
                              const isPrimary = primaryImageTarget?.type === 'existing' && primaryImageTarget.id === img.id;
                              return (
                                <div key={img.id} className={`border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2 ${isRemoved ? 'opacity-55' : ''}`}>
                                  <img src={resolveMediaUrl(img.url)} alt={`Listing ${selected.id} image`} className="h-24 w-full object-cover rounded" />
                                  {isRemoved && (
                                    <p className="text-[11px] text-red-600 dark:text-red-300">Marked for removal on save</p>
                                  )}
                                  <div className="flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setPrimaryImageTarget({ type: 'existing', id: img.id })}
                                      disabled={isRemoved}
                                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isPrimary ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                    >
                                      <Star size={12} />
                                      {isPrimary ? 'Primary' : 'Set Primary'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isRemoved) {
                                          setRemovedImageIds(prev => prev.filter(id => id !== img.id));
                                        } else {
                                          removeExistingImage(img.id);
                                        }
                                      }}
                                      className={`text-xs px-2 py-1 rounded ${isRemoved ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}
                                    >
                                      {isRemoved ? 'Undo' : 'Remove'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">No existing images.</p>
                    )}

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Add Images</p>
                      <p className="text-xs text-cyan-700 dark:text-cyan-300 mb-2">Remaining slots: {remainingEditImageSlots}</p>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        onChange={e => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          const visibleExistingCount = existingImages.filter((img) => !removedImageIds.includes(img.id)).length;
                          const availableSlots = Math.max(0, MAX_LISTING_IMAGES - visibleExistingCount);

                          setNewImageFiles(prev => {
                            const uniqueIncoming = files.filter((file) => !prev.some((p) => p.name === file.name && p.size === file.size && p.lastModified === file.lastModified));
                            const merged = [...prev, ...uniqueIncoming];
                            const next = merged.slice(0, availableSlots);
                            if (next.length < merged.length) {
                              setFlashType('error');
                              setFlash(`Maximum ${MAX_LISTING_IMAGES} images allowed per listing.`);
                            }
                            if (!primaryImageTarget && next.length > 0) {
                              setPrimaryImageTarget({ type: 'new', index: 0 });
                            }
                            return next;
                          });
                          e.currentTarget.value = '';
                        }}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                      />
                    </div>

                    {newImageFiles.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">New Images (upload on save)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {newImageFiles.map((file, index) => {
                            const isPrimary = primaryImageTarget?.type === 'new' && primaryImageTarget.index === index;
                            return (
                              <div key={`${file.name}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2">
                                <img src={newImagePreviews[index]} alt={file.name} className="h-24 w-full object-cover rounded" />
                                <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate" title={file.name}>{file.name}</p>
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryImageTarget({ type: 'new', index })}
                                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isPrimary ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                  >
                                    <Star size={12} />
                                    {isPrimary ? 'Primary' : 'Set Primary'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    className="text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setModal(null)} 
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit} 
                disabled={savingEdit}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition-colors"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}