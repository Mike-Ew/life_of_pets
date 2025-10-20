// Mock data for development
export const mockPets = [
  {
    id: 1,
    name: "Max",
    age: 3,
    breed: "Golden Retriever",
    description: "Friendly and energetic, loves to play fetch and go for long walks.",
    temperament_tags: ["friendly", "energetic", "playful"],
    mainPhoto: require("../../assets/Pet Pictures/alvan-nee-T-0EW-SEbsE-unsplash.jpg"),
    photos: [
      { id: 1, url: require("../../assets/Pet Pictures/alvan-nee-T-0EW-SEbsE-unsplash.jpg"), is_main: true },
      { id: 2, url: require("../../assets/Pet Pictures/alvan-nee-eoqnr8ikwFE-unsplash.jpg"), is_main: false },
    ],
  },
  {
    id: 2,
    name: "Luna",
    age: 2,
    breed: "Siamese Cat",
    description: "Calm and affectionate, enjoys napping in sunny spots.",
    temperament_tags: ["calm", "affectionate", "independent"],
    mainPhoto: require("../../assets/Pet Pictures/jay-wennington-CdK2eYhWfQ0-unsplash.jpg"),
    photos: [
      { id: 3, url: require("../../assets/Pet Pictures/jay-wennington-CdK2eYhWfQ0-unsplash.jpg"), is_main: true },
    ],
  },
  {
    id: 3,
    name: "Charlie",
    age: 5,
    breed: "Labrador",
    description: "Loyal companion, great with kids and very intelligent.",
    temperament_tags: ["loyal", "intelligent", "gentle"],
    mainPhoto: require("../../assets/Pet Pictures/alvan-nee-1VgfQdCuX-4-unsplash.jpg"),
    photos: [
      { id: 4, url: require("../../assets/Pet Pictures/alvan-nee-1VgfQdCuX-4-unsplash.jpg"), is_main: true },
      { id: 5, url: require("../../assets/Pet Pictures/richard-brutyo-Sg3XwuEpybU-unsplash.jpg"), is_main: false },
    ],
  },
];

// Mock care data
export const mockCareToday = [
  {
    id: 1,
    petId: 1,
    title: "Feeding AM",
    type: "feeding",
    time: "08:00",
    status: "upcoming",
  },
  {
    id: 2,
    petId: 1,
    title: "Water",
    type: "water",
    time: "09:00",
    status: "upcoming",
  },
  {
    id: 3,
    petId: 1,
    title: "Exercise/Walk",
    type: "exercise",
    time: "17:00",
    status: "upcoming",
  },
  {
    id: 4,
    petId: 1,
    title: "Feeding PM",
    type: "feeding",
    time: "18:00",
    status: "upcoming",
  },
];

export const mockCareUpcoming = [
  {
    id: 5,
    petId: 1,
    title: "Rabies Vaccine",
    type: "vaccination",
    dueDate: "2025-10-25",
    status: "upcoming",
  },
  {
    id: 6,
    petId: 1,
    title: "Bath",
    type: "bath",
    dueDate: "2025-10-22",
    status: "upcoming",
  },
  {
    id: 7,
    petId: 1,
    title: "Grooming",
    type: "grooming",
    dueDate: "2025-10-28",
    status: "upcoming",
  },
];

export const mockCareLogs = [
  {
    id: 1,
    petId: 1,
    type: "weight",
    title: "Weight Check",
    value: "28.5 kg",
    occurred_at: "2025-10-15",
    notes: "Healthy weight",
  },
  {
    id: 2,
    petId: 1,
    type: "medication",
    title: "Flea Treatment",
    value: "Applied",
    occurred_at: "2025-10-10",
    notes: "Monthly treatment",
  },
  {
    id: 3,
    petId: 1,
    type: "bath",
    title: "Bath",
    value: "Completed",
    occurred_at: "2025-10-08",
    notes: "Used hypoallergenic shampoo",
  },
];
