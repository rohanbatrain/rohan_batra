'use client';

import { createAvatar } from '@dicebear/core';
import {
  adventurer,
  avataaars,
  bigEars,
  bottts,
  funEmoji,
  identicon,
  lorelei,
  micah,
  miniavs,
  openPeeps,
  personas,
  pixelArt,
} from '@dicebear/collection';
import { useMemo } from 'react';

export type AvatarStyle =
  | 'adventurer'
  | 'avataaars'
  | 'big-ears'
  | 'bottts'
  | 'fun-emoji'
  | 'identicon'
  | 'lorelei'
  | 'micah'
  | 'miniavs'
  | 'open-peeps'
  | 'personas'
  | 'pixel-art';

interface AvatarProps {
  style?: AvatarStyle;
  seed?: string;
  size?: number;
  radius?: number;
  backgroundColor?: string;
  className?: string;
}

const styleMap = {
  adventurer: adventurer,
  avataaars: avataaars,
  'big-ears': bigEars,
  bottts: bottts,
  'fun-emoji': funEmoji,
  identicon: identicon,
  lorelei: lorelei,
  micah: micah,
  miniavs: miniavs,
  'open-peeps': openPeeps,
  personas: personas,
  'pixel-art': pixelArt,
};

export default function Avatar({
  style = 'adventurer',
  seed = 'default',
  size = 100,
  radius = 50,
  backgroundColor = 'b6e3f4',
  className = '',
}: AvatarProps) {
  const avatarSvg = useMemo(() => {
    const selectedStyle = styleMap[style];
    if (!selectedStyle) {
      console.warn(
        `Avatar style "${style}" not found, falling back to adventurer`
      );
      return createAvatar(adventurer, {
        seed,
        size,
        radius,
        backgroundColor: [`#${backgroundColor}`],
      }).toString();
    }

    return createAvatar(selectedStyle, {
      seed,
      size,
      radius,
      backgroundColor: [`#${backgroundColor}`],
    }).toString();
  }, [style, seed, size, radius, backgroundColor]);

  return (
    <div
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: avatarSvg }}
    />
  );
}

// Export available styles for use in selectors
export const avatarStyles: {
  value: AvatarStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'adventurer',
    label: 'Adventurer',
    description: 'Cute illustrated avatars',
  },
  {
    value: 'avataaars',
    label: 'Avataaars',
    description: 'Sketch-style characters',
  },
  {
    value: 'big-ears',
    label: 'Big Ears',
    description: 'Playful characters with big ears',
  },
  { value: 'bottts', label: 'Bottts', description: 'Robot avatars' },
  {
    value: 'fun-emoji',
    label: 'Fun Emoji',
    description: 'Colorful emoji-style faces',
  },
  { value: 'identicon', label: 'Identicon', description: 'Geometric patterns' },
  {
    value: 'lorelei',
    label: 'Lorelei',
    description: 'Elegant illustrated portraits',
  },
  { value: 'micah', label: 'Micah', description: 'Simple line art faces' },
  { value: 'miniavs', label: 'Miniavs', description: 'Minimal avatar designs' },
  {
    value: 'open-peeps',
    label: 'Open Peeps',
    description: 'Hand-drawn style characters',
  },
  {
    value: 'personas',
    label: 'Personas',
    description: 'Abstract human figures',
  },
  {
    value: 'pixel-art',
    label: 'Pixel Art',
    description: 'Retro pixel-style avatars',
  },
];

// Predefined color palette for backgrounds
export const avatarColors = [
  'b6e3f4', // Light blue
  'fbbf24', // Yellow
  'fb7185', // Pink
  '34d399', // Green
  'a78bfa', // Purple
  'fcd34d', // Amber
  'f87171', // Red
  '60a5fa', // Blue
  '4ade80', // Light green
  'c084fc', // Light purple
  'fbbf24', // Orange
  '06b6d4', // Cyan
];
