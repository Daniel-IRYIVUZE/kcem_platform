// components/ui/DataTable.tsx — Enterprise data table with sorting, filtering, bulk actions & export
import { useState, useMemo, type ReactNode } from 'react';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, Download, CheckSquare, Square, MoreHorizontal,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

export interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T, idx: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hide?: 'sm' | 'md' | 'lg'; // hide below breakpoint
}

export interface BulkAction {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  variant?: 'normal' | 'danger';
  onClick: (selectedIds: string[]) => void;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  rowKey?: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  bulkActions?: BulkAction[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  onExport?: () => void;
  emptyText?: string;
  loading?: boolean;
  /** Extra controls to render beside the search bar */
  toolbar?: ReactNode;
}

type SortDir = 'asc' | 'desc' | null;

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  bulkActions = [],
  pageSize = 10,
  onRowClick,
  onExport,
  emptyText = 'No records found',
  loading = false,
  toolbar,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // ── Filter ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      Object.values(row as object).some(v =>
        String(v ?? '').toLowerCase().includes(q)
      )
    );
  }, [data, search]);

  // ── Sort ────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Pagination ──────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  // ── Selection ───────────────────────────────────────────
  const allPageSelected = pageData.length > 0 && pageData.every(r => selected.has(r.id));
  const toggleAll = () => {
    if (allPageSelected) {
      setSelected(s => { const n = new Set(s); pageData.forEach(r => n.delete(r.id)); return n; });
    } else {
      setSelected(s => { const n = new Set(s); pageData.forEach(r => n.add(r.id)); return n; });
    }
  };
  const toggleRow = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <ChevronsUpDown size={12} className="text-gray-300 dark:text-gray-600" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-cyan-600" />
      : <ChevronDown size={12} className="text-cyan-600" />;
  };

  const alignCls = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-8 py-2 text-xs"
              />
            </div>
          )}
          {toolbar}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk action bar */}
          {selected.size > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                {selected.size} selected
              </span>
              {bulkActions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => a.onClick(Array.from(selected))}
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors
                    ${a.danger
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {onExport && (
            <button onClick={onExport} className="btn-icon" title="Export">
              <Download size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              {bulkActions.length > 0 && (
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-cyan-600 transition-colors">
                    {allPageSelected
                      ? <CheckSquare size={15} className="text-cyan-600" />
                      : <Square size={15} />}
                  </button>
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`px-4 py-3 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide
                    ${col.sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-white select-none' : ''}
                    ${alignCls[col.align ?? 'left']}
                    ${col.hide === 'sm' ? 'hidden sm:table-cell' : ''}
                    ${col.hide === 'md' ? 'hidden md:table-cell' : ''}
                    ${col.hide === 'lg' ? 'hidden lg:table-cell' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                    {col.label}
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {bulkActions.length > 0 && <td className="px-4 py-3"><div className="skeleton w-4 h-4" /></td>}
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
                    </td>
                  ))}
                  <td className="px-2 py-3" />
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (bulkActions.length ? 2 : 1)} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`group transition-colors duration-100
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${selected.has(row.id) ? 'bg-cyan-50/60 dark:bg-cyan-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {bulkActions.length > 0 && (
                    <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleRow(row.id); }}>
                      <button className="text-gray-400 hover:text-cyan-600 transition-colors">
                        {selected.has(row.id)
                          ? <CheckSquare size={15} className="text-cyan-600" />
                          : <Square size={15} />}
                      </button>
                    </td>
                  )}
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-gray-700 dark:text-gray-300
                        ${alignCls[col.align ?? 'left']}
                        ${col.hide === 'sm' ? 'hidden sm:table-cell' : ''}
                        ${col.hide === 'md' ? 'hidden md:table-cell' : ''}
                        ${col.hide === 'lg' ? 'hidden lg:table-cell' : ''}`}
                    >
                      {col.render
                        ? col.render(row, idx)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                  <td className="px-2 py-3">
                    <button className="opacity-0 group-hover:opacity-100 btn-icon w-7 h-7 transition-opacity">
                      <MoreHorizontal size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────── */}
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className={`btn-icon w-7 h-7 ${page === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft size={13} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5) {
                if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                    ${p === page
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className={`btn-icon w-7 h-7 ${page === totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
