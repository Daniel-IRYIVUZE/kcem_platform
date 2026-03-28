// components/dashboard/business/BusinessListings.tsx
import { useState, useEffect } from 'react';
import { toDataURL as qrToDataURL } from 'qrcode';
import { listingsAPI, resolveMediaUrl, type WasteListing, type Bid, type ListingImage } from '../../../services/api';
import { downloadCSV, saveAll } from '../../../utils/dataStore';
import { Package, CheckCircle, Clock, Eye, PlusCircle, Download, Search, Trash2, X, Edit2, Image as ImageIcon, Star, Check, QrCode } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';
import BusinessListingFormDrawer from './BusinessListingFormDrawer';

const MAX_LISTING_IMAGES = 5;

const emitListingsChanged = () => {
  window.dispatchEvent(new Event('ecotrade_data_change'));
};

export default function BusinessListings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBidModal, setShowBidModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [viewListing, setViewListing] = useState<WasteListing | null>(null);
  const [loadingViewDetails, setLoadingViewDetails] = useState(false);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<WasteListing | null>(null);
  const [selectedBids, setSelectedBids] = useState<Bid[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashType, setFlashType] = useState<'success' | 'error'>('success');
  const [bidModalMessage, setBidModalMessage] = useState<string | null>(null);
  const [bidModalMessageType, setBidModalMessageType] = useState<'success' | 'error'>('success');
  const [savingEdit, setSavingEdit] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [editForm, setEditForm] = useState({
    waste_type: '',
    volume: '',
    unit: 'kg',
    min_bid: '',
    description: '',
  });
  const [loadingEditDetails, setLoadingEditDetails] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalToken, setQrModalToken] = useState<string | null>(null);
  const [qrModalDataUrl, setQrModalDataUrl] = useState<string | null>(null);
  const [qrModalListingId, setQrModalListingId] = useState<number | null>(null);
  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [primaryImageTarget, setPrimaryImageTarget] = useState<{ type: 'existing'; id: number } | { type: 'new'; index: number } | null>(null);

  useEffect(() => {
    if (newImageFiles.length === 0) {
      setNewImagePreviews([]);
      return;
    }
    const objectUrls = newImageFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [newImageFiles]);

  // Generate QR code whenever the viewed listing changes and has a token
  useEffect(() => {
    setQrDataUrl(null);
    if (!viewListing?.qr_token) return;
    let cancelled = false;
    qrToDataURL(viewListing.qr_token, { width: 220, margin: 2, color: { dark: '#0e7490', light: '#ffffff' } })
      .then(url => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [viewListing?.qr_token]);

  // Generate QR for the quick-view modal (triggered from table row)
  useEffect(() => {
    setQrModalDataUrl(null);
    if (!qrModalToken) return;
    let cancelled = false;
    qrToDataURL(qrModalToken, { width: 260, margin: 2, color: { dark: '#0e7490', light: '#ffffff' } })
      .then(url => { if (!cancelled) setQrModalDataUrl(url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [qrModalToken]);

  const loadListings = () => listingsAPI.mine().then(setListings).catch(() => {});

  // Initial load + reload on data-change events
  useEffect(() => {
    loadListings();
    const handleDataChange = () => loadListings();
    window.addEventListener('ecotrade_data_change', handleDataChange);
    return () => window.removeEventListener('ecotrade_data_change', handleDataChange);
  }, []);

  const filtered = listings.filter(l => {
    const matchSearch = l.waste_type.toLowerCase().includes(search.toLowerCase()) || String(l.id).includes(search);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const removedExistingCount = removedImageIds.length;
  const currentEditImageCount = existingImages.filter((img) => !removedImageIds.includes(img.id)).length + newImageFiles.length;
  const remainingEditImageSlots = Math.max(0, MAX_LISTING_IMAGES - currentEditImageCount);
  const totalAmount = listings.reduce((sum, listing) => sum + ((listing.volume || 0) * (listing.min_bid || 0)), 0);

  const listingPreviewUrl = (listing: WasteListing) => {
    const primary = listing.images?.find(img => img.is_primary)?.url;
    return resolveMediaUrl(primary || listing.image_url || listing.images?.[0]?.url) || null;
  };

  const openViewModal = async (listing: WasteListing) => {
    setViewListing(listing);
    setShowViewModal(true);
    setLoadingViewDetails(true);
    try {
      const details = await listingsAPI.get(listing.id);
      setViewListing(details); // triggers the qr_token useEffect above
    } catch {
      // keep existing listing details in modal
    } finally {
      setLoadingViewDetails(false);
    }
  };

  const openQrModal = (listing: WasteListing) => {
    setQrModalToken(listing.qr_token ?? null);
    setQrModalListingId(listing.id);
    setShowQrModal(true);
  };

  const openBidsModal = (listing: WasteListing) => {
    setSelectedListing(listing);
    setSelectedBids([]);
    setBidModalMessage(null);
    setShowBidModal(true);
    setBidsLoading(true);
    listingsAPI.getBids(listing.id).then(bids => { setSelectedBids(bids); setBidsLoading(false); }).catch(() => setBidsLoading(false));
  };

  const handleAcceptBid = async (listingId: number, bidId: number) => {
    try {
      await listingsAPI.acceptBid(listingId, bidId);
      setBidModalMessageType('success');
      setBidModalMessage('Bid accepted successfully.');
      // Refresh listing summary and bid list to reflect accepted/rejected statuses.
      loadListings();
      listingsAPI.getBids(listingId).then(setSelectedBids).catch(() => {});
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to accept bid.';
      setBidModalMessageType('error');
      setBidModalMessage(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this listing?')) {
      try {
        await listingsAPI.delete(id);
        saveAll('listings', []);
        setFlashType('success');
        setFlash('Listing deleted successfully from database.');
        setTimeout(() => setFlash(null), 2500);
        emitListingsChanged();
        loadListings();
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to delete listing.';
        setFlashType('error');
        setFlash(msg);
      }
    }
  };

  const handleExport = () => {
    downloadCSV('my_listings', ['ID','Type','Volume','Unit','Min Bid','Status','Bids','Posted'],
      filtered.map(l => [String(l.id), l.waste_type, String(l.volume), l.unit, String(l.min_bid), l.status, String(l.bid_count || 0), new Date(l.created_at).toLocaleDateString()]));
  };

  const openEditModal = async (listing: WasteListing) => {
    setSelectedListing(listing);
    setEditForm({
      waste_type: listing.waste_type,
      volume: String(listing.volume ?? ''),
      unit: listing.unit || 'kg',
      min_bid: String(listing.min_bid ?? ''),
      description: listing.description || '',
    });
    setLoadingEditDetails(true);
    setExistingImages([]);
    setRemovedImageIds([]);
    setNewImageFiles([]);
    setPrimaryImageTarget(null);
    setShowSavedToast(false);
    setShowEditModal(true);

    try {
      const details = await listingsAPI.get(listing.id);
      setSelectedListing(details);
      const images = details.images || [];
      setExistingImages(images);
      if (images.length > 0) {
        const currentPrimary = images.find((img) => img.is_primary) || images[0];
        setPrimaryImageTarget({ type: 'existing', id: currentPrimary.id });
      }
    } catch {
      const fallbackImages = listing.images || [];
      setExistingImages(fallbackImages);
      if (fallbackImages.length > 0) {
        const currentPrimary = fallbackImages.find((img) => img.is_primary) || fallbackImages[0];
        setPrimaryImageTarget({ type: 'existing', id: currentPrimary.id });
      }
    } finally {
      setLoadingEditDetails(false);
    }
  };

  const removeExistingImage = (imageId: number) => {
    setRemovedImageIds((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
    if (primaryImageTarget?.type === 'existing' && primaryImageTarget.id === imageId) {
      setPrimaryImageTarget(null);
    }
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPrimaryImageTarget((prev) => {
      if (!prev || prev.type !== 'new') return prev;
      if (prev.index === indexToRemove) return null;
      if (prev.index > indexToRemove) return { type: 'new', index: prev.index - 1 };
      return prev;
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedListing) return;

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
      const visibleExisting = existingImages.filter((img) => !removedImageIds.includes(img.id));
      if (visibleExisting.length + newImageFiles.length > MAX_LISTING_IMAGES) {
        setFlashType('error');
        setFlash(`Each listing can have at most ${MAX_LISTING_IMAGES} images.`);
        return;
      }
      const removingAllExistingImages = existingImages.length > 0 && visibleExisting.length === 0;

      const payload: Partial<WasteListing> = {
        waste_type: normalizedWasteType,
        volume,
        unit: editForm.unit,
        min_bid: minBid,
        description: editForm.description || undefined,
      };

      if (removingAllExistingImages && newImageFiles.length === 0) {
        payload.image_url = undefined;
      }

      await listingsAPI.update(selectedListing.id, payload);

      for (const imageId of removedImageIds) {
        try {
          await listingsAPI.deleteImage(selectedListing.id, imageId);
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
        const uploaded = await listingsAPI.uploadImage(selectedListing.id, file);
        uploadedNewImages.push(uploaded);
      }

      if (primaryImageTarget) {
        if (primaryImageTarget.type === 'existing') {
          if (!removedImageIds.includes(primaryImageTarget.id)) {
            await listingsAPI.setPrimaryImage(selectedListing.id, primaryImageTarget.id);
          }
        } else {
          const uploadedPrimary = uploadedNewImages[primaryImageTarget.index];
          if (uploadedPrimary) {
            await listingsAPI.setPrimaryImage(selectedListing.id, uploadedPrimary.id);
          }
        }
      }

      setShowSavedToast(true);
      await new Promise((resolve) => setTimeout(resolve, 350));
      setShowSavedToast(false);
      setShowEditModal(false);
      setFlashType('success');
      setFlash('Listing changes saved to database successfully.');
      setTimeout(() => setFlash(null), 2500);
      emitListingsChanged();
      loadListings();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update listing.';
      setFlashType('error');
      setFlash(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {flash && (
        <div className={`px-4 py-2 rounded-lg text-sm border ${
          flashType === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {flash}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Waste Listings</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Download size={16}/> CSV</button>
          <button onClick={() => setShowCreateDrawer(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"><PlusCircle size={16} /> New Listing</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="All Listings" value={listings.length} icon={<Package size={22} />} color="cyan" />
        <StatCard title="Active" value={listings.filter(l => l.status === 'open').length} icon={<CheckCircle size={22} />} color="blue" />
        <StatCard title="Assigned" value={listings.filter(l => l.status === 'assigned' || l.status === 'accepting' || l.status === 'closed').length} icon={<Clock size={22} />} color="purple" />
        <StatCard title="Total Bids" value={listings.reduce((a, l) => a + (l.bid_count || 0), 0)} icon={<Eye size={22} />} color="orange" />
        <StatCard title="Total Amount" value={`RWF ${totalAmount.toLocaleString()}`} icon={<ImageIcon size={22} />} color="yellow" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="all">All Status</option><option value="open">Open</option><option value="accepting">Accepting</option><option value="closed">Closed</option><option value="assigned">Assigned</option><option value="completed">Completed</option></select>
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'ID', render: (v: number) => <span className="font-mono text-sm">#{v}</span> },
            {
              key: 'image_url',
              label: 'Image',
              render: (_v: string, r: WasteListing) =>
                listingPreviewUrl(r) ? (
                  <img
                    src={listingPreviewUrl(r) || ''}
                    alt={`Listing ${r.id}`}
                    className="h-10 w-10 rounded object-cover border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-10 w-10 rounded border border-dashed border-gray-300 dark:border-gray-600 text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-center">
                    No Img
                  </div>
                ),
            },
            { key: 'waste_type', label: 'Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
            { key: 'volume', label: 'Volume', render: (v: number, r: WasteListing) => <span>{v} {r.unit}</span> },
            { key: 'min_bid', label: 'Price/unit', render: (v: number, r: WasteListing) => <span>RWF {v.toLocaleString()}/{r.unit || 'unit'}</span> },
            {
              key: 'total_amount',
              label: 'Total Amount',
              render: (_v: number, r: WasteListing) => (
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  RWF {((r.volume || 0) * (r.min_bid || 0)).toLocaleString()}
                </span>
              ),
            },
            { key: 'bid_count', label: 'Bids', render: (v: number, r: WasteListing) => (
              <button onClick={() => openBidsModal(r)} className={`font-semibold ${(v || 0) > 0 ? 'text-cyan-600 hover:underline cursor-pointer' : 'text-gray-400 dark:text-gray-500'}`}>{v || 0} bids</button>
            )},
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: 'created_at', label: 'Posted', render: (v: string) => <span className="text-sm">{new Date(v).toLocaleDateString()}</span> },
            { key: 'qr_token', label: 'QR', render: (v: string | undefined) => v
              ? <span title="Has QR code" className="inline-flex items-center justify-center w-6 h-6 rounded bg-cyan-50 dark:bg-cyan-900/30"><QrCode size={13} className="text-cyan-600" /></span>
              : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
            },
            { key: 'id', label: 'Actions', render: (_v: number, r: WasteListing) => (
              <div className="flex gap-1">
                <button onClick={() => openEditModal(r)} title="Edit" className="p-1.5 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded"><Edit2 size={15} /></button>
                {r.status === 'open' && <button onClick={() => handleDelete(r.id)} title="Delete" className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={15} /></button>}
                <button onClick={() => openViewModal(r)} title="View details" className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Eye size={15} /></button>
                {r.qr_token && <button onClick={() => openQrModal(r)} title="Show QR code" className="p-1.5 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded"><QrCode size={15} /></button>}
              </div>
            )},
          ]}
          data={filtered}
          pageSize={6}
        />
      </div>
      {showViewModal && viewListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Listing #{viewListing.id}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 dark:bg-gray-700 rounded"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              {loadingViewDetails && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading listing details...</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Waste Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{viewListing.waste_type}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Volume</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{viewListing.volume} {viewListing.unit}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Price per {viewListing.unit || 'unit'}</p>
                  <p className="font-semibold text-cyan-600">RWF {(viewListing.min_bid ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Total Amount</p>
                  <p className="font-semibold text-emerald-600">RWF {((viewListing.volume || 0) * (viewListing.min_bid || 0)).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Highest Bid</p>
                  <p className="font-semibold text-green-600">{viewListing.highest_bid > 0 ? `RWF ${viewListing.highest_bid.toLocaleString()}` : '—'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    viewListing.status === 'open' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' :
                    viewListing.status === 'assigned' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>{viewListing.status}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Total Bids</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{viewListing.bid_count || 0}</p>
                </div>
              </div>
              {viewListing.description && (
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-gray-700 dark:text-gray-300">{viewListing.description}</p>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Posted</p>
                <p className="text-gray-700 dark:text-gray-300">{new Date(viewListing.created_at).toLocaleString()}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Images</p>
                {viewListing.images && viewListing.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {viewListing.images.map((img) => (
                      <div key={img.id} className="space-y-1">
                        <img src={resolveMediaUrl(img.url)} alt={`Listing ${viewListing.id} image`} className="h-20 w-full rounded object-cover border border-gray-200 dark:border-gray-700" />
                        {img.is_primary && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                            <Star size={11} /> Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : listingPreviewUrl(viewListing) ? (
                  <img src={listingPreviewUrl(viewListing) || ''} alt={`Listing ${viewListing.id}`} className="h-24 w-24 rounded object-cover border border-gray-200 dark:border-gray-700" />
                ) : (
                  <p className="text-xs text-gray-500">No images uploaded.</p>
                )}
              </div>

              {/* QR Code — inside space-y-3 for consistent spacing */}
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode size={16} className="text-cyan-600" />
                  <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Collection QR Code</p>
                </div>
                {qrDataUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={qrDataUrl}
                      alt="Collection QR Code"
                      className="rounded-xl border-2 border-cyan-200 dark:border-cyan-700 shadow-sm"
                      style={{ width: 200, height: 200 }}
                    />
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 text-center">
                      Show this QR to the driver on arrival — scanning auto-confirms pickup
                    </p>
                    <a
                      href={qrDataUrl}
                      download={`listing-${viewListing.id}-qr.png`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 px-3 py-1.5 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors"
                    >
                      <Download size={12} /> Download QR Code
                    </a>
                  </div>
                ) : loadingViewDetails ? (
                  <p className="text-xs text-cyan-500 dark:text-cyan-400 animate-pulse">Generating QR code…</p>
                ) : (
                  <p className="text-xs text-gray-400">QR code not available for this listing.</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => { setShowViewModal(false); openBidsModal(viewListing); }} className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 font-medium">View Bids ({viewListing.bid_count || 0})</button>
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
      {showBidModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowBidModal(false); setBidModalMessage(null); }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-xl font-bold">Bids for #{selectedListing.id}</h2><p className="text-sm text-gray-500 dark:text-gray-400">{selectedListing.waste_type} — {selectedListing.volume} {selectedListing.unit} · Price/{selectedListing.unit || 'unit'}: RWF {(selectedListing.min_bid ?? 0).toLocaleString()} · Total Amount: RWF {((selectedListing.volume || 0) * (selectedListing.min_bid || 0)).toLocaleString()}</p></div>
              <button onClick={() => { setShowBidModal(false); setBidModalMessage(null); }} className="p-1 hover:bg-gray-100 dark:bg-gray-700 rounded"><X size={20} /></button>
            </div>
            {bidModalMessage && (
              <div className={`mb-4 p-3 rounded-lg border text-sm ${
                bidModalMessageType === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}>
                {bidModalMessage}
              </div>
            )}
            {bidsLoading ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">Loading bids…</p>
            ) : selectedBids.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">No bids yet</p>
            ) : (
              <div className="space-y-3">
                {[...selectedBids].sort((a,b)=>b.amount-a.amount).map((bid, idx) => (
                  <div key={bid.id} className={`p-4 rounded-lg border ${idx === 0 ? 'border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{bid.recycler_name}</p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className={`font-medium ${bid.status === 'accepted' ? 'text-green-600 dark:text-green-400' : ''}`}>{bid.status}</span>
                          {(bid as any).quantity && <span>{(bid as any).quantity} {selectedListing.unit}</span>}
                          <span>{new Date(bid.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(bid as any).quantity ? `For ${(bid as any).quantity} ${selectedListing.unit}` : 'Total Bid Price'}</p>
                        <p className="text-lg font-bold text-cyan-600">RWF {(bid.amount ?? 0).toLocaleString()}</p>
                        {bid.status === 'active' && <button onClick={() => handleAcceptBid(selectedListing.id, bid.id)} className="mt-1 px-3 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700">Accept Bid</button>}
                        {bid.status === 'accepted' && <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-0.5"><Check size={11}/> Accepted</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showEditModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !savingEdit && !showSavedToast && setShowEditModal(false)}>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {showSavedToast && (
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                Saved
              </div>
            )}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Listing #{selectedListing.id}</h2>
              <button onClick={() => setShowEditModal(false)} disabled={savingEdit || showSavedToast} className="p-1 hover:bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Waste Type</label>
                <input value={editForm.waste_type} onChange={e => setEditForm(prev => ({ ...prev, waste_type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Volume</label>
                <input type="number" min="0" value={editForm.volume} onChange={e => setEditForm(prev => ({ ...prev, volume: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Unit</label>
                <input value={editForm.unit} onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Bid (RWF)</label>
                <input type="number" min="0" value={editForm.min_bid} onChange={e => setEditForm(prev => ({ ...prev, min_bid: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-gray-500">Listing Images</label>
                  <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">After save: {currentEditImageCount}/{MAX_LISTING_IMAGES}</span>
                </div>
                {removedExistingCount > 0 && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mb-1">Marked for removal: {removedExistingCount}</p>
                )}
                {loadingEditDetails ? (
                  <p className="text-sm text-gray-500">Loading images...</p>
                ) : (
                  <div className="space-y-3">
                    {existingImages.length > 0 ? (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Existing Images (all visible)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {existingImages
                            .map((img) => {
                              const isRemoved = removedImageIds.includes(img.id);
                              const isPrimary = primaryImageTarget?.type === 'existing' && primaryImageTarget.id === img.id;
                              return (
                                <div key={img.id} className={`border rounded-lg p-2 space-y-2 ${isRemoved ? 'opacity-55' : ''}`}>
                                  <img src={resolveMediaUrl(img.url)} alt={`Listing ${selectedListing.id} image`} className="h-24 w-full object-cover rounded" />
                                  {isRemoved && <p className="text-[11px] text-red-600 dark:text-red-300">Marked for removal on save</p>}
                                  <div className="flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setPrimaryImageTarget({ type: 'existing', id: img.id })}
                                      disabled={isRemoved}
                                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isPrimary ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                                    >
                                      <Star size={12} />
                                      {isPrimary ? 'Primary' : 'Set Primary'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isRemoved) {
                                          setRemovedImageIds((prev) => prev.filter((id) => id !== img.id));
                                        } else {
                                          removeExistingImage(img.id);
                                        }
                                      }}
                                      className={`text-xs px-2 py-1 rounded ${isRemoved ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}
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
                      <p className="text-xs text-gray-500">No existing images.</p>
                    )}

                    <div>
                      <p className="text-xs text-gray-500 mb-2">Add Images</p>
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

                          setNewImageFiles((prev) => {
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
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>

                    {newImageFiles.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">New Images (to upload on save)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {newImageFiles.map((file, index) => {
                            const isPrimary = primaryImageTarget?.type === 'new' && primaryImageTarget.index === index;
                            return (
                              <div key={`${file.name}-${index}`} className="border rounded-lg p-2 space-y-2">
                                <img src={newImagePreviews[index]} alt={file.name} className="h-24 w-full object-cover rounded" />
                                <p className="text-[11px] text-gray-600 truncate" title={file.name}>{file.name}</p>
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryImageTarget({ type: 'new', index })}
                                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isPrimary ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                                  >
                                    <Star size={12} />
                                    {isPrimary ? 'Primary' : 'Set Primary'}
                                  </button>
                                  <button type="button" onClick={() => removeNewImage(index)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">Remove</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <ImageIcon size={12} /> Choose one primary image; all other images stay as gallery views.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700" disabled={savingEdit || showSavedToast}>Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700" disabled={savingEdit || showSavedToast}>{savingEdit ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      <BusinessListingFormDrawer
        open={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        onCreated={() => {
          setFlashType('success');
          setFlash('Listing created and saved to database successfully.');
          setTimeout(() => setFlash(null), 2000);
          emitListingsChanged();
          loadListings();
        }}
      />

      {/* ── QR Quick-View Modal (from table row QR button) ── */}
      {showQrModal && qrModalToken && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => { setShowQrModal(false); setQrModalToken(null); setQrModalDataUrl(null); }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                  <QrCode size={16} className="text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Collection QR Code</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Listing #{qrModalListingId}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowQrModal(false); setQrModalToken(null); setQrModalDataUrl(null); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Image */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 border border-cyan-100 dark:border-cyan-800">
              {qrModalDataUrl ? (
                <img
                  src={qrModalDataUrl}
                  alt="Collection QR Code"
                  className="rounded-lg"
                  style={{ width: 220, height: 220 }}
                />
              ) : (
                <div className="w-[220px] h-[220px] flex items-center justify-center">
                  <p className="text-xs text-cyan-500 animate-pulse">Generating…</p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Show this QR to the driver on arrival — scanning auto-confirms pickup
            </p>

            {/* Token display */}
            <div className="w-full flex items-center gap-2 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <QrCode size={12} className="text-gray-400 shrink-0" />
              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">{qrModalToken}</span>
            </div>

            {/* Actions */}
            <div className="w-full flex gap-2">
              {qrModalDataUrl && (
                <a
                  href={qrModalDataUrl}
                  download={`listing-${qrModalListingId}-qr.png`}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
                >
                  <Download size={14} /> Download
                </a>
              )}
              <button
                onClick={() => { setShowQrModal(false); setQrModalToken(null); setQrModalDataUrl(null); }}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
