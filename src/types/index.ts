export interface TripDay {
  id: string;
  date: string;
  park: Park | null;
  transportation: Transportation[];
  rides: Ride[];
  reservations: Reservation[];
  food: Food[];
}

export interface Park {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Transportation {
  id: string;
  type: 'bus' | 'monorail' | 'boat' | 'walking' | 'uber' | 'lyft' | 'rental' | 'other';
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  notes?: string;
  color: string;
}

export interface Ride {
  id: string;
  name: string;
  park: string;
  type: 'attraction' | 'show' | 'character-meet' | 'parade' | 'fireworks';
  priority: 'must-do' | 'want-to-do' | 'if-time' | 'skip';
  timeSlot?: string;
  duration: number; // in minutes
  fastPass?: boolean;
  geniePlus?: boolean;
  notes?: string;
  color: string;
}

export interface Reservation {
  id: string;
  name: string;
  type: 'dining' | 'hotel' | 'spa' | 'tour' | 'other';
  location: string;
  date: string;
  time: string;
  partySize: number;
  confirmationNumber?: string;
  notes?: string;
  color: string;
}

export interface Food {
  id: string;
  name: string;
  type: 'quick-service' | 'table-service' | 'character-dining' | 'snack' | 'drink' | 'dessert';
  location: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timeSlot?: string;
  partySize: number;
  budget: number;
  reservationNumber?: string;
  notes?: string;
  color: string;
}

export interface CategoryColors {
  rides: string;
  reservations: string;
  transportation: string;
  food: string;
}

export interface AccountProfile {
  id: string;
  name: string;
  age: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  dietaryPreferences?: string[];
  ridePreferences?: 'thrill-seeker' | 'family-friendly' | 'mild' | 'mixed';
  favoriteCharacters?: string[];
  favoriteRides?: string[];
  lovesAboutDisney?: string;
  accountId: string; // Which account this profile belongs to
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  resort: Resort | null;
  assignedProfileIds: string[]; // References to AccountProfile IDs
  days: TripDay[];
  createdAt: string;
  updatedAt: string;
  accountId: string;
  createdBy: string;
  isPublic?: boolean;
}

export interface Resort {
  id: string;
  name: string;
  category: 'value' | 'moderate' | 'deluxe' | 'deluxe-villa' | 'other';
  location: string;
  transportation: string[];
}

export const PARKS: Park[] = [
  { id: 'mk', name: 'Magic Kingdom', color: 'disney-blue', icon: '🏰' },
  { id: 'epcot', name: 'Epcot', color: 'disney-purple', icon: '🌍' },
  { id: 'hs', name: 'Hollywood Studios', color: 'disney-pink', icon: '🎬' },
  { id: 'ak', name: 'Animal Kingdom', color: 'disney-green', icon: '🌿' },
  { id: 'ds', name: 'Disney Springs', color: 'disney-orange', icon: '🛍️' },
  { id: 'blt', name: 'Blizzard Beach', color: 'disney-lightblue', icon: '🏖️' },
  { id: 'tl', name: 'Typhoon Lagoon', color: 'disney-darkblue', icon: '🌊' },
];

export const TRANSPORTATION_TYPES = [
  { value: 'bus', label: 'Disney Bus', color: 'disney-blue' },
  { value: 'monorail', label: 'Monorail', color: 'disney-purple' },
  { value: 'boat', label: 'Boat/Ferry', color: 'disney-green' },
  { value: 'walking', label: 'Walking', color: 'disney-gray' },
  { value: 'uber', label: 'Uber', color: 'disney-orange' },
  { value: 'lyft', label: 'Lyft', color: 'disney-pink' },
  { value: 'rental', label: 'Rental Car', color: 'disney-yellow' },
  { value: 'other', label: 'Other', color: 'disney-gray' },
];

export const RIDE_TYPES = [
  { value: 'attraction', label: 'Attraction', color: 'disney-blue' },
  { value: 'show', label: 'Show', color: 'disney-purple' },
  { value: 'character-meet', label: 'Character Meet', color: 'disney-pink' },
  { value: 'parade', label: 'Parade', color: 'disney-yellow' },
  { value: 'fireworks', label: 'Fireworks', color: 'disney-orange' },
];

export const RESERVATION_TYPES = [
  { value: 'dining', label: 'Dining', color: 'disney-green' },
  { value: 'hotel', label: 'Hotel', color: 'disney-blue' },
  { value: 'spa', label: 'Spa', color: 'disney-pink' },
  { value: 'tour', label: 'Tour', color: 'disney-purple' },
  { value: 'other', label: 'Other', color: 'disney-gray' },
];

export const FOOD_TYPES = [
  { value: 'quick-service', label: 'Quick Service', color: 'disney-yellow' },
  { value: 'table-service', label: 'Table Service', color: 'disney-green' },
  { value: 'character-dining', label: 'Character Dining', color: 'disney-purple' },
  { value: 'snack', label: 'Snack', color: 'disney-orange' },
  { value: 'drink', label: 'Drink', color: 'disney-blue' },
  { value: 'dessert', label: 'Dessert', color: 'disney-pink' },
];

export const RESORTS: Resort[] = [
  // Value Resorts
  { id: 'all-star-movies', name: "Disney's All-Star Movies Resort", category: 'value', location: 'Animal Kingdom Area', transportation: ['bus'] },
  { id: 'all-star-music', name: "Disney's All-Star Music Resort", category: 'value', location: 'Animal Kingdom Area', transportation: ['bus'] },
  { id: 'all-star-sports', name: "Disney's All-Star Sports Resort", category: 'value', location: 'Animal Kingdom Area', transportation: ['bus'] },
  { id: 'art-of-animation', name: "Disney's Art of Animation Resort", category: 'value', location: 'EPCOT Area', transportation: ['bus', 'skyliner'] },
  { id: 'pop-century', name: "Disney's Pop Century Resort", category: 'value', location: 'EPCOT Area', transportation: ['bus', 'skyliner'] },

  // Moderate Resorts
  { id: 'caribbean-beach', name: "Disney's Caribbean Beach Resort", category: 'moderate', location: 'EPCOT Area', transportation: ['bus', 'skyliner'] },
  { id: 'coronado-springs', name: "Disney's Coronado Springs Resort", category: 'moderate', location: 'Animal Kingdom Area', transportation: ['bus'] },
  { id: 'fort-wilderness', name: "Disney's Fort Wilderness Resort", category: 'moderate', location: 'Magic Kingdom Area', transportation: ['bus', 'boat'] },
  { id: 'port-orleans-french', name: "Disney's Port Orleans Resort - French Quarter", category: 'moderate', location: 'Disney Springs Area', transportation: ['bus', 'boat'] },
  { id: 'port-orleans-riverside', name: "Disney's Port Orleans Resort - Riverside", category: 'moderate', location: 'Disney Springs Area', transportation: ['bus', 'boat'] },

  // Deluxe Resorts
  { id: 'animal-kingdom-lodge', name: "Disney's Animal Kingdom Lodge", category: 'deluxe', location: 'Animal Kingdom Area', transportation: ['bus'] },
  { id: 'beach-club', name: "Disney's Beach Club Resort", category: 'deluxe', location: 'EPCOT Area', transportation: ['bus', 'boat', 'walking'] },
  { id: 'boardwalk', name: "Disney's BoardWalk Inn", category: 'deluxe', location: 'EPCOT Area', transportation: ['bus', 'boat', 'walking'] },
  { id: 'contemporary', name: "Disney's Contemporary Resort", category: 'deluxe', location: 'Magic Kingdom Area', transportation: ['monorail', 'walking'] },
  { id: 'grand-floridian', name: "Disney's Grand Floridian Resort & Spa", category: 'deluxe', location: 'Magic Kingdom Area', transportation: ['monorail', 'boat'] },
  { id: 'polynesian', name: "Disney's Polynesian Village Resort", category: 'deluxe', location: 'Magic Kingdom Area', transportation: ['monorail', 'boat'] },
  { id: 'wilderness-lodge', name: "Disney's Wilderness Lodge", category: 'deluxe', location: 'Magic Kingdom Area', transportation: ['bus', 'boat'] },
  { id: 'yacht-club', name: "Disney's Yacht Club Resort", category: 'deluxe', location: 'EPCOT Area', transportation: ['bus', 'boat', 'walking'] },

  // DVC/Deluxe Villa Resorts
  { id: 'bay-lake-tower', name: "Bay Lake Tower at Disney's Contemporary Resort", category: 'deluxe-villa', location: 'Magic Kingdom Area', transportation: ['monorail', 'walking'] },
  { id: 'boardwalk-villas', name: "Disney's BoardWalk Villas", category: 'deluxe-villa', location: 'EPCOT Area', transportation: ['bus', 'boat', 'walking'] },
  { id: 'old-key-west', name: "Disney's Old Key West Resort", category: 'deluxe-villa', location: 'Disney Springs Area', transportation: ['bus', 'boat'] },
  { id: 'riviera', name: "Disney's Riviera Resort", category: 'deluxe-villa', location: 'EPCOT Area', transportation: ['bus', 'skyliner'] },
  { id: 'saratoga-springs', name: "Disney's Saratoga Springs Resort & Spa", category: 'deluxe-villa', location: 'Disney Springs Area', transportation: ['bus', 'boat'] },

  // Other Hotels
  { id: 'swan', name: 'Walt Disney World Swan', category: 'other', location: 'EPCOT Area', transportation: ['bus', 'boat', 'walking'] },
  { id: 'dolphin', name: 'Walt Disney World Dolphin', category: 'other', location: 'EPCOT Area', transportation: ['bus', 'boat', 'walking'] },
  { id: 'swan-reserve', name: 'Walt Disney World Swan Reserve', category: 'other', location: 'EPCOT Area', transportation: ['bus', 'boat', 'walking'] },
  { id: 'shades-of-green', name: 'Shades of Green', category: 'other', location: 'Magic Kingdom Area', transportation: ['bus'] },
  { id: 'off-property', name: 'Off-Property Hotel', category: 'other', location: 'Various', transportation: ['rental', 'uber', 'lyft'] },
];

// Authentication and User Management Types
export interface UserAccount {
  id: string;
  name: string;
  ownerId: string; // Clerk user ID of account owner
  billingEmail?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'trial';
  profiles: AccountProfile[]; // All profiles for this account
  createdAt: string;
  updatedAt: string;
}

export interface AccountUser {
  id: string;
  accountId: string;
  userId: string; // Clerk user ID
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: UserPermission[];
  invitedBy: string; // Clerk user ID
  joinedAt: string;
  lastActive?: string;
}

export interface UserPermission {
  resource: 'trips' | 'users' | 'billing' | 'settings';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface AppUser {
  clerkId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  accountId?: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
  createdAt: string;
  lastLogin?: string;
  invitedBy?: string; // Clerk user ID of who invited this user
  invitedAt?: string; // When the invitation was sent
  status?: 'active' | 'invited' | 'suspended'; // User status
}

// Role definitions for easy reference
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ACCOUNT_OWNER: 'owner',
  ACCOUNT_ADMIN: 'admin',
  ACCOUNT_EDITOR: 'editor',
  ACCOUNT_VIEWER: 'viewer'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Permission definitions
export const PERMISSIONS = {
  TRIPS: {
    CREATE: 'trips:create',
    READ: 'trips:read', 
    UPDATE: 'trips:update',
    DELETE: 'trips:delete'
  },
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update', 
    DELETE: 'users:delete'
  },
  BILLING: {
    READ: 'billing:read',
    UPDATE: 'billing:update'
  },
  SETTINGS: {
    READ: 'settings:read',
    UPDATE: 'settings:update'
  }
} as const;

export const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergy',
  'Shellfish Allergy',
  'Kosher',
  'Halal',
  'Low Sodium',
  'Diabetic Friendly',
  'No Spicy Food',
  'Picky Eater',
  'Other'
];

