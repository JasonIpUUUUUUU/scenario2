import { createStandaloneToast } from '@chakra-ui/react';

export const { toast, ToastContainer } = createStandaloneToast();

export const Toaster = () => {
  return <ToastContainer />;
};