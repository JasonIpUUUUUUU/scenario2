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
  Center,
} from '@chakra-ui/react';
import { toaster } from '../components/ui/toaster';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
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
      localStorage.setItem('token', response.token);
      const userData = await authApi.getMe();
      try {
        setAuth(userData.user, response.token);
      } catch {
        toaster.error({ title: 'Failed to fetch user' });
      }
      
      toaster.create({
        title: 'Login successful!',
        description: `Welcome back, ${userData.user.name}!`,
        type: 'success',
      });
      
      navigate('/calendar', { replace: true });
    } catch (error: any) {
      toaster.create({
        title: 'Login failed',
        description: error.response?.data?.error?.message || 'Invalid email or password',
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
              Welcome Back
            </Heading>
            <Text color="#968f84">Sign in to your account</Text>
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
                  Sign In
                </Button>
              </VStack>
            </form>

            <Text mt={6} textAlign="center" color="#5c574f" fontSize="sm">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#d4775c', fontWeight: '500' }}>
                Sign up
              </Link>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Center>
  );
};