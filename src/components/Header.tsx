import React from 'react';
import { Box, Flex, Button, Heading, HStack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box bg="white" px={4} py={3} shadow="sm">
      <Flex maxW="1200px" mx="auto" justify="space-between" align="center">
        <Heading size="md" color="brand.500">Scheduling App</Heading>
        
        <HStack gap={4}>
          {user && (
            <>
              <Text fontSize="sm" color="gray.600">
                {user.name}
              </Text>
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};