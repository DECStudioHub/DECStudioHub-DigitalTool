export type CategoryId = 
  | 'it'
  | 'calculators'
  | 'motorcycle'
  | 'solar'
  | 'household-electricity'
  | 'units'
  | 'image'
  | 'donation';

export type SubCategoryId = 'general' | 'motorcycle' | 'solar' | 'household';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  color: string;
  borderColor: string;
  badge?: string;
}

export interface ToolDefinition {
  id: string;
  categoryId: CategoryId;
  subCategory?: SubCategoryId;
  name: string;
  shortDescription: string;
  description: string;
  tags: string[];
  popular?: boolean;
  icon: string;
}

export interface MaintenanceRecord {
  id: string;
  item: string;
  lastServiceDate: string; // YYYY-MM-DD
  intervalDays: number;
  intervalKm?: number;
  lastKm?: number;
  notes: string;
  updatedAt: number;
}
