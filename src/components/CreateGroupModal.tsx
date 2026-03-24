import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/client';
import { toaster } from './ui/toaster';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const createGroup = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toaster.success({ title: 'Circle created' });
      setName('');
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[420px] rounded-2xl bg-surface border border-white/[0.08] p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Create New Circle
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Uni Friends"
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] text-text-primary outline-none"
        />

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="text-text-muted">
            Cancel
          </button>
          <button
            onClick={() => createGroup.mutate({ name })}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg bg-accent text-white"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}