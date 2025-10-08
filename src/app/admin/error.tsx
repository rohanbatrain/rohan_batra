/**
 * Admin Error Boundary
 * Handles errors in admin pages
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Panel Error
          </h1>
          <p className="text-lg text-muted-foreground">
            An error occurred in the admin panel.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-muted rounded-lg text-left max-w-lg mx-auto">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin" className="gap-2">
              <Settings className="w-4 h-4" />
              Admin Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </Button>
        </div>

        {/* Security Note */}
        <div className="p-4 bg-muted rounded-lg text-sm">
          <p className="text-muted-foreground">
            <strong>Note:</strong> This error has been logged for review. If you
            need immediate assistance, please check the server logs or contact the
            system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
