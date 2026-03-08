// components/ui/StatusBadge.tsx — Reusable status pill badge
type Status =
  | 'open' | 'active' | 'completed' | 'pending' | 'suspended'
  | 'en-route' | 'scheduled' | 'cancelled' | 'verified' | 'rejected'
  | 'paid' | 'unpaid' | 'processing' | 'failed' | string;

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  open:        { label: 'Open',        cls: 'badge-open' },
  active:      { label: 'Active',      cls: 'badge-active' },
  completed:   { label: 'Completed',   cls: 'badge-completed' },
  pending:     { label: 'Pending',     cls: 'badge-pending' },
  suspended:   { label: 'Suspended',   cls: 'badge-suspended' },
  'en-route':  { label: 'En Route',    cls: 'badge-en-route' },
  scheduled:   { label: 'Scheduled',   cls: 'badge-open' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-suspended' },
  verified:    { label: 'Verified',    cls: 'badge-active' },
  rejected:    { label: 'Rejected',    cls: 'badge-suspended' },
  paid:        { label: 'Paid',        cls: 'badge-active' },
  unpaid:      { label: 'Unpaid',      cls: 'badge-pending' },
  processing:  { label: 'Processing',  cls: 'badge-en-route' },
  failed:      { label: 'Failed',      cls: 'badge-suspended' },
};

const DOT_CLS: Record<string, string> = {
  open: 'bg-cyan-500', active: 'bg-cyan-500', completed: 'bg-blue-500',
  pending: 'bg-amber-500', suspended: 'bg-red-500', 'en-route': 'bg-purple-500',
};

export default function StatusBadge({ status, size = 'sm', dot = true }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status.toLowerCase()] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  const dotCls = DOT_CLS[status.toLowerCase()] ?? 'bg-gray-400';

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full
      ${cfg.cls}
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />}
      {cfg.label}
    </span>
  );
}
