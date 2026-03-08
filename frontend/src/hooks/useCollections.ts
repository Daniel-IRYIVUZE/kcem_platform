// hooks/useCollections.ts — React hooks for collection management
import { useState, useEffect, useCallback } from 'react';
import { collectionsAPI, type Collection } from '../services/api';

export function useMyCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await collectionsAPI.list();
      setCollections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCollections();
  }, [fetchMyCollections]);

  return { collections, loading, error, refetch: fetchMyCollections };
}

export function useCollection(id?: number) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await collectionsAPI.get(id);
      setCollection(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return { collection, loading, error, refetch: fetchCollection };
}

export function useAdvanceCollectionStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const advanceStatus = async (id: number, status: string, data?: { notes?: string; actual_weight?: number; rating?: number }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await collectionsAPI.updateStatus(id, {
        status,
        ...data,
      });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to advance collection status';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { advanceStatus, loading, error };
}

export function useUploadCollectionProof() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadProof = async (id: number, file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await collectionsAPI.uploadProof(id, file);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload proof';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { uploadProof, loading, error };
}
