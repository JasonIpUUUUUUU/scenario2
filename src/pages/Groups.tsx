import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Input, VStack, Text, Dialog, Portal, HStack } from '@chakra-ui/react';
import { groupsApi } from '../api/client';
import { toaster } from '../components/ui/toaster';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserSearchResult } from '../api/client';
import { usersApi } from '../api/client';
import { useEffect } from 'react';

export const Groups = () => {
  const [groupName, setGroupName] = useState('');
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserSearchResult>>({});
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // Fetch groups
  const { data } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.list(),
  });

  // Fetch members
  const { data: membersData } = useQuery({
    queryKey: ['members', selectedGroup],
    queryFn: () => {
        if (!selectedGroup) return { members: [] };
        return groupsApi.getMembers(selectedGroup);
    },
    enabled: !!selectedGroup && isOpen,
    });

    useEffect(() => {
    const fetchUsers = async () => {
        if (!membersData?.members) return;

        const results: Record<string, UserSearchResult> = {};

        for (const m of membersData.members) {
        try {
            const res = await usersApi.search(m.user_id);

            if (res.users.length > 0) {
            results[m.user_id] = res.users[0];
            }
        } catch (err) {
            console.error('Failed to fetch user', err);
        }
        }

        setUserMap((prev) => ({
            ...prev,
            ...results,
            }));
    };

    fetchUsers();
    }, [membersData]);

    useEffect(() => {
    if (!currentUser) return;

    setUserMap((prev) => ({
        ...prev,
        [currentUser.id]: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        time_zone: currentUser.time_zone,
        },
    }));
    }, [currentUser]);

  // Member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
        groupsApi.addMember(groupId, {
        user_id: userId,
        role: 'member',
        }),
    onSuccess: () => {
        toaster.success({ title: 'Member added' });
        setUserId('');
        queryClient.invalidateQueries({ queryKey: ['members', selectedGroup] });
    },
    onError: () => {
        toaster.error({ title: 'Failed to add member' });
    },
    });

  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
        groupsApi.removeMember(groupId, userId),

    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members', selectedGroup] });
    },
    });

  // Search Users
  const handleSearch = async () => {
    try {
        const res = await usersApi.search(searchQuery);
        setSearchResults(res.users);
    } catch {
        toaster.error({ title: 'Search failed' });
    }
    };

  // Create group
  const createGroupMutation = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toaster.success({ title: 'Group created' });
      setGroupName('');
    },
  });

  const handleCreate = () => {
    if (!groupName) return;
    createGroupMutation.mutate({ name: groupName });
  };

    return (
    <>
        <Box p={6}>
        <VStack gap={4} align="stretch">

            <Box display="flex" justifyContent="space-between" mb={4}>

                <Button onClick={() => navigate('/calendar')}>
                    Back to Calendar
                </Button>

                  <Button
                    colorScheme="red"
                    onClick={() => {
                    logout();
                    navigate('/login');
                    }}
                >
                    Logout
                 </Button>

            </Box>

            <Text fontSize="xl">Your Groups</Text>

            {/* Create group */}
            <Input
            placeholder="New group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            />
            <Button onClick={handleCreate}>Create Group</Button>

            {/* Groups list */}
            {data?.groups.map((group) => (
            <Box key={group.id} p={4} borderWidth="1px" borderRadius="md">
                
                <Text fontWeight="bold">{group.name}</Text>

                <Button
                mt={2}
                onClick={() => {
                    setSelectedGroup(group.id);
                    setIsOpen(true);
                }}
                >
                Manage Members
                </Button>

            </Box>
            ))}

        </VStack>
        </Box>

        <Dialog.Root open={isOpen} onOpenChange={(d: any) => setIsOpen(d.open)}>
        <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
            <Dialog.Content>

                <Dialog.Header>
                <Dialog.Title>Manage Members</Dialog.Title>
                <Dialog.CloseTrigger />
                </Dialog.Header>

                <Dialog.Body>
                <VStack align="stretch" gap={4}>

                    {/* Members list */}
                    <Box>
                    <Text fontWeight="bold">Members</Text>
                    <VStack align="start" mt={2}>
                        {membersData?.members.map((m) => {
                        const user = userMap[m.user_id];
                        const myMembership = membersData?.members.find(
                            (m) => m.user_id === currentUser?.id
                            );

                            const isAdminOrOwner =
                            myMembership?.role === 'admin' || myMembership?.role === 'owner';

                        return (
                            <HStack key={m.user_id} justify="space-between" w="full">
                            <Box>
                                <Text fontWeight="bold">
                                {user?.name || user?.email || m.user_id}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                {user?.email}
                                </Text>
                                <Text fontSize="xs" color="blue.500">
                                Role: {m.role}
                                </Text>
                            </Box>

                            <HStack>
                            {/* Remove button → ONLY admin/owner */}
                            {isAdminOrOwner && m.user_id !== currentUser?.id && (
                                <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => {
                                    if (!selectedGroup) return;

                                    removeMemberMutation.mutate({
                                    groupId: selectedGroup,
                                    userId: m.user_id,
                                    });
                                }}
                                >
                                Remove
                                </Button>
                            )}

                            {/* Leave group → ONLY yourself */}
                            {m.user_id === currentUser?.id && (
                                <Button
                                size="sm"
                                colorScheme="orange"
                                onClick={() => {
                                    if (!selectedGroup) return;

                                    removeMemberMutation.mutate({
                                    groupId: selectedGroup,
                                    userId: m.user_id,
                                    });

                                    setIsOpen(false);
                                }}
                                >
                                Leave
                                </Button>
                            )}
                            </HStack>
                            </HStack>
                        );
                        })}
                    </VStack>
                    </Box>

                    {/* Search + Add Member */}
                    <Box>
                    <Text fontWeight="bold">Add Member by Email</Text>

                    <Input
                        placeholder="Search by email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        mt={2}
                    />

                    <Button mt={2} onClick={handleSearch}>
                        Search
                    </Button>

                    {/* Results */}
                    <VStack align="stretch" mt={2}>
                        {searchResults.map((user) => (
                        <Box key={user.id} p={2} borderWidth="1px" borderRadius="md">
                            <Text>{user.email}</Text>
                            <Text fontSize="sm" color="gray.500">{user.name}</Text>

                            <Button
                            mt={2}
                            size="sm"
                            onClick={() => {
                                if (!selectedGroup) return;

                                // store user locally
                                setUserMap((prev) => ({
                                    ...prev,
                                    [user.id]: user,
                                }));

                                addMemberMutation.mutate({
                                    groupId: selectedGroup,
                                    userId: user.id,
                                });
                            }}
                            >
                            Add to Group
                            </Button>
                        </Box>
                        ))}
                    </VStack>
                    </Box>

                </VStack>
                </Dialog.Body>

            </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
        </Dialog.Root>
    </>
    );
};