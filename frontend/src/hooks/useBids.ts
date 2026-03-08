// hooks/useBids.ts — React hooks for bid management
import { useState, useEffect, useCallback } from 'react';
import { bidsAPI, listingsAPI, type Bid } from '../services/api';

export function useMyBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyBids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bidsAPI.mine();
      setBids(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBids();
  }, [fetchMyBids]);

  return { bids, loading, error, refetch: fetchMyBids };
}

export function useListingBids(listingId?: number) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    if (!listingId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await listingsAPI.getBids(listingId);
      setBids(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  return { bids, loading, error, refetch: fetchBids };
}

export function usePlaceBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeBid = async (data: { listing_id: number; amount: number; note?: string; collection_preference?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await listingsAPI.placeBid(data.listing_id, {
        amount: data.amount,
        note: data.note,
        collection_preference: data.collection_preference,
      });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place bid';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { placeBid, loading, error };
}

export function useAcceptBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptBid = async (listingId: number, bidId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await listingsAPI.acceptBid(listingId, bidId);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to accept bid';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { acceptBid, loading, error };
}

export function useWithdrawBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withdrawBid = async (bidId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bidsAPI.withdraw(bidId);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to withdraw bid';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { withdrawBid, loading, error };
}

export function useIncreaseBid() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const increaseBid = async (bidId: number, newAmount: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bidsAPI.increase(bidId, newAmount);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to increase bid';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { increaseBid, loading, error };
}
