'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const REACTION_EMOJIS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🎯', label: 'Bullseye' },
  { emoji: '💡', label: 'Insightful' },
  { emoji: '🔥', label: 'Fire' },
] as const;

interface ReactionBarProps {
  braindumpId: string;
  initialCounts: Record<string, number>;
}

export default function ReactionBar({ braindumpId, initialCounts }: ReactionBarProps) {
  const { isSignedIn } = useAuth();
  const [counts, setCounts] = useState(initialCounts);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user reactions if signed in
  useEffect(() => {
    if (isSignedIn) {
      fetch(`/api/braindump/${braindumpId}/reactions`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUserReactions(data.data.userReactions || []);
            setCounts(data.data.reactionCounts);
          }
        })
        .catch((err) => console.error('Failed to load reactions:', err));
    }
  }, [braindumpId, isSignedIn]);

  const handleReaction = async (emoji: string) => {
    if (!isSignedIn) {
      toast.error('Please sign in to react');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/braindump/${braindumpId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle reaction');
      }

      // Update local state
      setCounts(data.data.reactionCounts);
      
      if (data.data.action === 'added') {
        setUserReactions([...userReactions, emoji]);
      } else {
        setUserReactions(userReactions.filter((e) => e !== emoji));
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle reaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTION_EMOJIS.map(({ emoji, label }) => {
        const count = counts[emoji] || 0;
        const isActive = userReactions.includes(emoji);

        return (
          <Button
            key={emoji}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleReaction(emoji)}
            disabled={loading}
            className="gap-1.5"
            title={label}
          >
            <span className="text-base">{emoji}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
}
