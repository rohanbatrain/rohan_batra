import connectToDatabase from '@/lib/mongodb';
import SiteSetting from '@/models/SiteSetting';

/**
 * Get a boolean setting from SiteSetting with a safe default.
 * If not found or any error occurs, returns the provided defaultValue.
 */
export async function getBooleanSetting(
  key: string,
  defaultValue = false
): Promise<boolean> {
  try {
    await connectToDatabase();
  const setting = await SiteSetting.findOne({ key: key.toLowerCase() });
    if (!setting) return defaultValue;
    if (setting.type === 'boolean') return Boolean(setting.value);
    // If stored as json/string, coerce sensible values
    if (typeof setting.value === 'string') {
      const lowered = setting.value.toLowerCase().trim();
      if (['true', '1', 'yes', 'on', 'enabled'].includes(lowered)) return true;
      if (['false', '0', 'no', 'off', 'disabled'].includes(lowered)) return false;
    }
    if (typeof setting.value === 'number') {
      return setting.value !== 0;
    }
    if (typeof setting.value === 'object' && setting.value) {
      // support shape: { enabled: boolean }
      // biome-ignore lint/suspicious/noExplicitAny: generic shape
      const obj: any = setting.value;
      if (typeof obj.enabled === 'boolean') return obj.enabled;
    }
    return defaultValue;
  } catch (e) {
    // Fail closed (hidden) by default per request
    return defaultValue;
  }
}

/** Keys used across the app for feature toggles */
export const SettingKeys = {
  skillsTagsPanel: 'features.skills.tagsPanel',
} as const;
