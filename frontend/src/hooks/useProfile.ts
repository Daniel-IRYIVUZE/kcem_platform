// hooks/useProfile.ts — React hooks for user profile management
import { useState, useEffect, useCallback } from 'react';
import { usersAPI, type APIUser } from '../services/api';

export function useCurrentUser() {
  const [user, setUser] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersAPI.me();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: {
    full_name?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      // Get current user to get their ID
      const currentUser = await usersAPI.me();
      const result = await usersAPI.update(currentUser.id, data);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
}

export function useUploadAvatar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await usersAPI.uploadAvatar(file);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { uploadAvatar, loading, error };
}

export function useHotelProfile() {
  const [hotel, setHotel] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Get current user (hotel profile is embedded in user object)
      const user = await usersAPI.me();
      if (user.role === 'business' && user.hotel_profile) {
        setHotel(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hotel profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotel();
  }, [fetchHotel]);

  return { hotel, loading, error, refetch: fetchHotel };
}

export function useRecyclerProfile() {
  const [recycler, setRecycler] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecycler = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Get current user (recycler profile is embedded in user object)
      const user = await usersAPI.me();
      if (user.role === 'recycler' && user.recycler_profile) {
        setRecycler(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recycler profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecycler();
  }, [fetchRecycler]);

  return { recycler, loading, error, refetch: fetchRecycler };
}
