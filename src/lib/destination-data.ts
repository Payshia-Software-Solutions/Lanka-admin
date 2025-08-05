
import type { Destination } from "@/lib/types";

const initialSampleDestinations: Destination[] = [
  {
    id: "dest1",
    name: "Kandy",
    description:
      "A large city in central Sri Lanka. It's set on a plateau surrounded by mountains, which are home to tea plantations and biodiverse rainforest.",
    location: "Kandy, Sri Lanka",
    images: ["https://placehold.co/600x400.png"],
    websiteId: "1",
    metaTitle: "Explore Kandy | Sri Lanka's Cultural Capital",
    metaDescription: "Discover the Temple of the Tooth, beautiful gardens, and cultural shows in Kandy. Plan your trip to this historic Sri Lankan city."
  },
  {
    id: "dest2",
    name: "Ella",
    description:
      "A small town in the Badulla District of Uva Province, Sri Lanka. It is approximately 200 kilometres east of Colombo and is situated at an elevation of 1,041 metres above sea level.",
    location: "Ella, Sri Lanka",
    images: ["https://placehold.co/600x400.png"],
    websiteId: "2",
    metaTitle: "Visit Ella | Scenic Hill Country of Sri Lanka",
    metaDescription: "Experience breathtaking views, hike to Ella Rock, and walk the Nine Arch Bridge. Your adventure in Ella awaits."
  },
  {
    id: "dest3",
    name: "Mirissa",
    description:
      "A small town on the south coast of Sri Lanka, located in the Matara District of the Southern Province. It is a popular tourist destination for its beaches and whale watching.",
    location: "Mirissa, Sri Lanka",
    images: ["https://placehold.co/600x400.png"],
    websiteId: "1",
    metaTitle: "Mirissa Beach & Whale Watching | South Coast Sri Lanka",
    metaDescription: "Relax on the golden sands of Mirissa beach, go whale watching, and enjoy the vibrant nightlife. Plan your perfect beach getaway."
  },
  {
    id: "dest4",
    name: "Sigiriya",
    description:
      "An ancient rock fortress located in the northern Matale District near the town of Dambulla in the Central Province, Sri Lanka. The name refers to a site of historical and archaeological significance that is dominated by a massive column of rock nearly 200 metres high.",
    location: "Sigiriya, Sri Lanka",
    images: ["https://placehold.co/600x400.png"],
    websiteId: "3",
    metaTitle: "Sigiriya Rock Fortress | Ancient Wonder of Sri Lanka",
    metaDescription: "Climb the ancient Sigiriya rock fortress, a UNESCO World Heritage site. Discover stunning frescoes, landscaped gardens, and panoramic views."
  },
];


export const getInitialDestinations = (): Destination[] => {
  // Deep clone to avoid mutating the original array elsewhere if it's used.
  return JSON.parse(JSON.stringify(initialSampleDestinations));
};
