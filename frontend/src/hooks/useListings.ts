// hooks/useListings.ts — React hooks for waste listings
import { useState, useEffect, useCallback } from 'react';
import { listingsAPI, type WasteListing } from '../services/api';

export function useListings(filters?: {
  wasteType?: string;
  search?: string;
  minVolume?: number;
  status?: string;
}) {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listingsAPI.list({
        waste_type: filters?.wasteType,
        status: filters?.status,
      });
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [filters?.wasteType, filters?.search, filters?.minVolume, filters?.status]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}

export function useMyListings() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listingsAPI.list();
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  return { listings, loading, error, refetch: fetchMyListings };
}

export function useListing(id?: string) {
  const [listing, setListing] = useState<WasteListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await listingsAPI.get(Number(id));
      setListing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  return { listing, loading, error, refetch: fetchListing };
}

export function useCreateListing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListing = async (data: Partial<WasteListing>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await listingsAPI.create(data);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create listing';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { createListing, loading, error };
}

export function useUpdateListing(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateListing = async (data: Partial<WasteListing>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await listingsAPI.update(id, data);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update listing';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { updateListing, loading, error };
}

export function useDeleteListing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteListing = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await listingsAPI.delete(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete listing';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { deleteListing, loading, error };
}
