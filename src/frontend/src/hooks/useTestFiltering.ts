import { useMemo, useState } from 'react';
import type { Test } from '../backend';

export function useTestFiltering(tests: Test[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState('all');

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = testTypeFilter === 'all' || test.testType === testTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [tests, searchTerm, testTypeFilter]);

  return {
    filteredTests,
    searchTerm,
    setSearchTerm,
    testTypeFilter,
    setTestTypeFilter,
  };
}
