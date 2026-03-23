import { createStandaloneToast } from '@chakra-ui/react';

const { toast, ToastContainer } = createStandaloneToast();

export const toaster = {
  success: (options: { title: string; description?: string }) => {
    toast({
      title: options.title,
      description: options.description,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  },
  error: (options: { title: string; description?: string }) => {
    toast({
      title: options.title,
      description: options.description,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  },
  info: (options: { title: string; description?: string }) => {
    toast({
      title: options.title,
      description: options.description,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  },
};

export const Toaster = () => {
  return <ToastContainer />;
};