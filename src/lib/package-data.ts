
import type { Package } from "@/lib/types";

// This was originally in src/app/admin/packages/page.tsx
const initialSamplePackagesData: Package[] = [
  {
    id: "pkg1",
    slug: "kandy-cultural-escape",
    title: "Kandy Cultural Escape",
    description: "Explore the rich heritage of Kandy, the last royal capital of Sri Lanka. Visit the Temple of the Tooth Relic and enjoy a cultural show.",
    price: 350,
    durationDays: 3,
    websiteId: "1",
    category: "Cultural",
    coverImageUrl: "https://placehold.co/600x400.png",
    images: ["https://placehold.co/600x400.png", "https://placehold.co/600x400.png"],
    status: "Published",
    inclusions: ["Accommodation", "Breakfast", "Guided Tours"],
    exclusions: ["Lunch", "Dinner", "Entrance Fees"],
    availabilityStart: new Date(2024, 0, 1),
    availabilityEnd: new Date(2024, 11, 31),
    createdAt: new Date(2023, 10, 1),
    updatedAt: new Date(2023, 11, 1),
    destinations: ["Kandy"],
  },
  {
    id: "pkg2",
    slug: "ella-adventure-trek",
    title: "Ella Adventure Trek",
    description: "Experience the breathtaking landscapes of Ella with hikes to Little Adam's Peak and Ella Rock. Enjoy stunning views and lush tea plantations.",
    price: 480,
    durationDays: 4,
    websiteId: "2",
    category: "Adventure",
    coverImageUrl: "https://placehold.co/600x400.png",
    status: "Draft",
    inclusions: ["Accommodation", "All Meals", "Trekking Guide", "Transport"],
    exclusions: ["Personal Expenses"],
    createdAt: new Date(2023, 9, 15),
    updatedAt: new Date(2023, 10, 15),
    destinations: ["Ella"],
  },
  {
    id: "pkg3",
    slug: "south-coast-beach-bliss",
    title: "South Coast Beach Bliss",
    description: "Relax and unwind on the beautiful beaches of Sri Lanka's south coast. Enjoy sun, sand, and surf in Mirissa and Unawatuna.",
    price: 600,
    durationDays: 5,
    websiteId: "1",
    category: "Beach",
    coverImageUrl: "https://placehold.co/600x400.png",
    status: "Published",
    inclusions: ["Beachfront Accommodation", "Breakfast", "Surfing Lessons"],
    exclusions: ["Flights", "Visa"],
    availabilityStart: new Date(2024, 2, 1),
    createdAt: new Date(2023, 11, 10),
    updatedAt: new Date(2023, 11, 20),
    destinations: ["Mirissa", "Unawatuna"],
  },
];

export const getInitialPackages = (): Package[] => {
  // Deep clone to avoid mutating the original array elsewhere if it's used.
  // And ensure dates are correctly instantiated if they were stringified/parsed.
  return JSON.parse(JSON.stringify(initialSamplePackagesData)).map((p: any) => ({
    ...p,
    availabilityStart: p.availabilityStart ? new Date(p.availabilityStart) : undefined,
    availabilityEnd: p.availabilityEnd ? new Date(p.availabilityEnd) : undefined,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));
};
