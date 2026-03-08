// hooks/useTransactions.ts — React hooks for transaction management
import { useState, useEffect, useCallback } from 'react';
import { transactionsAPI, type Transaction } from '../services/api';

export function useMyTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionsAPI.list();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTransactions();
  }, [fetchMyTransactions]);

  return { transactions, loading, error, refetch: fetchMyTransactions };
}

export function useTransaction(id?: number) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await transactionsAPI.get(id);
      setTransaction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return { transaction, loading, error, refetch: fetchTransaction };
}

export function useAddPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPayment = async (
    transactionId: number,
    data: { method: string; amount: number; reference: string }
  ) => {
    try {
      setLoading(true);
      setError(null);
      // Update transaction with receipt information
      const result = await transactionsAPI.update(transactionId, {
        receipt: `${data.method}: ${data.reference} - ${data.amount}`,
      });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add payment';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { addPayment, loading, error };
}
