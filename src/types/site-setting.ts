export interface SiteSetting {
  _id?: string;
  key: string;
  value: string | number | boolean | object;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  isPublic: boolean;
  isSystem: boolean;
  updatedBy?: string; // User ID
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SiteSettingWithUpdater extends Omit<SiteSetting, 'updatedBy'> {
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface SiteSettingSummary {
  key: string;
  value: string | number | boolean | object;
  type: string;
  category: string;
  description?: string;
  updatedAt?: Date;
}
