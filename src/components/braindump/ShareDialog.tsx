'use client';

import { useState } from 'react';
import { Copy, Check, Twitter, Linkedin, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}

export default function ShareDialog({ open, onOpenChange, url, title }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track share event
      fetch(`/api/braindump/${url.split('/').pop()}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'copy' }),
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: string) => {
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');

      // Track share event
      fetch(`/api/braindump/${url.split('/').pop()}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      }).catch(() => {});
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Braindump</DialogTitle>
          <DialogDescription>
            Share this braindump with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy URL */}
          <div className="flex gap-2">
            <Input
              value={url}
              readOnly
              className="flex-1"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleShare('twitter')}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>

            <Button
              onClick={() => handleShare('linkedin')}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>

            <Button
              onClick={() => handleShare('email')}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
