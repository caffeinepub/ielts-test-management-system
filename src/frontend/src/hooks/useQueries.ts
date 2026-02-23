import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Test, StudentResponse, AuthCredentials } from '../backend';

export function useGetAllTests() {
  const { actor, isFetching } = useActor();

  return useQuery<Test[]>({
    queryKey: ['tests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ credentials, test }: { credentials: AuthCredentials; test: Test }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.createTest(credentials, test);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
    onError: (error) => {
      console.error('Create test error:', error);
      throw error;
    },
  });
}

export function useUpdateTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ credentials, id, test }: { credentials: AuthCredentials; id: bigint; test: Test }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.updateTest(credentials, id, test);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
    onError: (error) => {
      console.error('Update test error:', error);
      throw error;
    },
  });
}

export function useDeleteTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ credentials, id }: { credentials: AuthCredentials; id: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.deleteTest(credentials, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
    onError: (error) => {
      console.error('Delete test error:', error);
      throw error;
    },
  });
}

export function useGetAllStudentResponses() {
  const { actor, isFetching } = useActor();

  return useQuery<StudentResponse[]>({
    queryKey: ['responses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudentResponses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStudentResponse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (response: StudentResponse) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.createStudentResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
    onError: (error) => {
      console.error('Create response error:', error);
      throw error;
    },
  });
}

export function useDeleteStudentResponse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.deleteStudentResponse(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
    onError: (error) => {
      console.error('Delete response error:', error);
      throw error;
    },
  });
}
