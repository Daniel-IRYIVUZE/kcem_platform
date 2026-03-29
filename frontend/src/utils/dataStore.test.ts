/**
 * tests/utils/dataStore.test.ts
 * Unit tests for the in-browser local data store — generic CRUD, CSV generation,
 * and ID generation utilities used across all dashboard views.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  generateId,
  generateCSV,
  saveAll,
} from './dataStore';

// Spy on window.dispatchEvent — the store fires ecotrade_data_change events.
vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);

const COLLECTION = 'testItems';

interface Item {
  id: string;
  name: string;
  value: number;
}

describe('dataStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── getAll ──────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('returns [] for an empty / missing collection', () => {
      expect(getAll(COLLECTION)).toEqual([]);
    });

    it('returns all items after creation', () => {
      create<Item>(COLLECTION, { id: '1', name: 'A', value: 10 });
      create<Item>(COLLECTION, { id: '2', name: 'B', value: 20 });
      expect(getAll(COLLECTION)).toHaveLength(2);
    });
  });

  // ── getById ─────────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('returns undefined for missing id', () => {
      expect(getById(COLLECTION, 'nope')).toBeUndefined();
    });

    it('returns the correct item by id', () => {
      create<Item>(COLLECTION, { id: 'abc', name: 'Item', value: 42 });
      const found = getById<Item>(COLLECTION, 'abc');
      expect(found?.name).toBe('Item');
      expect(found?.value).toBe(42);
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('persists item and returns it', () => {
      const item = create<Item>(COLLECTION, { id: 'x1', name: 'X', value: 1 });
      expect(item.id).toBe('x1');
      expect(getAll(COLLECTION)).toHaveLength(1);
    });

    it('accumulates multiple items', () => {
      create<Item>(COLLECTION, { id: '1', name: 'A', value: 1 });
      create<Item>(COLLECTION, { id: '2', name: 'B', value: 2 });
      create<Item>(COLLECTION, { id: '3', name: 'C', value: 3 });
      expect(getAll(COLLECTION)).toHaveLength(3);
    });

    it('stores items across different collections independently', () => {
      create<Item>('collectionA', { id: 'a', name: 'A', value: 1 });
      create<Item>('collectionB', { id: 'b', name: 'B', value: 2 });
      expect(getAll('collectionA')).toHaveLength(1);
      expect(getAll('collectionB')).toHaveLength(1);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates existing item fields', () => {
      create<Item>(COLLECTION, { id: 'u1', name: 'Old', value: 5 });
      const updated = update<Item>(COLLECTION, 'u1', { name: 'New' });
      expect(updated?.name).toBe('New');
      expect(updated?.value).toBe(5); // untouched
    });

    it('persists the update to storage', () => {
      create<Item>(COLLECTION, { id: 'u2', name: 'Orig', value: 99 });
      update<Item>(COLLECTION, 'u2', { value: 200 });
      expect(getById<Item>(COLLECTION, 'u2')?.value).toBe(200);
    });

    it('returns undefined for a non-existent id', () => {
      expect(update<Item>(COLLECTION, 'missing', { name: 'X' })).toBeUndefined();
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes an existing item and returns true', () => {
      create<Item>(COLLECTION, { id: 'r1', name: 'Remove me', value: 0 });
      expect(remove(COLLECTION, 'r1')).toBe(true);
      expect(getAll(COLLECTION)).toHaveLength(0);
    });

    it('returns false when item does not exist', () => {
      expect(remove(COLLECTION, 'ghost')).toBe(false);
    });

    it('leaves other items intact', () => {
      create<Item>(COLLECTION, { id: 'keep', name: 'Keep', value: 1 });
      create<Item>(COLLECTION, { id: 'del',  name: 'Del',  value: 2 });
      remove(COLLECTION, 'del');
      expect(getAll(COLLECTION)).toHaveLength(1);
      expect(getById<Item>(COLLECTION, 'keep')).toBeDefined();
    });
  });

  // ── saveAll ──────────────────────────────────────────────────────────────────

  describe('saveAll', () => {
    it('replaces entire collection with provided array', () => {
      create<Item>(COLLECTION, { id: '1', name: 'A', value: 1 });
      saveAll(COLLECTION, [{ id: 'new', name: 'New', value: 9 }]);
      const all = getAll<Item>(COLLECTION);
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('new');
    });

    it('can clear a collection by saving an empty array', () => {
      create<Item>(COLLECTION, { id: '1', name: 'A', value: 1 });
      saveAll(COLLECTION, []);
      expect(getAll(COLLECTION)).toHaveLength(0);
    });
  });

  // ── generateId ───────────────────────────────────────────────────────────────

  describe('generateId', () => {
    it('returns a non-empty string', () => {
      expect(generateId()).toBeTruthy();
    });

    it('uses "ET" prefix by default', () => {
      expect(generateId()).toMatch(/^ET-/);
    });

    it('uses provided prefix', () => {
      expect(generateId('BID')).toMatch(/^BID-/);
    });

    it('generates unique IDs across calls', () => {
      const ids = new Set(Array.from({ length: 20 }, () => generateId()));
      expect(ids.size).toBe(20);
    });
  });

  // ── generateCSV ──────────────────────────────────────────────────────────────

  describe('generateCSV', () => {
    it('includes header row as first line', () => {
      const csv = generateCSV(['Name', 'Value'], []);
      expect(csv.split('\n')[0]).toBe('Name,Value');
    });

    it('generates correct rows for data', () => {
      const csv = generateCSV(['Name', 'Value'], [['Alice', '100'], ['Bob', '200']]);
      const lines = csv.split('\n');
      expect(lines[1]).toBe('"Alice","100"');
      expect(lines[2]).toBe('"Bob","200"');
    });

    it('escapes double-quotes inside cell values', () => {
      const csv = generateCSV(['Note'], [['He said "hello"']]);
      expect(csv).toContain('He said ""hello""');
    });

    it('handles empty data rows', () => {
      const csv = generateCSV(['Col1', 'Col2'], []);
      expect(csv).toBe('Col1,Col2');
    });

    it('returns only the header when rows array is empty', () => {
      const csv = generateCSV(['A', 'B', 'C'], []);
      expect(csv.split('\n')).toHaveLength(1);
    });
  });
});
