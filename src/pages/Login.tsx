import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const toast = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await authApi.login(formData);
      const userData = await authApi.getMe();
      setAuth(userData.user, response.token);
      toast({ title: 'Login successful!', status: 'success', duration: 3000 });
      navigate('/calendar');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.error?.message || 'Invalid email or password',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <Container maxW="lg" py={12}>
      <VStack spacing={8}>
        <VStack spacing={2} textAlign="center">
          <Heading size="2xl">Welcome Back</Heading>
          <Text color="gray.500">Sign in to your account</Text>
        </VStack>
        <Box w="full" bg="white" p={8} borderRadius="lg" shadow="sm">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input name="password" type="password" value={formData.password} onChange={handleChange} />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              <Button type="submit" colorScheme="brand" size="lg" w="full" isLoading={isLoading} mt={4}>
                Sign In
              </Button>
            </VStack>
          </form>
          <Text mt={4} textAlign="center">
            Don't have an account? <Link to="/register" style={{ color: '#1a73e8' }}>Sign up</Link>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};