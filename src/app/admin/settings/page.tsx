'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IANATimezones } from '@/lib/timezones';

interface SiteSettingVm {
  _id: string;
  key: string;
  value: string | number | boolean | object;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: string;
  isPublic: boolean;
  updatedAt: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: Array<string | number | { label: string; value: any }>;
    ui?: 'toggle' | 'select';
  };
}

interface SettingsDataVm {
  settings: SiteSettingVm[];
  grouped: Record<string, SiteSettingVm[]>;
  categories: string[];
}

interface NewSetting {
  key: string;
  value: string;
  description: string;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isPublic: boolean;
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsDataVm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSettings, setEditingSettings] = useState<
    Record<string, unknown>
  >({});
  const [newSetting, setNewSetting] = useState<NewSetting>({
    key: '',
    value: '',
    description: '',
    category: 'general',
    type: 'string',
    isPublic: true,
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const { toast } = useToast();
  const [storageStatus, setStorageStatus] = useState<{
    cloudinary?: { configured: boolean };
    googleDrive?: { configured: boolean; enabled: boolean };
  } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const result = await response.json();
      const settingsArray = (
        (result?.data?.settings ?? result?.settings ?? []) as SiteSettingVm[]
      ).filter(Boolean);
      const grouped: Record<string, SiteSettingVm[]> = {};
      for (const s of settingsArray) {
        const cat = s.category || 'general';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(s);
      }
      const categories = Object.keys(grouped).sort();
      if (!categories.includes('general')) categories.unshift('general');
      if (!categories.includes('features')) categories.push('features');
      setData({ settings: settingsArray, grouped, categories });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/integrations/storage', {
          credentials: 'include',
        });
        if (res.ok) setStorageStatus((await res.json())?.data ?? null);
      } catch {}
    })();
  }, []);

  const handleValueChange = (
    settingId: string,
    value: string | number | boolean | object
  ) => {
    setEditingSettings(prev => ({ ...prev, [settingId]: value }));
  };

  // Bulk save removed in simplified UI — each control saves immediately

  const createSetting = async () => {
    try {
      setSaving(true);
      if (!newSetting.key || newSetting.value === '') {
        toast({
          title: 'Validation Error',
          description: 'Key and value are required',
          variant: 'destructive',
        });
        return;
      }
      let processedValue: string | number | boolean | object = newSetting.value;
      switch (newSetting.type) {
        case 'number': {
          const numValue = parseFloat(newSetting.value as string);
          if (isNaN(numValue)) throw new Error('Invalid number value');
          processedValue = numValue;
          break;
        }
        case 'boolean':
          processedValue = newSetting.value === 'true';
          break;
        case 'json':
          try {
            processedValue = JSON.parse(newSetting.value);
          } catch {
            throw new Error('Invalid JSON value');
          }
          break;
      }
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...newSetting, value: processedValue }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}) as any);
        throw new Error(error.error || 'Failed to create setting');
      }
      toast({ title: 'Success', description: 'Setting created successfully' });
      setNewSetting({
        key: '',
        value: '',
        description: '',
        category: 'general',
        type: 'string',
        isPublic: true,
      });
      setShowNewForm(false);
      fetchSettings();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteSetting = async (_settingId: string, key: string) => {
    if (!confirm(`Are you sure you want to delete the setting "${key}"?`))
      return;
    try {
      const response = await fetch(
        `/api/admin/settings/${encodeURIComponent(key)}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to delete setting');
      toast({ title: 'Success', description: 'Setting deleted successfully' });
      fetchSettings();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete setting',
        variant: 'destructive',
      });
    }
  };

  const renderSettingValue = (setting: SiteSettingVm) => {
    const currentValue =
      editingSettings[setting._id] !== undefined
        ? editingSettings[setting._id]
        : setting.value;
    // UI preference override
    if (setting.validation?.ui === 'toggle' || setting.type === 'boolean') {
      return (
        <Switch
          checked={Boolean(currentValue)}
          onCheckedChange={val => handleValueChange(setting._id, val)}
        />
      );
    }

    // Dropdown if options provided
    if (
      setting.validation?.ui === 'select' ||
      (Array.isArray(setting.validation?.options) &&
        setting.validation!.options!.length > 0) ||
      setting.key === 'site.timezone'
    ) {
      const options = (() => {
        if (
          Array.isArray(setting.validation?.options) &&
          setting.validation.options.length > 0
        ) {
          return setting.validation.options.map((opt: any) =>
            typeof opt === 'object' && opt !== null
              ? opt
              : { label: String(opt), value: opt }
          );
        }
        if (setting.key === 'site.timezone') {
          return IANATimezones.map((tz: string) => ({ label: tz, value: tz }));
        }
        return [] as { label: string; value: any }[];
      })();

      const toKey = (v: any) => JSON.stringify(v);
      const selectValue = currentValue === undefined ? '' : toKey(currentValue);

      return (
        <Select
          value={selectValue}
          onValueChange={val => handleValueChange(setting._id, JSON.parse(val))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt: any) => (
              <SelectItem key={toKey(opt.value)} value={toKey(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Number input
    if (setting.type === 'number') {
      return (
        <Input
          type='number'
          value={String(currentValue)}
          onChange={e =>
            handleValueChange(setting._id, parseFloat(e.target.value))
          }
        />
      );
    }

    // JSON textarea
    if (setting.type === 'json') {
      return (
        <Textarea
          value={
            typeof currentValue === 'string'
              ? currentValue
              : JSON.stringify(currentValue, null, 2)
          }
          onChange={e => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleValueChange(setting._id, parsed);
            } catch {
              handleValueChange(setting._id, e.target.value);
            }
          }}
          className='font-mono text-sm'
          rows={4}
        />
      );
    }

    // Default text input
    return (
      <Input
        value={String(currentValue ?? '')}
        onChange={e => handleValueChange(setting._id, e.target.value)}
      />
    );
  };

  if (loading) {
    return (
      <div className='container mx-auto py-8'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='p-6 text-center'>
            <p>No settings data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Settings className='h-8 w-8' />
            Site Settings
          </h1>
          <p className='text-gray-600 mt-2'>Only the essential controls.</p>
        </div>
      </div>

      {/* Simple feature toggles */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {/* Skill page: Tags panel visibility */}
        <Card>
          <CardContent className='p-6 flex items-start justify-between'>
            <div>
              <h3 className='font-medium'>Skill Tags Panel</h3>
              <p className='text-sm text-gray-600'>Show the Tags card on skill pages.</p>
            </div>
            <Switch
              checked={Boolean(
                data.grouped['features']?.find(
                  s => s.key === 'features.skills.tagsPanel'
                )?.value ?? false
              )}
              onCheckedChange={async enabled => {
                await fetch('/api/admin/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    key: 'features.skills.tagsPanel',
                    value: enabled,
                    type: 'boolean',
                    category: 'features',
                    description: 'Show the tags panel on skill pages',
                    isPublic: false,
                    validation: { ui: 'toggle' },
                  }),
                });
                fetchSettings();
              }}
            />
          </CardContent>
        </Card>
        {/* Portfolio: show Category Match Mode control */}
        <Card>
          <CardContent className='p-6 flex items-start justify-between'>
            <div>
              <h3 className='font-medium'>Portfolio Category Mode Control</h3>
              <p className='text-sm text-gray-600'>
                Show the category match mode selector on Portfolio.
              </p>
            </div>
            <Switch
              checked={Boolean(
                data.grouped['features']?.find(
                  s => s.key === 'features.portfolio.categorymodetoggle'
                )?.value ?? true
              )}
              onCheckedChange={async enabled => {
                await fetch('/api/admin/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    key: 'features.portfolio.categorymodetoggle',
                    value: enabled,
                    type: 'boolean',
                    category: 'features',
                    description:
                      'Toggle visibility of the category match mode control on the portfolio page',
                    isPublic: false,
                  }),
                });
                fetchSettings();
              }}
            />
          </CardContent>
        </Card>
        {/* Trending fallback on Home */}
        <Card>
          <CardContent className='p-6 flex items-start justify-between'>
            <div>
              <h3 className='font-medium'>Trending Fallback on Home</h3>
              <p className='text-sm text-gray-600'>
                Show trending projects when no featured exist.
              </p>
            </div>
            <Switch
              checked={Boolean(
                data.grouped['features']?.find(
                  s => s.key === 'features.home.trendingfallback'
                )?.value ?? true
              )}
              onCheckedChange={async enabled => {
                await fetch('/api/admin/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    key: 'features.home.trendingfallback',
                    value: enabled,
                    type: 'boolean',
                    category: 'features',
                    description:
                      'Use trending projects on the home page when there are no featured projects',
                    isPublic: false,
                  }),
                });
                fetchSettings();
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-start justify-between'>
            <div>
              <h3 className='font-medium'>Unstable Features</h3>
              <p className='text-sm text-gray-600'>
                Show experimental tools in Admin.
              </p>
            </div>
            <Switch
              checked={Boolean(
                data.grouped['features']?.find(
                  s => s.key === 'features.unstable'
                )?.value
              )}
              onCheckedChange={async enabled => {
                await fetch('/api/admin/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    key: 'features.unstable',
                    value: enabled,
                    type: 'boolean',
                    category: 'features',
                    description: 'Enable unstable admin features',
                    isPublic: false,
                  }),
                });
                fetchSettings();
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 flex items-start justify-between'>
            <div>
              <h3 className='font-medium'>Google Drive Storage</h3>
              <p className='text-sm text-gray-600'>
                Store uploads in Drive (fallback to Cloudinary).
              </p>
              {storageStatus && (
                <p className='text-xs mt-1'>
                  Drive configured:{' '}
                  {storageStatus.googleDrive?.configured ? 'Yes' : 'No'} ·
                  Cloudinary configured:{' '}
                  {storageStatus.cloudinary?.configured ? 'Yes' : 'No'}
                </p>
              )}
            </div>
            <Switch
              checked={Boolean(
                data.grouped['features']?.find(
                  s => s.key === 'features.googledrive'
                )?.value
              )}
              onCheckedChange={async enabled => {
                await fetch('/api/admin/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    key: 'features.googledrive',
                    value: enabled,
                    type: 'boolean',
                    category: 'features',
                    description:
                      'Enable Google Drive as the primary uploads backend',
                    isPublic: false,
                  }),
                });
                fetchSettings();
                try {
                  const res = await fetch('/api/admin/integrations/storage', {
                    credentials: 'include',
                  });
                  if (res.ok)
                    setStorageStatus((await res.json())?.data ?? null);
                } catch {}
              }}
            />
          </CardContent>
        </Card>

        {/* Site Timezone */}
        <Card>
          <CardContent className='p-6 flex items-start justify-between gap-4'>
            <div>
              <h3 className='font-medium'>Site Timezone</h3>
              <p className='text-sm text-gray-600'>
                Default timezone for dates and quick notes.
              </p>
            </div>
            <div className='min-w-[220px]'>
              <Select
                value={String(
                  data.grouped['general']?.find(s => s.key === 'site.timezone')
                    ?.value ?? 'UTC'
                )}
                onValueChange={async tz => {
                  await fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                      key: 'site.timezone',
                      value: tz,
                      type: 'string',
                      category: 'general',
                      description: 'Default timezone for site',
                      isPublic: false,
                      validation: { ui: 'select' },
                    }),
                  });
                  toast({
                    title: 'Saved',
                    description: `Timezone set to ${tz}`,
                  });
                  fetchSettings();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='max-h-72'>
                  {IANATimezones.map(tz => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
