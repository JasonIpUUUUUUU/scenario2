import { Check, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '../api/client';

export function PendingInvites() {
  // In a real app, you'd fetch invites from an endpoint
  // For now, we'll show a placeholder with no invites
  const { data, isLoading } = useQuery({
    queryKey: ['pending-invites'],
    queryFn: async () => {
      // This would be replaced with actual API call
      // For now, return empty array
      return { invites: [] };
    },
    enabled: false, // Disable until API is ready
  });

  return (
    <div className="bg-elevated/50 rounded-2xl border border-border-subtle p-5 animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[13px] font-semibold text-text-primary">Pending Invites</h2>
        <span className="ml-auto text-[10px] text-text-muted bg-card px-2 py-0.5 rounded-md border border-border-subtle font-medium">0</span>
      </div>
      <div className="text-center py-8 text-text-muted text-sm">
        No pending invites
      </div>
    </div>
  );
}