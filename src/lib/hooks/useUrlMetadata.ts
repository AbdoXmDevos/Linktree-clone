import { useState, useCallback } from 'react';

export interface UrlMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  url: string;
}

export interface UseUrlMetadataReturn {
  metadata: UrlMetadata | null;
  isLoading: boolean;
  error: string | null;
  fetchMetadata: (url: string) => Promise<UrlMetadata | null>;
  clearMetadata: () => void;
}

export function useUrlMetadata(): UseUrlMetadataReturn {
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async (url: string): Promise<UrlMetadata | null> => {
    if (!url || !url.trim()) {
      setError('URL is required');
      return null;
    }

    // Basic URL validation
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(url.trim())) {
      setError('Please enter a valid URL starting with http:// or https://');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch metadata');
      }

      if (data.success && data.metadata) {
        setMetadata(data.metadata);
        return data.metadata;
      } else {
        throw new Error('No metadata found');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch URL metadata';
      setError(errorMessage);
      setMetadata(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMetadata = useCallback(() => {
    setMetadata(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    metadata,
    isLoading,
    error,
    fetchMetadata,
    clearMetadata
  };
}