import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swapAPI } from '../utils/api';

export const useSwappableSlots = () => {
  return useQuery({
    queryKey: ['swappable-slots'],
    queryFn: async () => {
      const response = await swapAPI.getSwappableSlots();
      return response.data.slots;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useSwapRequests = () => {
  return useQuery({
    queryKey: ['swap-requests'],
    queryFn: async () => {
      const response = await swapAPI.getMyRequests();
      return response.data;
    },
    refetchInterval: 1000 * 30, // Auto-refresh every 30 seconds
  });
};

export const useCreateSwapRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { mySlotId: string; theirSlotId: string }) =>
      swapAPI.createSwapRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swappable-slots'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
    },
  });
};

export const useRespondToSwapRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, accepted }: { requestId: string; accepted: boolean }) =>
      swapAPI.respondToSwapRequest(requestId, { accepted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['swappable-slots'] });
    },
  });
};