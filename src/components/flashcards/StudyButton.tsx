'use client';

import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudyButtonProps {
  scope: 'course' | 'module' | 'lesson';
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  cardCount?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function StudyButton({
  scope,
  courseId,
  moduleId,
  lessonId,
  cardCount = 0,
  className = '',
  variant = 'default',
}: StudyButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStudy = async () => {
    setIsLoading(true);
    
    // Build query params
    const params = new URLSearchParams({
      scope,
      courseId,
      ...(moduleId && { moduleId }),
      ...(lessonId && { lessonId }),
    });

    // Navigate to study page
    router.push(`/flashcards/study?${params.toString()}`);
  };

  if (cardCount === 0) {
    return null; // Don't show button if no cards
  }

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      onClick={handleStudy}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          <span>Study</span>
          <span className="text-xs opacity-80">({cardCount} cards)</span>
        </>
      )}
    </button>
  );
}
