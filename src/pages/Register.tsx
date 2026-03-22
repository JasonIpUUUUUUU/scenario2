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
  Select,
} from '@chakra-ui/react';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Singapore', 'Australia/Sydney', 'Pacific/Auckland',
];

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const toast = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.name) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await authApi.register(formData);
      setAuth(response.user, response.token);
      toast({ title: 'Registration successful!', status: 'success', duration: 5000 });
      navigate('/calendar');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.error?.message || 'Registration failed',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <Container maxW="lg" py={12}>
      <VStack spacing={8}>
        <VStack spacing={2} textAlign="center">
          <Heading size="2xl">Create Account</Heading>
          <Text color="gray.500">Sign up to start scheduling</Text>
        </VStack>
        <Box w="full" bg="white" p={8} borderRadius="lg" shadow="sm">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={formData.name} onChange={handleChange} />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
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
              <FormControl>
                <FormLabel>Time Zone</FormLabel>
                <Select name="time_zone" value={formData.time_zone} onChange={handleChange}>
                  {TIMEZONES.map((tz) => (<option key={tz} value={tz}>{tz.replace('_', ' ')}</option>))}
                </Select>
              </FormControl>
              <Button type="submit" colorScheme="brand" size="lg" w="full" isLoading={isLoading} mt={4}>
                Sign Up
              </Button>
            </VStack>
          </form>
          <Text mt={4} textAlign="center">
            Already have an account? <Link to="/login" style={{ color: '#1a73e8' }}>Sign in</Link>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};