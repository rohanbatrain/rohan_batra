/**
 * React Hook: useCSRFToken
 * Fetches and manages CSRF token for authenticated requests
 */

'use client';

import { useEffect, useState } from 'react';

interface CSRFToken {
  token: string;
  expiresAt: number;
}

export function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch CSRF token on mount and refresh when needed
  useEffect(() => {
    fetchCSRFToken();
  }, []);

  const fetchCSRFToken = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/csrf-token', {
        credentials: 'include', // Ensure cookies are sent/received
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      
      if (data.success && data.data.token) {
        console.log('[useCSRFToken] Fetched token:', data.data.token.substring(0, 30) + '...');
        setCSRFToken(data.data.token);
        
        // Calculate expiry time
        const expiresAt = Date.now() + (data.data.expiresIn * 1000);
        
        // Store in memory with expiry
        sessionStorage.setItem('csrf-token', JSON.stringify({
          token: data.data.token,
          expiresAt,
        }));
        
        // Schedule refresh before expiry (1 hour before)
        const refreshIn = (data.data.expiresIn * 1000) - (60 * 60 * 1000);
        if (refreshIn > 0) {
          setTimeout(fetchCSRFToken, refreshIn);
        }
      }
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get token from storage or state
  const getToken = (): string | null => {
    if (csrfToken) return csrfToken;

    // Try to get from session storage
    const stored = sessionStorage.getItem('csrf-token');
    if (stored) {
      try {
        const { token, expiresAt } = JSON.parse(stored) as CSRFToken;
        
        // Check if expired
        if (Date.now() < expiresAt) {
          setCSRFToken(token);
          return token;
        }
      } catch {
        // Invalid storage format
        sessionStorage.removeItem('csrf-token');
      }
    }

    return null;
  };

  // Helper to create headers with CSRF token
  const withCSRF = (headers: HeadersInit = {}): HeadersInit => {
    const token = getToken();
    
    console.log('[useCSRFToken] withCSRF called');
    console.log('[useCSRFToken] Token from getToken():', token ? token.substring(0, 20) + '...' : 'NULL');
    
    if (!token) {
      console.warn('[useCSRFToken] No CSRF token available');
      return headers;
    }

    const result = {
      ...headers,
      'X-CSRF-Token': token,
    };
    
    console.log('[useCSRFToken] Final headers:', result);
    
    return result;
  };

  return {
    csrfToken: getToken(),
    isLoading,
    error,
    refresh: fetchCSRFToken,
    withCSRF,
  };
}
