import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, groupsApi } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export function InviteMemberModal({ isOpen, onClose, groupId }: Props) {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();

  // 🔍 Search users
  const { data, isLoading } = useQuery({
    queryKey: ['user-search', query],
    queryFn: () => usersApi.search(query),
    enabled: query.length > 1,
  });

  // ➕ Add member
  const addMutation = useMutation({
    mutationFn: (userId: string) =>
      groupsApi.addMember(groupId, {
        user_id: userId,
        role: 'member',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey : ['group-members', groupId],
      });
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#1c1b19] w-[420px] rounded-2xl p-6 border border-white/10">
        
        <h2 className="text-lg font-semibold mb-4">Invite Member</h2>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full mb-4 px-3 py-2 rounded-lg bg-[#2a2825] border border-white/10 text-sm outline-none"
        />

        <div className="max-h-[300px] overflow-auto">
          {isLoading && <p className="text-sm text-gray-400">Searching...</p>}

          {data?.users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between py-2 border-b border-white/5"
            >
              <div>
                <p className="text-sm">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>

              <button
                onClick={() => addMutation.mutate(user.id)}
                className="text-xs px-3 py-1 rounded bg-accent text-white"
              >
                Add
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}