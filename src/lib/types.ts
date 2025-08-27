
export interface Activity {
  id: number;
  company_id: number;
  name: string;
  description: string;
  location: string;
  duration: number;
  image_url?: string;
  category?: string;
}
// Represents one "Thing to Do" for a destination
export interface ThingToDo {
  title: string;
  description: string;
  imageUrl: string;
  icon: string;
}

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
  image: string;
}


export interface ApiDestination {
  id: number; // Allow number for new items from DB
  name: string;
  description: string;
  location: string;
  websiteId?: string; // This may not be on the object from the backend directly
  company_id: string | number; // From backend
  
  // New detailed fields
  hero_heading?: string;
  hero_subheading?: string;
  hero_bg_image_url?: string;
  intro_heading?: string;
  intro_image_url?: string;
  gallery_image_urls?: string[];
  things_to_do?: ThingToDo[];
  nearby_attractions?: string[];
  travel_tip_heading?: string;
  travel_tip_icon?: string;
  travel_tip_description?: string;
  is_popular?: boolean;

  // Compatibility with old structure if needed
  images?: string[]; 
  metaTitle?: string;
  metaDescription?: string;
}

export type PackageStatus = 'Draft' | 'Published' | 'Archived';

export interface Package {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  destinations?: string[]; // Changed from Destination[] to string[]
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

// Main Trip Plan from the table
export interface TripPlan {
  id: number;
  user_id: number;
  full_name: string; // This seems to be joined in the main query
  from_date: string;
  to_date: string;
  adults: number;
  children: number;
  infants: number;
  duration?: number; // duration is now optional as it can be calculated
  pace: string;
  additional_requests: string | null;
  status: string;
  plan_type?: 'pre-plan' | 'custom-plan';
  budget_range: string;
  estimated_cost: string;
}

// Detailed view types
export interface TripActivity {
    id: number;
    activity_name: string;
}
export interface TripDestination {
    id: number;
    destination_name: string;
}
export interface TripTransportation {
    id: number;
    transport_method: string;
}
export interface TripInterest {
    id: number;
    interest_name: string;
}
export interface TripAddon {
    id: number;
    addon_name: string;
}
export interface TripAmenity {
    id: number;
    amenity_name: string;
}

export interface UserForTripPlan {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
}

// A composite type for the detailed view
export interface TripPlanDetails {
    plan: TripPlan | null;
    user: UserForTripPlan | null;
    activities: TripActivity[];
    destinations: TripDestination[];
    transportations: TripTransportation[];
    interests: TripInterest[];
    addons: TripAddon[];
    amenities: TripAmenity[];
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
  company_id?: string | number;
}

export interface Hotel {
  id: number;
  company_id: number;
  accommodation_type_id: number;
  destination_id: number;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface MealType {
  id: number;
  company_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleType {
  id: number;
  company_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
