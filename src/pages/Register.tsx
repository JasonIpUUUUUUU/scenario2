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
  Card,
  Select,
} from '@chakra-ui/react';
import { toaster } from '../components/ui/toaster';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
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
  const setAuth = useAuthStore((state) => state.setAuth);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authApi.register(formData);
      setAuth(response.user, response.token);
      toaster.success({
        title: 'Registration successful!',
        description: 'Welcome to the app!',
      });
      navigate('/calendar');
    } catch (error: any) {
      toaster.error({
        title: 'Registration failed',
        description: error.response?.data?.error?.message || 'Registration failed',
      });
    } finally {
      setIsLoading(false);
    }
  };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
        setErrors({
        ...errors,
        [e.target.name]: '',
        });
    }
    };

  return (
    <Container maxW="lg" py={12}>
      <VStack gap={8}>
        <VStack gap={2} textAlign="center">
          <Text textStyle="4xl" fontWeight="bold">Create Account</Text>
          <Text color="gray.500">Sign up to start scheduling</Text>
        </VStack>

        <Card.Root width="full">
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                <Field.Root invalid={!!errors.name}>
                  <Field.Label>Name</Field.Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                  <Field.ErrorText>{errors.name}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.email}>
                  <Field.Label>Email</Field.Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                  <Field.ErrorText>{errors.email}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label>Password</Field.Label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                  />
                  <Field.ErrorText>{errors.password}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Time Zone</Field.Label>
                  <select
                    name="time_zone"
                    value={formData.time_zone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0',
                      background: 'white'
                    }}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </Field.Root>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  loading={isLoading}
                  mt={4}
                >
                  Sign Up
                </Button>
              </VStack>
            </form>

            <Text mt={4} textAlign="center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1a73e8' }}>
                Sign in
              </Link>
            </Text>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
};