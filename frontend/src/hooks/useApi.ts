// hooks/useApi.ts — Generic typed hook for API calls with loading/error state
import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: false, error: null });

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error = (err as Error).message || 'An error occurred';
      setState(s => ({ ...s, loading: false, error }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export function useApiList<T>() {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (apiCall: () => Promise<T[]>): Promise<T[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall();
      setItems(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
      setLoading(false);
      return [];
    }
  }, []);

  return { items, setItems, loading, error, fetch };
}
