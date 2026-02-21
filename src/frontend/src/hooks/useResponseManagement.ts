import { useMemo } from 'react';
import type { StudentResponse } from '../backend';

export function useResponseManagement(responses: StudentResponse[], searchTerm: string) {
  const filteredResponses = useMemo(() => {
    if (!searchTerm.trim()) {
      return responses;
    }

    return responses.filter((response) =>
      response.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [responses, searchTerm]);

  return {
    filteredResponses,
  };
}
