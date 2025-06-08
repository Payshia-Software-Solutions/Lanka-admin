
export interface Website {
  id: string;
  name: string;
  domain: string;
  logoUrl: string;
  contact: string;
  createdAt: Date;
  updatedAt: Date;
  destinations?: Destination[];
  packages?: Package[];
  cmsPages?: CMSPage[];
  promotions?: Promotion[];
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  location: string; // Could be GeoJSON string or specific format
  images: string[];
  websiteId: string;
  website?: Website;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export type PackageStatus = 'Draft' | 'Published' | 'Archived';

export interface Package {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  destinations?: Destination[]; // IDs or full objects
  websiteId: string;
  website?: Website;
  itineraries?: Itinerary[];
  availabilityStart?: Date;
  availabilityEnd?: Date;
  category?: string;
  coverImageUrl?: string;
  images?: string[]; // Gallery images
  status: PackageStatus;
  inclusions?: string[];
  exclusions?: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Itinerary {
  id: string;
  dayNumber: number;
  title: string;
  details: string;
  packageId: string;
  package?: Package;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  websiteId: string;
  website?: Website;
  lastUpdatedAt?: Date;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  type: 'percentage' | 'fixed';
  amount: number;
  startDate: Date;
  endDate: Date;
  websiteId?: string; // Optional for global promotions
  website?: Website;
  isActive?: boolean;
}

export type InquiryStatus = 'New' | 'Quoted' | 'Approved' | 'Rejected';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  destination?: string; // User's desired destination
  message: string;
  status: InquiryStatus;
  websiteId: string;
  website?: Website;
  assignedTo?: string; // User ID of sales agent
  assignedToUser?: User;
  createdAt?: Date;
}

export type UserRole = 'superadmin' | 'admin' | 'editor' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  // Password typically not sent to client
}
