import { useState, useEffect, useMemo } from 'react';

export const useSearch = (data = [], searchKeys = [], delay = 300) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  // DEBOUNCE LOGIC
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(handler); // Cleanup para hindi mag-overlap
  }, [searchTerm, delay]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const term = debouncedTerm.trim().toLowerCase();
    if (!term) return [];

    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        return value?.toString().toLowerCase().includes(term);
      })
    );
  }, [data, debouncedTerm, searchKeys]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    isSearching: searchTerm !== debouncedTerm // Loading state indicator
  };
};