import { Toast, Toaster as ChakraToaster, createToaster } from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'top',
  overlap: true,
  gap: 16,
  duration: 4000,
});

export const Toaster = () => {
  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => (
        <Toast.Root>
          {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
          {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
          {toast.meta?.closable && <Toast.CloseTrigger />}
        </Toast.Root>
      )}
    </ChakraToaster>
  );
};