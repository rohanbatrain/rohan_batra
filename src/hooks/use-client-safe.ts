import { useEffect, useState } from 'react';

/**
 * Hook to safely get the current year without hydration mismatches
 * Returns a static year initially, then updates on client-side
 */
export function useCurrentYear(): number {
  const [year, setYear] = useState(2025); // Default year to prevent hydration mismatch

  useEffect(() => {
    // Update to actual current year after hydration
    setYear(new Date().getFullYear());
  }, []);

  return year;
}

/**
 * Hook to check if component has hydrated (mounted on client)
 * Useful for preventing hydration mismatches with dynamic content
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

/**
 * Hook for safe client-only rendering
 * Returns null on server/initial render, then actual content after hydration
 */
export function useClientOnly<T>(content: T): T | null {
  const hasMounted = useHasMounted();
  return hasMounted ? content : null;
}
