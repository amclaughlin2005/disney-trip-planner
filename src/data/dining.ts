export interface DiningLocation {
  id: string;
  name: string;
  park: string;
  location: string;
  cuisine: string[];
  mealTypes: string[];
  diningPlanType: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  description: string;
  reservationRequired: boolean;
  mobileOrder: boolean;
  dietaryOptions: string[];
  status?: string;
  lastUpdated?: string;
}

export const DINING_LOCATIONS: DiningLocation[] = [
  // Magic Kingdom - Adventureland
  {
    id: 'aloha-isle',
    name: 'Aloha Isle',
    park: 'Magic Kingdom',
    location: 'Adventureland',
    cuisine: ['Snacks', 'Ice Cream'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Famous for Dole Whips and tropical treats',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: ['Plant Based Options', 'Gluten Free Options']
  },
  {
    id: 'egg-roll-wagon',
    name: 'Egg Roll Wagon',
    park: 'Magic Kingdom',
    location: 'Adventureland',
    cuisine: ['Asian', 'Snacks'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Asian-inspired egg rolls and snacks',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: []
  },
  {
    id: 'skipper-canteen',
    name: 'Jungle Navigation Co., Ltd. Skipper Canteen',
    park: 'Magic Kingdom',
    location: 'Adventureland',
    cuisine: ['Asian', 'Latin', 'African'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Jungle Cruise-themed restaurant with global cuisine',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'sunshine-tree-terrace',
    name: 'Sunshine Tree Terrace',
    park: 'Magic Kingdom',
    location: 'Adventureland',
    cuisine: ['Snacks', 'Ice Cream'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Citrus swirls and refreshing treats',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: []
  },

  // Magic Kingdom - Fantasyland
  {
    id: 'be-our-guest',
    name: 'Be Our Guest',
    park: 'Magic Kingdom',
    location: 'Fantasyland',
    cuisine: ['French', 'American'],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    diningPlanType: ['Table Service', 'Quick/Counter Service'],
    priceRange: '$$$',
    description: 'Beauty and the Beast themed restaurant in the Beast\'s castle',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'cheshire-cafe',
    name: 'Cheshire Cafe',
    park: 'Magic Kingdom',
    location: 'Fantasyland',
    cuisine: ['Snacks', 'Ice Cream'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Alice in Wonderland themed snacks and treats',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: []
  },
  {
    id: 'cinderellas-royal-table',
    name: 'Cinderella\'s Royal Table',
    park: 'Magic Kingdom',
    location: 'Fantasyland',
    cuisine: ['American'],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    diningPlanType: ['Character Dining', 'Signature Dining', '2-credits'],
    priceRange: '$$$$',
    description: 'Character dining experience inside Cinderella Castle',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'friars-nook',
    name: 'Friar\'s Nook',
    park: 'Magic Kingdom',
    location: 'Fantasyland',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner', 'Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Mac and cheese hot dogs and specialty items',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: []
  },
  {
    id: 'gastons-tavern',
    name: 'Gaston\'s Tavern',
    park: 'Magic Kingdom',
    location: 'Fantasyland',
    cuisine: ['Snacks'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Beauty and the Beast themed snacks and LeFou\'s Brew',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: []
  },
  {
    id: 'pinocchio-village-haus',
    name: 'Pinocchio Village Haus',
    park: 'Magic Kingdom',
    location: 'Fantasyland',
    cuisine: ['Italian', 'American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Italian-American fare with Pinocchio theming',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'storybook-treats',
    name: 'Storybook Treats',
    park: 'Magic Kingdom',
    location: 'Fantasyland',
    cuisine: ['Ice Cream', 'Snacks'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Ice cream and sweet treats',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: []
  },

  // Magic Kingdom - Frontierland
  {
    id: 'diamond-horseshoe',
    name: 'Diamond Horseshoe',
    park: 'Magic Kingdom',
    location: 'Frontierland',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Western-themed dining with saloon atmosphere',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: []
  },
  {
    id: 'golden-oak-outpost',
    name: 'Golden Oak Outpost',
    park: 'Magic Kingdom',
    location: 'Frontierland',
    cuisine: ['American', 'Snacks'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Chicken nuggets and frontier snacks',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: []
  },
  {
    id: 'pecos-bill',
    name: 'Pecos Bill Tall Tale Inn and Cafe',
    park: 'Magic Kingdom',
    location: 'Frontierland',
    cuisine: ['Mexican', 'American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Tex-Mex cuisine with extensive toppings bar',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'westward-ho',
    name: 'Westward Ho Refreshments',
    park: 'Magic Kingdom',
    location: 'Frontierland',
    cuisine: ['American', 'Snacks'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Turkey legs and frontier refreshments',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: []
  },

  // Magic Kingdom - Liberty Square
  {
    id: 'columbia-harbour-house',
    name: 'Columbia Harbour House',
    park: 'Magic Kingdom',
    location: 'Liberty Square',
    cuisine: ['Seafood', 'American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Nautical-themed seafood restaurant',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'liberty-tree-tavern',
    name: 'Liberty Tree Tavern',
    park: 'Magic Kingdom',
    location: 'Liberty Square',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service', 'Character Dining'],
    priceRange: '$$',
    description: 'Colonial American dining with character meals',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'sleepy-hollow',
    name: 'Sleepy Hollow',
    park: 'Magic Kingdom',
    location: 'Liberty Square',
    cuisine: ['American', 'Snacks'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Famous for funnel cakes and sweet treats',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: []
  },

  // Magic Kingdom - Main Street USA
  {
    id: 'caseys-corner',
    name: 'Casey\'s Corner',
    park: 'Magic Kingdom',
    location: 'Main Street USA',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner', 'Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Baseball-themed hot dog restaurant',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: []
  },
  {
    id: 'crystal-palace',
    name: 'Crystal Palace',
    park: 'Magic Kingdom',
    location: 'Main Street USA',
    cuisine: ['American'],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    diningPlanType: ['Character Dining', 'Buffet Dining', 'Table Service'],
    priceRange: '$$$',
    description: 'Winnie the Pooh character buffet dining',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'main-street-bakery',
    name: 'Main Street Bakery - Starbucks',
    park: 'Magic Kingdom',
    location: 'Main Street USA',
    cuisine: ['Coffee', 'Bakery'],
    mealTypes: ['Breakfast', 'Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Starbucks coffee and pastries in Victorian setting',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: ['Plant Based Options']
  },
  {
    id: 'plaza-ice-cream',
    name: 'Plaza Ice Cream Parlor',
    park: 'Magic Kingdom',
    location: 'Main Street USA',
    cuisine: ['Ice Cream'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Hand-scooped ice cream and sundaes',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: []
  },
  {
    id: 'plaza-restaurant',
    name: 'Plaza Restaurant',
    park: 'Magic Kingdom',
    location: 'Main Street USA',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Victorian-era restaurant with American classics',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'tonys-town-square',
    name: 'Tony\'s Town Square',
    park: 'Magic Kingdom',
    location: 'Main Street USA',
    cuisine: ['Italian'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Lady and the Tramp themed Italian restaurant',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },

  // Magic Kingdom - Tomorrowland
  {
    id: 'auntie-gravitys',
    name: 'Auntie Gravity\'s Galactic Goodies',
    park: 'Magic Kingdom',
    location: 'Tomorrowland',
    cuisine: ['Snacks', 'Ice Cream'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Space-themed snacks and ice cream',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: []
  },
  {
    id: 'cosmic-rays',
    name: 'Cosmic Ray\'s Starlight Cafe',
    park: 'Magic Kingdom',
    location: 'Tomorrowland',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Space-age dining with multiple food stations',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'lunching-pad',
    name: 'Lunching Pad',
    park: 'Magic Kingdom',
    location: 'Tomorrowland',
    cuisine: ['American', 'Snacks'],
    mealTypes: ['Snacks'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Space-themed snacks and specialty hot dogs',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: []
  },

  // EPCOT - World Showcase
  {
    id: 'le-cellier',
    name: 'Le Cellier',
    park: 'Epcot',
    location: 'Canada Pavilion',
    cuisine: ['Steakhouse'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Signature Dining', '2-credits'],
    priceRange: '$$$$',
    description: 'Canadian steakhouse in castle-like setting',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Gluten Free Options']
  },
  {
    id: 'nine-dragons',
    name: 'Nine Dragons Restaurant',
    park: 'Epcot',
    location: 'China Pavilion',
    cuisine: ['Chinese', 'Asian'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Authentic Chinese cuisine',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'chefs-de-france',
    name: 'Chefs de France',
    park: 'Epcot',
    location: 'France Pavilion',
    cuisine: ['French'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$$',
    description: 'Classic French bistro cuisine',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'monsieur-paul',
    name: 'Monsieur Paul',
    park: 'Epcot',
    location: 'France Pavilion',
    cuisine: ['French'],
    mealTypes: ['Dinner'],
    diningPlanType: ['Signature Dining', '2-credits'],
    priceRange: '$$$$',
    description: 'Fine French dining experience',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'biergarten',
    name: 'Biergarten Restaurant',
    park: 'Epcot',
    location: 'Germany Pavilion',
    cuisine: ['German'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service', 'Buffet Dining'],
    priceRange: '$$',
    description: 'German buffet with live entertainment',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'via-napoli',
    name: 'Via Napoli Ristorante e Pizzeria',
    park: 'Epcot',
    location: 'Italy Pavilion',
    cuisine: ['Italian'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Authentic Neapolitan pizza and Italian cuisine',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'teppan-edo',
    name: 'Teppan Edo',
    park: 'Epcot',
    location: 'Japan Pavilion',
    cuisine: ['Japanese'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$$',
    description: 'Hibachi-style Japanese dining',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'takumi-tei',
    name: 'Takumi-Tei',
    park: 'Epcot',
    location: 'Japan Pavilion',
    cuisine: ['Japanese', 'Omakase Tasting Menu'],
    mealTypes: ['Dinner'],
    diningPlanType: ['Signature Dining', '2-credits'],
    priceRange: '$$$$',
    description: 'Premium Japanese dining experience',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'san-angel-inn',
    name: 'San Angel Inn Restaurante',
    park: 'Epcot',
    location: 'Mexico Pavilion',
    cuisine: ['Mexican'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Mexican cuisine in atmospheric setting',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'akershus',
    name: 'Akershus Royal Banquet Hall',
    park: 'Epcot',
    location: 'Norway Pavilion',
    cuisine: ['Norwegian', 'American'],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    diningPlanType: ['Character Dining', 'Table Service'],
    priceRange: '$$$',
    description: 'Princess character dining in castle setting',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'rose-and-crown',
    name: 'Rose and Crown Dining Room',
    park: 'Epcot',
    location: 'United Kingdom Pavilion',
    cuisine: ['British', 'Irish'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Traditional British pub fare',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },

  // EPCOT - Future World
  {
    id: 'space-220',
    name: 'Space 220',
    park: 'Epcot',
    location: 'World Discovery',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Signature Dining', '2-credits'],
    priceRange: '$$$$',
    description: 'Space-themed fine dining with simulated space views',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'coral-reef',
    name: 'Coral Reef Restaurant',
    park: 'Epcot',
    location: 'World Nature',
    cuisine: ['Seafood', 'American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$$',
    description: 'Underwater-themed dining next to aquarium',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'garden-grill',
    name: 'Garden Grill',
    park: 'Epcot',
    location: 'World Nature',
    cuisine: ['American'],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    diningPlanType: ['Character Dining', 'Table Service'],
    priceRange: '$$',
    description: 'Rotating restaurant with character dining',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'sunshine-seasons',
    name: 'Sunshine Seasons',
    park: 'Epcot',
    location: 'World Nature',
    cuisine: ['American', 'Asian', 'Italian'],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Food court with multiple cuisine options',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Plant Based Options']
  },

  // Hollywood Studios
  {
    id: 'sci-fi-dine-in',
    name: 'Sci Fi Dine-In Theater',
    park: 'Hollywood Studios',
    location: 'Commissary Lane',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Drive-in movie theater themed restaurant',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: '50s-prime-time',
    name: '50\'s Prime Time Cafe',
    park: 'Hollywood Studios',
    location: 'Echo Lake',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: '1950s home-style cooking with interactive service',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'hollywood-vine',
    name: 'Hollywood and Vine',
    park: 'Hollywood Studios',
    location: 'Echo Lake',
    cuisine: ['American'],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    diningPlanType: ['Character Dining', 'Buffet Dining'],
    priceRange: '$$$',
    description: 'Character buffet dining experience',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'hollywood-brown-derby',
    name: 'Hollywood Brown Derby',
    park: 'Hollywood Studios',
    location: 'Hollywood Boulevard',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Signature Dining', '2-credits'],
    priceRange: '$$$$',
    description: 'Upscale dining inspired by the original Hollywood restaurant',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'docking-bay-7',
    name: 'Docking Bay 7 Food and Cargo',
    park: 'Hollywood Studios',
    location: 'Star Wars: Galaxy\'s Edge',
    cuisine: ['Other'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Star Wars themed quick service with galactic cuisine',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: ['Plant Based Options']
  },
  {
    id: 'ogas-cantina',
    name: 'Oga\'s Cantina',
    park: 'Hollywood Studios',
    location: 'Star Wars: Galaxy\'s Edge',
    cuisine: ['Other'],
    mealTypes: ['All-Day'],
    diningPlanType: ['Bar/Lounge'],
    priceRange: '$$',
    description: 'Star Wars themed cantina with specialty drinks',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: []
  },
  {
    id: 'roundup-rodeo-bbq',
    name: 'Roundup Rodeo BBQ',
    park: 'Hollywood Studios',
    location: 'Toy Story Land',
    cuisine: ['BBQ', 'American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Toy Story themed BBQ restaurant',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'woodys-lunch-box',
    name: 'Woody\'s Lunch Box',
    park: 'Hollywood Studios',
    location: 'Toy Story Land',
    cuisine: ['American'],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Toy Story themed quick service',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: []
  },

  // Animal Kingdom
  {
    id: 'tusker-house',
    name: 'Tusker House Restaurant',
    park: 'Animal Kingdom',
    location: 'Africa',
    cuisine: ['African', 'American'],
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    diningPlanType: ['Character Dining', 'Buffet Dining'],
    priceRange: '$$$',
    description: 'African-inspired character buffet',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'harambe-market',
    name: 'Harambe Market',
    park: 'Animal Kingdom',
    location: 'Africa',
    cuisine: ['African'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'African street food marketplace',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: ['Plant Based Options']
  },
  {
    id: 'yak-and-yeti-restaurant',
    name: 'Yak and Yeti Restaurant',
    park: 'Animal Kingdom',
    location: 'Asia',
    cuisine: ['Asian', 'Indian'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Table Service'],
    priceRange: '$$',
    description: 'Pan-Asian cuisine in Himalayan setting',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'yak-and-yeti-local-food',
    name: 'Yak and Yeti Local Food Cafes',
    park: 'Animal Kingdom',
    location: 'Asia',
    cuisine: ['Asian'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Quick service Asian cuisine',
    reservationRequired: false,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'restaurantosaurus',
    name: 'Restaurantosaurus',
    park: 'Animal Kingdom',
    location: 'Dinoland USA',
    cuisine: ['American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Dinosaur-themed American cuisine',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: []
  },
  {
    id: 'flame-tree-bbq',
    name: 'Flame Tree BBQ',
    park: 'Animal Kingdom',
    location: 'Discovery Island',
    cuisine: ['BBQ', 'American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Barbecue with waterfront seating',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: []
  },
  {
    id: 'tiffins',
    name: 'Tiffins',
    park: 'Animal Kingdom',
    location: 'Discovery Island',
    cuisine: ['American', 'Asian', 'African'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Signature Dining', '2-credits'],
    priceRange: '$$$$',
    description: 'Upscale dining with global cuisine',
    reservationRequired: true,
    mobileOrder: false,
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options']
  },
  {
    id: 'pizzafari',
    name: 'Pizzafari',
    park: 'Animal Kingdom',
    location: 'Discovery Island',
    cuisine: ['Italian', 'American'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Pizza and Italian fare with animal-themed decor',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: ['Vegetarian Options']
  },
  {
    id: 'satulli-canteen',
    name: 'Satu\'li Canteen',
    park: 'Animal Kingdom',
    location: 'Pandora - The World of Avatar',
    cuisine: ['Other'],
    mealTypes: ['Lunch', 'Dinner'],
    diningPlanType: ['Quick/Counter Service'],
    priceRange: '$',
    description: 'Pandora-themed healthy bowls and cuisine',
    reservationRequired: false,
    mobileOrder: true,
    dietaryOptions: ['Plant Based Options', 'Vegetarian Options', 'Gluten Free Options']
  }
];

export const CUISINE_TYPES = [
  'African', 'American', 'Asian', 'Bakery', 'BBQ', 'Cajun', 'Coffee',
  'Festival Menu', 'French', 'Fruit', 'German', 'Ice Cream', 'Indian',
  'Irish', 'Italian', 'Japanese', 'Korean', 'Latin', 'Mediterranean',
  'Mexican', 'Omakase Tasting Menu', 'Other', 'Seafood', 'Snacks',
  'Steakhouse', 'Sushi'
];

export const MEAL_TYPES = [
  'All-Day', 'Breakfast', 'Brunch', 'Dessert', 'Dinner', 'Lunch', 'Snacks'
];

export const DINING_PLAN_TYPES = [
  '1 Credit', '2-credits', 'Table Service', 'Quick/Counter Service',
  'Character Dining', 'Signature Dining'
];

export const DIETARY_OPTIONS = [
  'Plant Based Options', 'Vegetarian Options', 'Gluten Free Options'
];

export const DINING_FEATURES = [
  'Recently Updated', 'Disney Vacation Club Discount', 'Buffet Dining',
  'Bar/Lounge', 'Snack Cart', '24 Hour Restaurants', 'Food Court',
  'Mobile Ordering', 'Annual Passholder', 'Tables in Wonderland'
]; 