export const RIDE_PREFERENCES = [
  { value: 'thrill-seeker', label: 'Thrill Seeker', description: 'Loves roller coasters and intense rides' },
  { value: 'family-friendly', label: 'Family Friendly', description: 'Prefers gentle rides suitable for all ages' },
  { value: 'mild', label: 'Mild Rides Only', description: 'Prefers calm, slow-moving attractions' },
  { value: 'mixed', label: 'Mixed Preferences', description: 'Enjoys a variety of ride types' },
];

export const POPULAR_DISNEY_CHARACTERS = [
  'Mickey Mouse',
  'Minnie Mouse',
  'Donald Duck',
  'Goofy',
  'Pluto',
  'Elsa',
  'Anna',
  'Olaf',
  'Moana',
  'Maui',
  'Belle',
  'Beast',
  'Ariel',
  'Simba',
  'Timon & Pumbaa',
  'Buzz Lightyear',
  'Woody',
  'Lightning McQueen',
  'Rapunzel',
  'Flynn Rider',
  'Princess Jasmine',
  'Aladdin',
  'Mulan',
  'Pocahontas',
  'Tiana',
  'Prince Naveen',
  'Merida',
  'Baymax',
  'Stitch',
  'Winnie the Pooh',
  'Tigger',
  'Eeyore',
  'Tinker Bell',
  'Peter Pan',
  'Captain Hook',
  'Cinderella',
  'Prince Charming',
  'Snow White',
  'The Seven Dwarfs',
  'Alice',
  'Mad Hatter',
  'Cheshire Cat',
  'Dumbo',
  'Bambi',
  'Thumper',
  'Lady and the Tramp',
  'Cruella de Vil',
  'Maleficent',
  'Ursula',
  'Jafar',
  'Scar',
  'Gaston'
];

