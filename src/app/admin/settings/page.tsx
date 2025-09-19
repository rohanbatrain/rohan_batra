"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SiteSettingVm {
	_id: string;
	key: string;
	value: string | number | boolean | object;
	type: 'string' | 'number' | 'boolean' | 'json';
	description?: string;
	category: string;
	isPublic: boolean;
	updatedAt: string;
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
	const [editingSettings, setEditingSettings] = useState<Record<string, unknown>>({});
	const [newSetting, setNewSetting] = useState<NewSetting>({ key: '', value: '', description: '', category: 'general', type: 'string', isPublic: true });
	const [showNewForm, setShowNewForm] = useState(false);
	const { toast } = useToast();
	const [storageStatus, setStorageStatus] = useState<{ cloudinary?: { configured: boolean }; googleDrive?: { configured: boolean; enabled: boolean } } | null>(null);

	const fetchSettings = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/admin/settings', { credentials: 'include' });
			if (!response.ok) throw new Error('Failed to fetch settings');
			const result = await response.json();
			const settingsArray = ((result?.data?.settings ?? result?.settings ?? []) as SiteSettingVm[]).filter(Boolean);
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
			toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to load settings', variant: 'destructive' });
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
				const res = await fetch('/api/admin/integrations/storage', { credentials: 'include' });
				if (res.ok) setStorageStatus((await res.json())?.data ?? null);
			} catch {}
		})();
	}, []);

	const handleValueChange = (settingId: string, value: string | number | boolean | object) => {
		setEditingSettings(prev => ({ ...prev, [settingId]: value }));
	};

	const saveSettings = async () => {
		try {
			setSaving(true);
			const entries = Object.entries(editingSettings);
			if (entries.length === 0) {
				toast({ title: 'No Changes', description: 'No settings have been modified' });
				return;
			}
			if (!data) throw new Error('No settings to update');
			const byId: Record<string, SiteSettingVm> = {};
			for (const s of data.settings) byId[s._id] = s;
			const bulk = entries
				.map(([id, value]) => {
					const s = byId[id];
					if (!s) return null;
					return { key: s.key, value, type: s.type, category: s.category, description: s.description, isPublic: s.isPublic };
				})
				.filter(Boolean);
			if (bulk.length === 0) {
				toast({ title: 'No Changes', description: 'Nothing to update' });
				return;
			}
			const response = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ settings: bulk }) });
			if (!response.ok) {
				const err = await response.json().catch(() => null);
				throw new Error(err?.error || 'Failed to save settings');
			}
			const result = await response.json();
			toast({ title: result?.success ? 'Saved' : 'Partial Success', description: result?.message || 'Settings updated' });
			setEditingSettings({});
			fetchSettings();
		} catch (error) {
			toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save settings', variant: 'destructive' });
		} finally {
			setSaving(false);
		}
	};

	const createSetting = async () => {
		try {
			setSaving(true);
			if (!newSetting.key || newSetting.value === '') {
				toast({ title: 'Validation Error', description: 'Key and value are required', variant: 'destructive' });
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
			const response = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ...newSetting, value: processedValue }) });
			if (!response.ok) {
				const error = await response.json().catch(() => ({} as any));
				throw new Error(error.error || 'Failed to create setting');
			}
			toast({ title: 'Success', description: 'Setting created successfully' });
			setNewSetting({ key: '', value: '', description: '', category: 'general', type: 'string', isPublic: true });
			setShowNewForm(false);
			fetchSettings();
		} catch (error) {
			toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create setting', variant: 'destructive' });
		} finally {
			setSaving(false);
		}
	};

	const deleteSetting = async (_settingId: string, key: string) => {
		if (!confirm(`Are you sure you want to delete the setting "${key}"?`)) return;
		try {
			const response = await fetch(`/api/admin/settings/${encodeURIComponent(key)}`, { method: 'DELETE', credentials: 'include' });
			if (!response.ok) throw new Error('Failed to delete setting');
			toast({ title: 'Success', description: 'Setting deleted successfully' });
			fetchSettings();
		} catch (error) {
			toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete setting', variant: 'destructive' });
		}
	};

	const renderSettingValue = (setting: SiteSettingVm) => {
		const currentValue = editingSettings[setting._id] !== undefined ? editingSettings[setting._id] : setting.value;
		switch (setting.type) {
			case 'boolean':
				return <Switch checked={Boolean(currentValue)} onChange={e => handleValueChange(setting._id, e.currentTarget.checked)} />;
			case 'number':
				return <Input type='number' value={String(currentValue)} onChange={e => handleValueChange(setting._id, parseFloat(e.target.value))} />;
			case 'json':
				return (
					<Textarea
						value={typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue, null, 2)}
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
			default:
				return <Input value={String(currentValue ?? '')} onChange={e => handleValueChange(setting._id, e.target.value)} />;
		}
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
					<p className='text-gray-600 mt-2'>Quick toggles for common features</p>
				</div>
			</div>

			{Object.keys(editingSettings).length > 0 && (
				<Card className='border-yellow-200 bg-yellow-50'>
					<CardContent className='p-4'>
						<p className='text-sm text-yellow-700'>
							You have {Object.keys(editingSettings).length} unsaved change(s). Click "Save Changes" to apply them.
						</p>
					</CardContent>
				</Card>
			)}

			{/* Simple feature toggles */}
			<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
				<Card>
					<CardContent className='p-6 flex items-start justify-between'>
						<div>
							<h3 className='font-medium'>Unstable Features</h3>
							<p className='text-sm text-gray-600'>Show experimental tools in Admin.</p>
						</div>
						<Switch
							checked={Boolean(data.grouped['features']?.find(s => s.key === 'features.unstable')?.value)}
							onChange={async e => {
								const enabled = e.currentTarget.checked;
								await fetch('/api/admin/settings', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									credentials: 'include',
									body: JSON.stringify({ key: 'features.unstable', value: enabled, type: 'boolean', category: 'features', description: 'Enable unstable admin features', isPublic: false }),
								});
								fetchSettings();
							}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-6 flex items-start justify-between'>
						<div>
							<h3 className='font-medium'>Rich Blog Editor</h3>
							<p className='text-sm text-gray-600'>Use Novel editor for blog posts.</p>
						</div>
						<Switch
							checked={Boolean(data.grouped['features']?.find(s => s.key === 'features.richeditor')?.value)}
							onChange={async e => {
								const enabled = e.currentTarget.checked;
								await fetch('/api/admin/settings', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									credentials: 'include',
									body: JSON.stringify({ key: 'features.richeditor', value: enabled, type: 'boolean', category: 'features', description: 'Enable Novel rich editor for blog authoring', isPublic: false }),
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
							<p className='text-sm text-gray-600'>Store uploads in Drive (fallback to Cloudinary).</p>
							{storageStatus && (
								<p className='text-xs mt-1'>
									Drive configured: {storageStatus.googleDrive?.configured ? 'Yes' : 'No'} · Cloudinary configured: {storageStatus.cloudinary?.configured ? 'Yes' : 'No'}
								</p>
							)}
						</div>
						<Switch
							checked={Boolean(data.grouped['features']?.find(s => s.key === 'features.googledrive')?.value)}
							onChange={async e => {
								const enabled = e.currentTarget.checked;
								await fetch('/api/admin/settings', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									credentials: 'include',
									body: JSON.stringify({ key: 'features.googledrive', value: enabled, type: 'boolean', category: 'features', description: 'Enable Google Drive as the primary uploads backend', isPublic: false }),
								});
								fetchSettings();
								try {
									const res = await fetch('/api/admin/integrations/storage', { credentials: 'include' });
									if (res.ok) setStorageStatus((await res.json())?.data ?? null);
								} catch {}
							}}
						/>
					</CardContent>
				</Card>
			</div>

			{/* Advanced settings editor (collapsed) */}
			<details className='mt-4'>
				<summary className='cursor-pointer text-sm text-gray-600'>Advanced settings (key/value)</summary>
				<div className='mt-4'>
					<div className='flex justify-end gap-2 mb-4'>
						<Button onClick={() => setShowNewForm(!showNewForm)} variant='outline'>
							<Plus className='h-4 w-4 mr-2' />Add Setting
						</Button>
						<Button onClick={saveSettings} disabled={Object.keys(editingSettings).length === 0 || saving}>
							<Save className='h-4 w-4 mr-2' />{saving ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>

					{showNewForm && (
						<Card className='mb-6'>
							<CardHeader>
								<CardTitle>Add New Setting</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<Label htmlFor='new-key'>Key</Label>
										<Input id='new-key' value={newSetting.key} onChange={e => setNewSetting(prev => ({ ...prev, key: e.target.value }))} placeholder='e.g., site.title' />
									</div>
									<div>
										<Label htmlFor='new-category'>Category</Label>
										<Select value={newSetting.category} onValueChange={value => setNewSetting(prev => ({ ...prev, category: value }))}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{data.categories.map(cat => (
													<SelectItem key={cat} value={cat}>
														{cat}
													</SelectItem>
												))}
												<SelectItem value='general'>general</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor='new-type'>Type</Label>
										<Select value={newSetting.type} onValueChange={(value: string) => setNewSetting(prev => ({ ...prev, type: value as NewSetting['type'] }))}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='string'>String</SelectItem>
												<SelectItem value='number'>Number</SelectItem>
												<SelectItem value='boolean'>Boolean</SelectItem>
												<SelectItem value='json'>JSON</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className='flex items-center space-x-2'>
										<Switch checked={newSetting.isPublic} onChange={e => setNewSetting(prev => ({ ...prev, isPublic: e.currentTarget.checked }))} />
										<Label>Public Setting</Label>
									</div>
								</div>
								<div>
									<Label htmlFor='new-value'>Value</Label>
									<Textarea id='new-value' value={newSetting.value} onChange={e => setNewSetting(prev => ({ ...prev, value: e.target.value }))} placeholder='Enter the setting value' />
								</div>
								<div>
									<Label htmlFor='new-description'>Description</Label>
									<Textarea id='new-description' value={newSetting.description} onChange={e => setNewSetting(prev => ({ ...prev, description: e.target.value }))} placeholder='Optional description' />
								</div>
								<div className='flex gap-2'>
									<Button onClick={createSetting} disabled={saving}>Create Setting</Button>
									<Button variant='outline' onClick={() => setShowNewForm(false)}>Cancel</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{data.categories?.map(category => (
						<div key={category} className='space-y-4'>
							<h3 className='font-semibold capitalize'>{category}</h3>
							{data.grouped[category]?.map(setting => (
								<Card key={setting._id}>
									<CardContent className='p-6'>
										<div className='space-y-4'>
											<div className='flex justify-between items-start'>
												<div className='flex-1'>
													<div className='flex items-center gap-2 mb-2'>
														<h3 className='font-medium'>{setting.key}</h3>
														<Badge variant='outline'>{setting.type}</Badge>
														{!setting.isPublic && <Badge variant='secondary'>Private</Badge>}
													</div>
													{setting.description && <p className='text-sm text-gray-600 mb-3'>{setting.description}</p>}
												</div>
												<Button variant='ghost' size='sm' onClick={() => deleteSetting(setting._id, setting.key)} className='text-red-600 hover:text-red-700'>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
											<div>
												<Label className='text-sm font-medium'>Value</Label>
												<div className='mt-1'>{renderSettingValue(setting)}</div>
											</div>
											<div className='text-xs text-gray-500'>Last updated: {new Date(setting.updatedAt).toLocaleString()}</div>
										</div>
									</CardContent>
								</Card>
							))}
							{(!data.grouped[category] || data.grouped[category].length === 0) && (
								<Card>
									<CardContent className='p-6 text-center text-gray-500'>No settings in this category</CardContent>
								</Card>
							)}
						</div>
					))}
				</div>
			</details>
		</div>
	);
}

