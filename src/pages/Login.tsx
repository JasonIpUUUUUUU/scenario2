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
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await authApi.login(formData);
      const userData = await authApi.getMe();
      setAuth(userData.user, response.token);
      
      toaster.success({
        title: 'Login successful!',
        description: 'Welcome back!',
      });
      navigate('/calendar');
    } catch (error: any) {
      toaster.error({
        title: 'Login failed',
        description: error.response?.data?.error?.message || 'Invalid email or password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <Text textStyle="4xl" fontWeight="bold">Welcome Back</Text>
          <Text color="gray.500">Sign in to your account</Text>
        </VStack>

        <Card.Root width="full">
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
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

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  loading={isLoading}
                  mt={4}
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Text mt={4} textAlign="center">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#1a73e8' }}>
                Sign up
              </Link>
            </Text>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
};