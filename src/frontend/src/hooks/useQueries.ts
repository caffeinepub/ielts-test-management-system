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
      await actor.createTest(credentials, test);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
}

export function useUpdateTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ credentials, id, test }: { credentials: AuthCredentials; id: bigint; test: Test }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateTest(credentials, id, test);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
}

export function useDeleteTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ credentials, id }: { credentials: AuthCredentials; id: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteTest(credentials, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
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
      await actor.createStudentResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
  });
}

export function useDeleteStudentResponse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteStudentResponse(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
  });
}