export const POPULAR_DISNEY_RIDES = [
  // Magic Kingdom
  'Space Mountain',
  'Big Thunder Mountain Railroad',
  'Splash Mountain',
  'Pirates of the Caribbean',
  'Haunted Mansion',
  'It\'s a Small World',
  'Jungle Cruise',
  'Seven Dwarfs Mine Train',
  'Peter Pan\'s Flight',
  'Buzz Lightyear\'s Space Ranger Spin',
  'Dumbo the Flying Elephant',
  'Mad Tea Party',
  'Carousel of Progress',
  
  // EPCOT
  'Guardians of the Galaxy: Cosmic Rewind',
  'Test Track',
  'Soarin\' Around the World',
  'The Seas with Nemo & Friends',
  'Journey Into Imagination with Figment',
  'Spaceship Earth',
  'Mission: SPACE',
  'The Land Pavilion',
  'Frozen Ever After',
  'Gran Fiesta Tour',
  
  // Hollywood Studios
  'Rise of the Resistance',
  'Millennium Falcon: Smugglers Run',
  'Tower of Terror',
  'Rock \'n\' Roller Coaster',
  'Mickey & Minnie\'s Runaway Railway',
  'Toy Story Midway Mania!',
  'Alien Swirling Saucers',
  'Slinky Dog Dash',
  'Star Tours',
  'Indiana Jones Epic Stunt Spectacular',
  
  // Animal Kingdom
  'Avatar Flight of Passage',
  'Na\'vi River Journey',
  'Expedition Everest',
  'Kilimanjaro Safaris',
  'Dinosaur',
  'It\'s Tough to be a Bug!',
  'Kali River Rapids',
  'TriceraTop Spin',
  'The Boneyard',
  'Festival of the Lion King'
]; 