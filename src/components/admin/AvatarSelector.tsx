'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Avatar, { avatarStyles, avatarColors, type AvatarStyle } from '@/components/ui/Avatar';
import { Shuffle, Download, Save } from 'lucide-react';

interface AvatarConfig {
  style: AvatarStyle;
  seed: string;
  backgroundColor: string;
  radius: number;
}

interface AvatarSelectorProps {
  initialConfig?: Partial<AvatarConfig>;
  onSave?: (config: AvatarConfig) => void;
  className?: string;
}

export default function AvatarSelector({
  initialConfig = {},
  onSave,
  className = '',
}: AvatarSelectorProps) {
  const [config, setConfig] = useState<AvatarConfig>({
    style: 'adventurer',
    seed: `user-${Date.now()}`,
    backgroundColor: 'b6e3f4',
    radius: 50,
    ...initialConfig,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const updateConfig = useCallback((updates: Partial<AvatarConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const generateRandomSeed = useCallback(() => {
    setIsGenerating(true);
    const randomSeed = Math.random().toString(36).substring(2, 15);
    updateConfig({ seed: randomSeed });
    setTimeout(() => setIsGenerating(false), 300);
  }, [updateConfig]);

  const downloadAvatar = useCallback(() => {
    // Create a temporary link to download the SVG
    const avatarElement = document.querySelector('#avatar-preview svg');
    if (avatarElement) {
      const svgData = new XMLSerializer().serializeToString(avatarElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `avatar-${config.seed}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  }, [config.seed]);

  const handleSave = useCallback(() => {
    onSave?.(config);
  }, [config, onSave]);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <span>Avatar Selector</span>
            <Button
              variant='outline'
              size='sm'
              onClick={generateRandomSeed}
              disabled={isGenerating}
              className='ml-auto'
            >
              <Shuffle className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Randomize
            </Button>
          </CardTitle>
          <CardDescription>
            Customize your avatar using various styles and settings. All avatars are generated using DiceBear.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Avatar Preview */}
          <div className='flex justify-center'>
            <div 
              id='avatar-preview' 
              className='p-6 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600'
            >
              <Avatar
                style={config.style}
                seed={config.seed}
                size={150}
                radius={config.radius}
                backgroundColor={config.backgroundColor}
                className='transition-all duration-300 ease-in-out'
              />
            </div>
          </div>

          {/* Style Selection */}
          <div className='space-y-2'>
            <Label htmlFor='avatar-style'>Avatar Style</Label>
            <Select
              value={config.style}
              onValueChange={(value: AvatarStyle) => updateConfig({ style: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select avatar style' />
              </SelectTrigger>
              <SelectContent>
                {avatarStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{style.label}</span>
                      <span className='text-sm text-gray-500'>{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seed Input */}
          <div className='space-y-2'>
            <Label htmlFor='avatar-seed'>Seed Value</Label>
            <Input
              id='avatar-seed'
              value={config.seed}
              onChange={(e) => updateConfig({ seed: e.target.value })}
              placeholder='Enter seed value for avatar generation'
              className='font-mono'
            />
            <p className='text-sm text-gray-500'>
              The seed determines the avatar features. Same seed = same avatar.
            </p>
          </div>

          {/* Background Color */}
          <div className='space-y-3'>
            <Label>Background Color</Label>
            <div className='grid grid-cols-6 gap-2'>
              {avatarColors.map((color) => (
                <button
                  key={color}
                  onClick={() => updateConfig({ backgroundColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    config.backgroundColor === color
                      ? 'border-gray-900 dark:border-gray-100 scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: `#${color}` }}
                  title={`Color: #${color}`}
                />
              ))}
            </div>
            <Input
              value={config.backgroundColor}
              onChange={(e) => updateConfig({ backgroundColor: e.target.value.replace('#', '') })}
              placeholder='Custom hex color (without #)'
              className='font-mono'
            />
          </div>

          {/* Border Radius */}
          <div className='space-y-3'>
            <Label>Border Radius: {config.radius}%</Label>
            <Slider
              value={[config.radius]}
              onValueChange={([value]) => updateConfig({ radius: value })}
              max={50}
              min={0}
              step={5}
              className='w-full'
            />
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Square</span>
              <span>Rounded</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2 pt-4'>
            <Button onClick={downloadAvatar} variant='outline' className='flex-1'>
              <Download className='w-4 h-4 mr-2' />
              Download SVG
            </Button>
            {onSave && (
              <Button onClick={handleSave} className='flex-1'>
                <Save className='w-4 h-4 mr-2' />
                Save Avatar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Avatar Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Style:</span>
              <span className='font-medium'>{avatarStyles.find(s => s.value === config.style)?.label}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Seed:</span>
              <span className='font-mono text-xs'>{config.seed}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Background:</span>
              <div className='flex items-center gap-2'>
                <div 
                  className='w-4 h-4 rounded border'
                  style={{ backgroundColor: `#${config.backgroundColor}` }}
                />
                <span className='font-mono text-xs'>#{config.backgroundColor}</span>
              </div>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Radius:</span>
              <span className='font-medium'>{config.radius}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}