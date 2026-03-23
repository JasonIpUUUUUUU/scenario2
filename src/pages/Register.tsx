import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Field,
  Input,
  Text,
  VStack,
  Heading,
  Select,
  createListCollection,
  Center,
} from '@chakra-ui/react';
import { toaster } from '../components/ui/toaster';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

// Create a collection for the select dropdown
const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Singapore', 'Australia/Sydney', 'Pacific/Auckland',
];

const timezoneCollection = createListCollection({
  items: TIMEZONES.map(tz => ({ label: tz.replace('_', ' '), value: tz })),
});

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
      toaster.create({
        title: 'Registration successful!',
        description: 'Welcome to the app!',
        type: 'success',
      });
      navigate('/calendar');
    } catch (error: any) {
      toaster.create({
        title: 'Registration failed',
        description: error.response?.data?.error?.message || 'Registration failed',
        type: 'error',
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
    <Center minH="100vh" bg="#0f0e0d">
      <Container maxW="lg" py={12}>
        <VStack gap={8}>
          <VStack gap={2} textAlign="center">
            <Heading 
              size="2xl" 
              color="#f0ebe3"
              fontFamily="'Cormorant Garamond', serif"
              fontWeight="semibold"
              letterSpacing="-0.02em"
            >
              Create Account
            </Heading>
            <Text color="#968f84">Sign up to start scheduling</Text>
          </VStack>
          
          <Box 
            w="full" 
            bg="#1a1917" 
            p={8} 
            borderRadius="24px" 
            border="1px solid rgba(255,245,230,0.06)"
            boxShadow="0 4px 24px -8px rgba(0,0,0,0.3)"
          >
            <form onSubmit={handleSubmit}>
              <VStack gap={5}>
                <Field.Root invalid={!!errors.name}>
                  <Field.Label color="#968f84" fontSize="sm">Name</Field.Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    bg="#252320"
                    border="1px solid rgba(255,245,230,0.08)"
                    _hover={{ borderColor: 'rgba(255,245,230,0.16)' }}
                    _focus={{ borderColor: '#d4775c', boxShadow: '0 0 0 1px #d4775c' }}
                    color="#f0ebe3"
                    _placeholder={{ color: '#5c574f' }}
                    height="48px"
                    borderRadius="12px"
                  />
                  <Field.ErrorText color="#d4775c">{errors.name}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.email}>
                  <Field.Label color="#968f84" fontSize="sm">Email</Field.Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    bg="#252320"
                    border="1px solid rgba(255,245,230,0.08)"
                    _hover={{ borderColor: 'rgba(255,245,230,0.16)' }}
                    _focus={{ borderColor: '#d4775c', boxShadow: '0 0 0 1px #d4775c' }}
                    color="#f0ebe3"
                    _placeholder={{ color: '#5c574f' }}
                    height="48px"
                    borderRadius="12px"
                  />
                  <Field.ErrorText color="#d4775c">{errors.email}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label color="#968f84" fontSize="sm">Password</Field.Label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    bg="#252320"
                    border="1px solid rgba(255,245,230,0.08)"
                    _hover={{ borderColor: 'rgba(255,245,230,0.16)' }}
                    _focus={{ borderColor: '#d4775c', boxShadow: '0 0 0 1px #d4775c' }}
                    color="#f0ebe3"
                    _placeholder={{ color: '#5c574f' }}
                    height="48px"
                    borderRadius="12px"
                  />
                  <Field.ErrorText color="#d4775c">{errors.password}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label color="#968f84" fontSize="sm">Time Zone</Field.Label>
                  <Select.Root
                    collection={timezoneCollection}
                    value={[formData.time_zone]}
                    onValueChange={(details) => {
                      setFormData({ ...formData, time_zone: details.value[0] });
                    }}
                  >
                    <Select.Trigger
                      bg="#252320"
                      border="1px solid rgba(255,245,230,0.08)"
                      _hover={{ borderColor: 'rgba(255,245,230,0.16)' }}
                      _focus={{ borderColor: '#d4775c', boxShadow: '0 0 0 1px #d4775c' }}
                      height="48px"
                      borderRadius="12px"
                      px={4}
                    >
                      <Select.ValueText placeholder="Select timezone" color="#f0ebe3" />
                    </Select.Trigger>
                    <Select.Content
                      bg="#252320"
                      border="1px solid rgba(255,245,230,0.08)"
                      borderRadius="12px"
                      maxH="300px"
                      overflowY="auto"
                    >
                      {timezoneCollection.items.map((item) => (
                        <Select.Item 
                          key={item.value} 
                          item={item}
                          _hover={{ bg: 'rgba(212,119,92,0.2)' }}
                          _selected={{ bg: 'rgba(212,119,92,0.3)', color: '#d4775c' }}
                          color="#f0ebe3"
                          px={4}
                          py={2}
                        >
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Field.Root>

                <Button
                  type="submit"
                  width="full"
                  height="48px"
                  borderRadius="12px"
                  fontWeight="500"
                  fontSize="15px"
                  bg="#d4775c"
                  _hover={{ bg: '#e08a6f' }}
                  _active={{ transform: 'scale(0.98)' }}
                  transition="all 0.2s"
                  loading={isLoading}
                  mt={2}
                  color="white"
                >
                  Sign Up
                </Button>
              </VStack>
            </form>

            <Text mt={6} textAlign="center" color="#5c574f" fontSize="sm">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#d4775c', fontWeight: '500' }}>
                Sign in
              </Link>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Center>
  );
};