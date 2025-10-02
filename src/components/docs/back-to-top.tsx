'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      size='icon'
      className={cn(
        'fixed bottom-8 right-8 z-40 rounded-full shadow-lg transition-all',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
      )}
      aria-label='Back to top'
    >
      <ArrowUp className='h-5 w-5' />
    </Button>
  );
}
