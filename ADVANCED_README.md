# Disney Trip Planner - Advanced Documentation

## 🏰 Overview

Disney Trip Planner is a comprehensive, AI-powered web application designed to help users plan magical Disney World vacations. Built with modern React TypeScript, it features enterprise-grade multi-user authentication, role-based access control, account management, cloud storage, AI-powered suggestions, detailed trip management capabilities, and personalized profile management for all trip participants.

## 🔐 Authentication & User Management System

### **Multi-Tenant Architecture**
The application implements a sophisticated three-tier user management system:

1. **Accounts** - Top-level entities with billing info and trip ownership
2. **Users** - Individual users belonging to accounts with specific roles
3. **Shared Access** - Cross-account permissions for collaboration

### **Role-Based Access Control (RBAC)**
- **Super Admin**: System-wide administration (amclaughlin2005@gmail.com)
- **Account Owner**: Full account management and billing
- **Account Admin**: User management + trip editing within account
- **Account Editor**: Trip creation and editing within account
- **Account Viewer**: Read-only access to account trips

### **Super Admin Features**
- **User Impersonation**: View/edit other users' accounts safely
- **Account Management**: Create, delete, modify any account
- **User Assignment**: Assign users to accounts with role selection
- **System Monitoring**: Comprehensive admin dashboard with statistics
- **Audit Trail**: Console logging for all admin actions

## 🏗️ Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   React Frontend    │    │   API Routes        │    │   External Services │
│                     │    │                     │    │                     │
│ • Components        │◄──►│ • /api/openai       │◄──►│ • OpenAI API        │
│ • Hooks             │    │ • /api/blob         │    │ • Vercel Blob       │
│ • Services          │    │ • /api/prompts      │    │ • Clerk Auth        │
│ • Utils             │    │ • Authentication    │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🤖 AI-Powered Features with Structured Outputs

### **OpenAI Integration with Structured Outputs**
The application leverages OpenAI's latest structured outputs feature to ensure reliable, type-safe AI responses:

#### **Structured Response Types**
- **Itinerary Suggestions**: JSON schema with park recommendations, must-do attractions, dining suggestions, and tips
- **Day Plan Optimization**: Structured activity ordering with timing, priorities, and alternatives
- **Dining Recommendations**: Detailed restaurant data with cuisine, pricing, accessibility, and reservation tips
- **Attraction Suggestions**: Comprehensive ride data with thrill levels, wait strategies, and accessibility notes
- **Trip Summaries**: Structured trip overviews with highlights, budget estimates, and preparation tips

#### **Schema Validation**
All AI responses are validated against strict JSON schemas using OpenAI's `strict: true` mode:

```javascript
const schemas = {
  itinerarySuggestions: {
    type: "json_schema",
    json_schema: {
      name: "itinerary_suggestions",
      strict: true,
      schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          parkOrder: { type: "array", items: { /* ... */ } },
          mustDoAttractions: { type: "array", items: { /* ... */ } },
          // ... additional structured fields
        },
        required: ["summary", "parkOrder", "mustDoAttractions"],
        additionalProperties: false
      }
    }
  }
};
```

#### **AI Services Architecture**
- **Secure API Route**: All OpenAI calls go through `/api/openai` to protect API keys
- **Dynamic Prompt System**: Prompts stored in Vercel Blob storage with admin management
- **Fallback Handling**: Graceful degradation when AI services are unavailable
- **Type Safety**: Full TypeScript interfaces matching JSON schemas

### **AI Prompt Management System**
Super admins can manage all AI behavior through the admin panel:

#### **Prompt Categories**
- **Itinerary**: Trip planning and park recommendations
- **Optimization**: Daily schedule optimization
- **Dining**: Restaurant recommendations and reservation strategies
- **Rides**: Attraction suggestions and wait time strategies
- **Summary**: Trip summary generation and encouragement

#### **Prompt Editor Features**
- **Template Variables**: Support for dynamic content with `{{variable}}` syntax
- **Real-time Preview**: See how templates will render with sample data
- **Version Control**: Track modifications with last modified timestamps
- **Bulk Operations**: Reset individual prompts or all prompts to defaults
- **Category Organization**: Color-coded categories for easy management
- **Token Limits**: Configurable max tokens per prompt category

## 🛣️ Routing System

### **React Router Integration**
- **Main App Route** (`/`): Trip planning interface
- **Admin Panel Route** (`/admin`): Super admin dashboard
- **Protected Routes**: Role-based access control
- **Navigation**: Seamless switching between interfaces

### **Route Protection**
```typescript
// AdminRoute component ensures only super admins can access /admin
const AdminRoute = ({ children }) => {
  const { appUser, loading } = useUserManagement();
  
  if (loading) return <LoadingSpinner />;
  if (!appUser?.isSuperAdmin) return <Navigate to="/" />;
  
  return children;
};
```

## 👥 Account-Level Profile Management System

### **Account-Based Participant Profiles**
The Disney Trip Planner features a sophisticated account-level profile management system where family members are managed at the account level and can be assigned to specific trips. This enables better reusability and personalized recommendations across multiple Disney vacations.

#### **Account Profile Architecture**
**Account-Level Storage**: All family member profiles are stored at the account level, enabling reuse across multiple trips.

**Trip Assignment System**: Users can assign specific profiles to individual trips, allowing different family members to participate in different vacations.

Each AccountProfile includes:
- **Account Association**: Profiles belong to an account and can be reused across trips
- **Trip Assignment**: Profiles are assigned to specific trips via `assignedProfileIds` array
- **Name** (Required): Full name of the family member
- **Age** (Required): Age for age-appropriate recommendations and planning
- **Gender** (Optional): Male, Female, Non-binary, or Prefer not to say
- **Dietary Preferences** (Optional): Multiple selections from comprehensive list including:
  - Vegetarian, Vegan, Gluten-Free, Dairy-Free
  - Nut Allergy, Shellfish Allergy, Kosher, Halal
  - Low Sodium, Diabetic Friendly, No Spicy Food, Picky Eater
- **Ride Preferences** (Optional): Activity level preferences:
  - Thrill Seeker: Loves roller coasters and intense rides
  - Family Friendly: Prefers gentle rides suitable for all ages
  - Mild Rides Only: Prefers calm, slow-moving attractions
  - Mixed Preferences: Enjoys a variety of ride types
- **Favorite Disney Characters** (Optional): Multiple selections from 50+ popular characters
- **Favorite Rides** (Optional): Multiple selections from 40+ Disney World attractions
- **What They Love About Disney** (Optional): Free-text field for personal Disney interests

#### **Profile Management Features**
- **Account-Level Management**: All profiles managed at the account level for reusability
- **Dual Access Points**: 
  - **"Manage Profiles" Button**: Always accessible in the trip manager for standalone profile management
  - **"Profiles" Tab**: Available when viewing a specific trip for assignment interface
- **Trip Assignment Interface**: Visual assignment system to select which family members join each trip
- **Visual Profile Cards**: Age-appropriate emoji icons and color-coded information with assignment status
- **Comprehensive Form**: Modal-based creation and editing with extensive validation
- **Smart Display**: Condensed information showing key preferences and favorites
- **Easy Editing**: Hover-activated edit and delete buttons with confirmation dialogs
- **Bulk Selection**: Checkbox interfaces for multiple preferences and character selections
- **Assignment Indicators**: Clear visual indicators showing which profiles are assigned to the current trip

#### **Integration with Trip Planning**
- **Cross-Trip Reusability**: Family members can be assigned to multiple trips without data duplication
- **AI Personalization**: Assigned profile data enhances AI recommendations for specific trips
- **Dining Suggestions**: Dietary preferences of assigned participants inform restaurant recommendations
- **Ride Planning**: Age and thrill preferences of trip participants guide attraction suggestions
- **Character Meet Planning**: Favorite character data from assigned profiles helps plan character interactions
- **Group Dynamics**: Assigned profiles enable personalized family-friendly planning per trip

#### **Profile Persistence and Storage**
- **Account-Based Storage**: Profiles stored at account level with automatic sync to assigned trips
- **Cloud Storage**: Account profiles sync across devices when cloud storage is enabled
- **Local Storage**: Offline profile management with automatic saving and assignment tracking
- **Assignment Persistence**: Trip assignments are maintained independently of profile data
- **Automatic Cleanup**: Deleting a profile removes it from all assigned trips automatically
- **Data Migration**: Existing trips migrated to use `assignedProfileIds` reference system

## 📁 File Structure Deep Dive

### **Core Application (`src/`)**

#### **`App.tsx`** - Main Application Controller
- **Purpose**: Root component orchestrating the entire application with routing
- **Key Features**:
  - React Router integration with protected routes
  - Trip state management and persistence
  - User permission checking and role-based access
  - View mode switching (detailed vs agenda)
  - Modal management for various features
  - Account-aware trip loading and filtering
  - Performance optimizations (removed infinite loops)
- **Integration Points**:
  - Clerk authentication via `AuthWrapper`
  - User management via `useUserManagement` hook
  - Cloud storage via `storageService`
  - AI features via `AIAssistant` component
  - React Router for navigation

#### **`index.tsx`** - Application Entry Point
- React application bootstrapping with Router
- Root DOM rendering setup
- CSS imports and global styling initialization

#### **`index.css`** - Global Styling
- Tailwind CSS configuration
- Custom Disney-themed color variables
- Global component styling overrides
- Responsive design utilities

### **Components (`src/components/`)**

#### **Authentication & User Management**

##### **`AuthWrapper.tsx`** - Authentication Shell
- **Purpose**: Provides Clerk authentication context to the entire app
- **Features**:
  - Handles sign-in/sign-out flow with ClerkProvider
  - Displays loading states during authentication
  - Shows Disney-themed landing page for unauthenticated users
  - Provides consistent header with user controls
  - Responsive design with mobile optimization
- **Integration**: Wraps entire app with `ClerkProvider`
- **UI Components**: Header with Disney branding, user profile button, landing page

##### **`AccountSetup.tsx`** - Account Creation Flow
- **Purpose**: Guides new users through account setup process
- **Features**:
  - Account name collection with validation
  - Role assignment (owner by default for new accounts)
  - Integration with user management system
  - Form validation and error handling
- **Data Flow**: Creates `UserAccount` and updates `AppUser` records
- **UX**: Step-by-step onboarding with clear instructions

##### **`AdminPanel.tsx`** - Super Admin Interface
- **Purpose**: Comprehensive system administration dashboard
- **Access Control**: Only available to super admins via protected route
- **Features**:
  - **User Management**: View, edit, delete users with role assignments
  - **Account Management**: Create, delete, modify accounts with user assignment
  - **User Assignment**: Modal-based workflow for assigning users to accounts
  - **Impersonation System**: Safe user/account impersonation with visual indicators
  - **System Statistics**: Real-time user counts and activity monitoring
  - **Navigation**: "Back to Trip Planner" button with React Router
- **Tabs**:
  - Users: Complete user management with assignment controls
  - Accounts: Account CRUD operations with user lists
  - Impersonation: Active impersonation status and controls
  - **AI Prompts**: Comprehensive AI prompt management system
- **Security**: Cannot impersonate other super admins, audit logging

#### **Profile Management**

##### **`ProfileManager.tsx`** - Participant Profile Management
- **Purpose**: Comprehensive management of trip participant profiles with detailed personalization options
- **Key Features**:
  - **Profile Creation**: Modal-based form with required fields (name, age) and extensive optional fields
  - **Profile Display**: Visual grid layout with age-appropriate emoji icons and color-coded information
  - **Smart Editing**: Hover-activated edit and delete buttons with confirmation dialogs
  - **Comprehensive Forms**: Multi-section form with checkboxes for bulk selection of preferences
  - **Data Validation**: Form validation ensuring required fields and reasonable age ranges (0-120)
  - **Responsive Design**: Adaptive layout for mobile, tablet, and desktop viewing
- **Profile Categories**:
  - Basic Information: Name, age, gender with inclusive options
  - Dietary Needs: 13 dietary preference options with multiple selection capability
  - Activity Preferences: Ride intensity preferences with detailed descriptions
  - Disney Favorites: 50+ character options and 40+ ride selections
  - Personal Notes: Free-text field for individual Disney interests and motivations
- **Visual Elements**:
  - Age-appropriate emoji icons (👶🧒👦👤👴) based on age ranges
  - Color-coded preference badges (thrill-seeker: red, family-friendly: green, etc.)
  - Condensed information display showing key details without overwhelming
  - Empty state with encouraging call-to-action for first profile addition
- **Integration**: Seamlessly integrates with trip storage, AI recommendations, and account management
- **Accessibility**: Full keyboard navigation, screen reader support, and ARIA labels

#### **Trip Management Core**

##### **`TripManager.tsx`** - Trip CRUD Operations
- **Purpose**: Central hub for all trip-related operations with account awareness
- **Key Features**:
  - **Trip Tiles Display**: Automatic display of saved trips as interactive tiles on the main page
  - **Enhanced User Experience**: Users can see all their trips immediately without clicking "Load Trip"
  - **Profile Management Access**: Dedicated "Manage Profiles" button for account-level family profile management
  - Account-scoped trip loading and filtering
  - Trip creation with form validation and account assignment
  - Import/export functionality (JSON format)
  - Cloud storage integration with status indicators
  - Real-time storage status indicators
  - Permission-based trip operations
  - Admin Panel access button for super admins
- **Trip Tiles Features**:
  - **Visual Trip Cards**: Beautiful card-based layout with trip details, dates, and resort information
  - **Active Trip Indication**: Clear visual indicator for currently selected trip
  - **Quick Actions**: Hover-activated delete button on each trip tile
  - **Trip Statistics**: Shows trip duration and planned days at a glance
  - **Responsive Grid**: Adapts to screen size (1-3 columns based on device)
  - **Empty State**: Encouraging call-to-action when no trips exist
- **Data Storage**: Supports both cloud (Vercel Blob) and local storage
- **User Experience**: Responsive design with mobile-optimized forms and improved trip discovery
- **Security**: Only shows trips user has permission to access

##### **`TripDayCard.tsx`** - Individual Day Management
- **Purpose**: Manages activities for a single trip day with enhanced features
- **Sections**:
  - **Transportation**: Bus, monorail, walking, rideshare options with timing
  - **Rides**: Attractions with priority levels, FastPass/Genie+ tracking
  - **Reservations**: Dining, hotel, spa, tour bookings with confirmation numbers
  - **Food**: Quick service, table service, character dining plans with budgets
- **Features**:
  - Drag-and-drop reordering within sections
  - Color-coded categories for easy identification
  - Time slot management with conflict detection
  - Notes and special requirements tracking
  - Edit/delete functionality with confirmation
- **Performance**: Optimized rendering for large trip days

##### **`AddDayModal.tsx`** - Day Creation Interface
- **Purpose**: Creates new trip days with comprehensive park selection
- **Features**:
  - Date picker with existing date validation
  - Park selection from comprehensive Disney World list
  - Conflict prevention (no duplicate dates)
  - Form validation with error messaging
- **Integration**: Updates parent trip state immediately with persistence
- **Parks Supported**: Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom

#### **Activity Management**

##### **`AddEventModal.tsx`** - Activity Creation
- **Purpose**: Universal modal for adding activities to trip days
- **Supported Types**:
  - Rides/Attractions with thrill levels and accessibility requirements
  - Dining reservations with party size and dietary preferences
  - Transportation with departure/arrival times and route options
  - General reservations with confirmation numbers and special requests
- **Features**:
  - Dynamic form fields based on activity type
  - Validation for required fields
  - Time conflict detection
  - Integration with attractions and dining databases

##### **`RidesSection.tsx`** - Attraction Management
- **Purpose**: Manages ride and attraction planning with comprehensive data
- **Features**:
  - Priority levels (must-do, want-to-do, if-time, skip)
  - FastPass/Genie+ Lightning Lane tracking
  - Height requirements and accessibility information
  - Duration estimates and wait time considerations
  - Thrill level indicators and age recommendations
- **Data Source**: Comprehensive attractions database with real Disney data
- **Integration**: Links with park schedules and crowd calendars

##### **`FoodSection.tsx`** - Dining Planning
- **Purpose**: Manages all dining experiences with detailed tracking
- **Categories**:
  - Quick Service vs Table Service distinction
  - Character dining experiences with character lists
  - Snacks and beverages with location tracking
  - Special dietary accommodations and allergy information
- **Features**:
  - Budget tracking per meal with running totals
  - Reservation number storage and confirmation
  - Party size management with special seating requests
  - Integration with Disney Dining Plan calculations

##### **`ReservationsSection.tsx`** - Booking Management
- **Purpose**: Tracks all types of reservations with comprehensive details
- **Types**: Dining, hotel, spa, tours, special experiences, transportation
- **Features**:
  - Confirmation number tracking with validation
  - Date/time management with timezone awareness
  - Party size and special requests documentation
  - Integration with dining section for cross-referencing
  - Reminder system for important reservations

##### **`TransportationSection.tsx`** - Travel Planning
- **Purpose**: Manages getting around Disney World efficiently
- **Options**:
  - Disney transportation (bus, monorail, boat, skyliner)
  - Personal vehicles and parking recommendations
  - Rideshare services (Uber, Lyft) with cost estimates
  - Walking routes and timing with accessibility considerations
- **Features**:
  - Departure and arrival time tracking
  - Route optimization suggestions
  - Real-time transportation status integration
  - Cost tracking and budget management

#### **Viewing & Display**

##### **`AgendaView.tsx`** - Timeline Display
- **Purpose**: Provides chronological view of all trip activities
- **Features**:
  - Day-by-day timeline layout with time slots
  - Time-sorted activity display with conflict highlighting
  - Quick overview of entire trip with statistics
  - Print-friendly formatting for physical itineraries
  - Export functionality for sharing with family
- **Use Cases**: Final itinerary review, sharing with travel party, daily reference

##### **`Header.tsx`** - Navigation Component
- **Purpose**: Consistent navigation across the application with user context
- **Features**:
  - User status display with account information
  - Quick action buttons for common tasks
  - Responsive mobile menu with hamburger navigation
  - Context-aware content based on user role
  - Impersonation status indicator (orange banner)
  - Disney-themed branding with crown icon

#### **AI Integration**

##### **`AIAssistant.tsx`** - AI-Powered Planning
- **Purpose**: Provides intelligent trip planning assistance via OpenAI with customizable prompts
- **AI Features**:
  - **Itinerary Suggestions**: Personalized recommendations based on group preferences
  - **Day Optimization**: Reorders activities to minimize wait times and maximize efficiency
  - **Dining Recommendations**: Suggests restaurants based on preferences, budget, and dietary needs
  - **Ride Suggestions**: Recommends attractions based on thrill level, age, and interests
  - **Trip Summary**: Generates encouraging overview of planned vacation with tips
  - **AI Trip Import**: Revolutionary feature that converts uploaded itineraries into structured trip plans
- **Customization Options**:
  - Group size and age considerations
  - Budget constraints (low/medium/high)
  - Mobility requirements and accessibility needs
  - Thrill level preferences (mild to extreme)
  - Dietary restrictions and allergies
- **Integration**: Secure API calls to OpenAI via server-side proxy using o3-mini model
- **Security**: API key protection, rate limiting, content filtering

##### **AI Trip Import System** - Automated Itinerary Conversion
- **Purpose**: Converts user-uploaded itinerary files into structured Disney trip plans using OpenAI
- **Supported Formats**: Text files (.txt), Word documents (.docx) - uses mammoth.js for text extraction
- **File Size Limit**: 10MB maximum for optimal processing
- **AI Processing Features**:
  - **Intelligent Parsing**: Extracts trip names, dates, resort information, and daily activities
  - **Disney Park Recognition**: Identifies Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom, Disney Springs
  - **Activity Classification**: Categorizes rides, shows, dining, transportation with appropriate types
  - **Smart Defaults**: Fills missing information with Disney-appropriate assumptions
  - **Priority Assignment**: Assigns realistic priority levels (must-do, want-to-do, if-time)
  - **Duration Estimation**: Sets reasonable time estimates for all activities
  - **Structured Output**: Returns complete JSON matching our trip schema
- **Technical Implementation**:
  - **Frontend Service**: File reading and AI communication via `openai.ts`
  - **Backend Processing**: Dedicated API endpoint `/api/openai` with `import` type
  - **Schema Validation**: Strict JSON schema ensures data integrity
  - **Error Handling**: Comprehensive error handling with user-friendly messages
  - **Progress Indication**: Real-time loading states and progress feedback
- **User Experience**:
  - **Drag & Drop**: Simple file upload with visual feedback
  - **Processing Status**: Clear indication of AI processing with animated loader
  - **Success Confirmation**: Immediate trip creation and selection after import
  - **Error Recovery**: Graceful error handling with detailed error messages
- **Data Conversion**:
  - **Resort Matching**: Intelligent matching of resort names to Disney properties
  - **Park Assignment**: Automatic park selection based on mentioned attractions
  - **Color Coding**: Applies consistent color schemes for all activity categories
  - **ID Generation**: Creates unique identifiers for all trip components
  - **Account Integration**: Properly assigns imported trips to user accounts

##### **AI Prompt Management System** - Custom AI Behavior Control
- **Purpose**: Comprehensive system for customizing AI responses through the admin panel
- **Access**: Super Admin only feature accessible through Admin Panel → AI Prompts tab
- **Prompt Categories**:
  - **Itinerary**: Controls how AI generates full trip itineraries
  - **Optimization**: Manages AI day optimization recommendations
  - **Dining**: Customizes restaurant and meal suggestions
  - **Rides**: Controls attraction and ride recommendations
  - **Summary**: Manages trip summary generation and encouragement
- **Features**:
  - **Full Prompt Editor**: Rich text editor for system messages and user prompt templates
  - **Template Variables**: Support for dynamic content insertion ({{variable}} syntax)
  - **Category Organization**: Color-coded categories for easy identification
  - **Token Limit Management**: Configurable token limits per prompt type
  - **Reset Functionality**: Individual prompt reset or bulk reset to defaults
  - **Last Modified Tracking**: Audit trail for prompt changes
  - **Real-time Preview**: System message preview with truncation for long prompts
- **Storage Architecture**:
  - **Vercel Blob Storage**: Cloud-based prompt storage with timestamped files
  - **Automatic Cleanup**: Old prompt files are automatically removed
  - **Fallback System**: Graceful fallback to default prompts if custom prompts fail
  - **File Priority**: Prefers timestamped files over legacy files for better versioning
- **Technical Implementation**:
  - **Frontend Service**: Async prompt retrieval with caching
  - **Backend Integration**: Custom prompts seamlessly integrated into OpenAI calls
  - **Template Processing**: Server-side variable replacement in prompt templates
  - **Error Handling**: Comprehensive error handling with debugging capabilities
  - **Development Testing**: Built-in test endpoints for prompt verification

##### **`TestPrompts.tsx`** - AI Prompt Testing Interface
- **Purpose**: Development component for testing custom AI prompts
- **Features**:
  - Direct prompt testing without UI interaction
  - Real-time debugging of prompt retrieval and usage
  - Verification of custom prompt markers in AI responses
  - Comprehensive logging for troubleshooting
- **Usage**: Temporary component for development and debugging purposes

### **Hooks (`src/hooks/`)**

#### **`useUserManagement.ts`** - User Management Hook
- **Purpose**: Comprehensive user and account management with permissions
- **Key Functions**:
  - `initializeUser()`: User setup and account association
  - `createAccount()`: New account creation with ownership assignment
  - `assignUserToAccount()`: User-account relationship management
  - `getAllUsers()`, `getAllAccounts()`: Administrative data retrieval
  - `startImpersonation()`, `stopImpersonation()`: Safe user impersonation
  - `hasPermission()`: Real-time permission checking
  - `getEffectiveUser()`: Current user context (original or impersonated)
- **Impersonation System**:
  - Safe context switching for super admins
  - Maintains original user context for security
  - Visual indicators and audit logging
  - Cannot impersonate other super admins
- **Permission System**:
  - Role-based access control
  - Account-scoped permissions
  - Real-time permission validation

### **Data Layer (`src/data/`)**

#### **`attractions.ts`** - Disney Attractions Database
- **Purpose**: Comprehensive database of Disney World attractions
- **Data Structure**:
  - Attraction names, locations, and descriptions
  - Height requirements and accessibility information
  - Thrill levels and age recommendations
  - FastPass/Genie+ availability
  - Historical wait times and crowd data
- **Integration**: Used by ride planning and AI recommendation systems

#### **`dining.ts`** - Disney Dining Database
- **Purpose**: Complete database of Disney World dining locations
- **Data Structure**:
  - Restaurant names, locations, and cuisine types
  - Service types (quick service, table service, character dining)
  - Price ranges and Disney Dining Plan acceptance
  - Dietary accommodation information
  - Reservation requirements and booking windows
- **Integration**: Powers dining recommendations and reservation planning

### **Services (`src/services/`)**

#### **`openai.ts`** - AI Service Integration
- **Purpose**: Secure integration with OpenAI API for trip planning assistance with custom prompt support
- **Features**:
  - Environment-aware API endpoint selection (development vs production)
  - Custom prompt retrieval and integration
  - Dynamic prompt engineering for Disney-specific recommendations
  - Response parsing and formatting with custom prompt markers
  - Error handling and fallback responses
  - Rate limiting and cost management
  - Comprehensive debugging and logging capabilities
- **Custom Prompt Integration**:
  - Async prompt retrieval from Vercel Blob storage
  - Fallback to default prompts when custom prompts unavailable
  - Template variable replacement for dynamic content
  - Category-based prompt selection (itinerary, dining, rides, etc.)
- **Development**: Uses `http://localhost:3001/api/openai` in development mode
- **Production**: Uses `/api/openai` for Vercel serverless functions
- **Security**: API key protection via environment variables and server-side proxy

### **Utils (`src/utils/`)**

#### **`tripStorage.ts`** - Enhanced Trip Storage
- **Purpose**: Account-aware trip storage with comprehensive CRUD operations
- **Key Functions**:
  - `getTripsByAccount()`: Account-scoped trip retrieval
  - `getTripsForUser()`: User permission-based trip access
  - `createTrip()`: Trip creation with account assignment and permissions
  - `updateTrip()`: Permission-validated trip updates
  - `deleteTrip()`: Secure trip deletion with ownership verification
- **Features**:
  - Account-based data isolation
  - Permission validation for all operations
  - Cloud and local storage support
  - Data migration and backup utilities

#### **`cloudStorage.ts`** - Cloud Storage Integration
- **Purpose**: Vercel Blob integration for cross-device synchronization
- **Features**:
  - Automatic cloud backup of trip data
  - Cross-device synchronization
  - Conflict resolution for concurrent edits
  - Offline support with sync on reconnection
- **Security**: User-scoped data access, encryption in transit

#### **`dateUtils.ts`** - Date Management Utilities
- **Purpose**: Comprehensive date handling for trip planning
- **Features**:
  - Disney World timezone handling
  - Park hours and special event integration
  - Date validation and conflict detection
  - Calendar integration utilities

### **Types (`src/types/`)**

#### **`index.ts`** - Type Definitions
- **Purpose**: Comprehensive TypeScript type definitions for the entire application
- **Key Types**:
  - `UserAccount`: Account entity with billing, ownership, and embedded profiles array
  - `AccountProfile`: Account-level profile data structure for family members
  - `AppUser`: Application user with roles and permissions
  - `AccountUser`: User-account relationship with role assignments
  - `Trip`: Enhanced trip entity with `assignedProfileIds` reference array
  - `TripDay`: Day planning with activities and scheduling
  - `Permission`: Role-based permission system
- **Profile Architecture Types**:
  - `AccountProfile`: Comprehensive family member data with account association
  - Profile reference system using ID arrays instead of embedded objects
  - Trip assignment tracking via `assignedProfileIds`
- **Enhanced Features**:
  - Account-scoped profile management
  - Trip assignment system types
  - Invitation tracking with status management
  - Impersonation context types
  - Cross-trip profile reusability support

## 🔧 Performance Optimizations

### **State Management**
- **Eliminated Infinite Loops**: Removed problematic useEffect dependencies
- **Optimized Re-renders**: Memoized expensive computations
- **Efficient Updates**: Direct action handlers instead of reactive effects
- **Memory Management**: Proper cleanup of event listeners and timers

### **Data Loading**
- **Lazy Loading**: Components load only when needed
- **Caching Strategy**: Intelligent caching of user and account data
- **Parallel Requests**: Simultaneous data fetching where possible
- **Error Boundaries**: Graceful error handling without app crashes

## 🔧 Backend API Architecture

### **API Routes (`api/`)**

#### **`openai.js`** - OpenAI API Integration
- **Purpose**: Server-side proxy for secure OpenAI API access with custom prompt support
- **Endpoints**: 
  - `POST /api/openai` - Main AI generation endpoint
  - `GET /api/test-frontend` - Development testing endpoint
- **Features**:
  - Custom prompt integration from Vercel Blob storage
  - Template variable replacement ({{variable}} syntax)
  - Comprehensive debugging and logging
  - Fallback to default prompts when custom prompts unavailable
  - Request validation and error handling
- **Custom Prompt Flow**:
  1. Receives request with prompt category
  2. Retrieves custom prompts from blob storage
  3. Replaces template variables with request data
  4. Sends customized prompt to OpenAI
  5. Returns AI response with debug information

#### **`prompts.js`** - AI Prompt Management API
- **Purpose**: Complete CRUD operations for AI prompt management
- **Endpoints**:
  - `GET /api/prompts` - Retrieve all custom prompts
  - `POST /api/prompts` - Save/update custom prompts
- **Storage Architecture**:
  - **Timestamped Files**: Uses `prompts-{timestamp}.json` format for versioning
  - **Automatic Cleanup**: Removes old prompt files, keeps only latest
  - **File Priority Logic**: Prefers timestamped files over legacy `prompts.json`
  - **Fallback System**: Initializes default prompts if none exist
- **Features**:
  - Comprehensive error handling and debugging
  - Vercel Blob integration with overwrite protection
  - Default prompt initialization and management
  - File listing and cleanup utilities

#### **`blob.js`** - Cloud Storage Management
- **Purpose**: Vercel Blob storage integration for trip data
- **Features**: File upload, download, and management for trip persistence

#### **`test.js`** - Development Testing Utilities
- **Purpose**: Testing endpoints for development and debugging

### **`server.js`** - Development Server
- **Purpose**: Local development API server with environment variable support
- **Features**:
  - **Environment Loading**: Proper `.env` file loading with `dotenv`
  - **CORS Configuration**: Cross-origin request handling for React frontend
  - **Route Management**: Express.js routing for all API endpoints
  - **Development Testing**: Built-in test endpoints for prompt verification
  - **Error Handling**: Comprehensive error logging and debugging
- **Environment Variables**:
  - `OPENAI_API_KEY`: OpenAI API authentication
  - `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage access
- **Port Configuration**: Runs on port 3001 for development

## 🚀 Deployment & Production

### **Environment Configuration**
- **Clerk Authentication**: `REACT_APP_CLERK_PUBLISHABLE_KEY`
- **OpenAI Integration**: `OPENAI_API_KEY` (server-side only)
- **Vercel Blob Storage**: `BLOB_READ_WRITE_TOKEN` (server-side only)
- **Super Admin Email**: Configured in code for security
- **Environment File Format**: Single-line variables (no multi-line values)

### **Development Setup**
- **Local Development**: Requires separate API server (`npm run dev`)
- **API Endpoints**: Development server runs on port 3001
- **Environment Detection**: Automatic API endpoint selection based on `NODE_ENV`
- **Dependencies**: Express, CORS, dotenv, and Concurrently for development server
- **Environment Loading**: Automatic `.env` file loading in development server

### **CI/CD Pipeline**
- **GitHub Integration**: Automatic deployment on push
- **Vercel Platform**: Serverless deployment with edge functions
- **Build Optimization**: Production builds with code splitting
- **Performance Monitoring**: Built-in analytics and error tracking

### **Security Measures**
- **API Key Protection**: Server-side proxy for external services
- **User Authentication**: Clerk enterprise-grade security
- **Data Isolation**: Account-scoped data access
- **Audit Logging**: Administrative action tracking
- **Role Validation**: Server-side permission checks

## 🐛 Bug Fixes & Improvements

### **Critical Fixes**
1. **Admin Access Issue**: Added "Access Admin Panel" button for super admins without accounts
2. **AdminRoute Loading**: Fixed premature redirects during user data loading
3. **Account Assignment**: Enabled super admin self-assignment to accounts
4. **Infinite Loop**: Eliminated circular dependencies in trip saving
5. **Performance Issues**: Optimized state management and re-rendering
6. **OpenAI API Integration**: Fixed 404 errors in local development by creating separate development server
7. **OpenAI Model Update**: Upgraded from GPT-3.5-turbo to o3-mini for improved AI assistance

### **AI Prompt Management System Fixes**
8. **Environment Variable Issues**: Fixed `.env` file formatting and variable naming
   - Corrected `REACT_APP_BLOB_READ_WRITE_TOKEN` → `BLOB_READ_WRITE_TOKEN`
   - Corrected `REACT_APP_OPENAI_API_KEY` → `OPENAI_API_KEY`
   - Fixed multi-line environment variable formatting
9. **Server Startup Failures**: Added proper environment variable loading with `dotenv` package
10. **Blob Storage Overwrite Errors**: Implemented timestamped filename system to avoid "blob already exists" errors
11. **File Priority Logic**: Fixed prompt retrieval to prefer timestamped files over legacy files
12. **Custom Prompt Integration**: Resolved issues where admin panel changes weren't reflected in AI responses
13. **Template Variable Processing**: Added proper variable replacement in prompt templates
14. **Error Handling**: Enhanced debugging and error handling throughout the prompt system

### **UX Improvements**
- **Visual Indicators**: Clear impersonation status with orange banners
- **Navigation**: Seamless routing between main app and admin panel
- **Loading States**: Comprehensive loading indicators throughout app
- **Error Handling**: User-friendly error messages and recovery options
- **Mobile Optimization**: Responsive design for all screen sizes

## 🔮 Future Enhancements

### **Planned Features**
- **Email Integration**: Real invitation system with email notifications
- **Advanced Permissions**: Granular permission system for specific features
- **Audit Dashboard**: Comprehensive activity logging and reporting
- **Multi-Language**: Internationalization for global users
- **Mobile App**: React Native version for iOS and Android

### **Technical Improvements**
- **Database Migration**: Move from local storage to proper database
- **Real-time Sync**: WebSocket integration for live collaboration
- **Advanced AI**: More sophisticated trip optimization algorithms
- **Performance**: Further optimizations for large datasets
- **Testing**: Comprehensive test suite for all components

## 📊 System Statistics

### **Current Capabilities**
- **Multi-Tenant**: Unlimited accounts with user assignments
- **Role-Based Access**: 5 distinct permission levels
- **Trip Management**: Comprehensive planning with 4 activity types
- **AI Integration**: 5 different AI assistance features
- **Data Storage**: Dual storage system (local + cloud)
- **Authentication**: Enterprise-grade security with Clerk

### **Performance Metrics**
- **Load Time**: < 2 seconds for initial app load
- **Route Switching**: < 100ms between main app and admin panel
- **Data Sync**: Real-time updates across all components
- **Mobile Performance**: Optimized for devices with limited resources

## 🔧 **Troubleshooting**

### **AI Trip Import Issues**

The AI Trip Import feature has been enhanced with robust error handling and fallback mechanisms. If you encounter issues:

#### **"Failed to process trip import" - Empty Response**
- **Cause**: OpenAI returned an empty response, possibly due to content filtering or processing limitations
- **Solution**: The system now automatically falls back to a secondary processing method
- **What to check**: 
  - Ensure your file contains readable text content
  - Check for unusual characters or formatting issues
  - Try breaking very long itineraries into smaller files

#### **"JSON parsing failed" Error**
- **Cause**: AI response was malformed or incomplete
- **Solution**: The system now preprocesses your content to handle encoding issues
- **What it fixes automatically**:
  - Converts carriage returns (`\r`) to standard newlines
  - Replaces problematic Unicode characters (smart quotes, special dashes)
  - Removes binary data indicators
  - Normalizes excessive whitespace

#### **File Format Support**
- **✅ Supported**: `.txt` (plain text), `.docx` (Word documents)
- **❌ Not supported**: `.doc` (older Word format), `.pdf` files (due to browser compatibility constraints)
- **Recommendations**:
  - Save Word documents as `.docx` format
  - Convert PDFs to text before uploading
  - Use UTF-8 encoding for text files

#### **Content Guidelines**
For best results, ensure your itinerary includes:
- **Trip name** (clear title)
- **Dates** (start and end dates in MM/DD/YYYY or similar format)
- **Resort information** (if staying on property)
- **Daily activities** organized by day
- **Park names** (Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom)

#### **Size Limits**
- **File upload**: 10MB maximum
- **Content processing**: 100KB maximum (after text extraction)
- **Recommendation**: Break large itineraries into multiple smaller files

#### **Browser Console Debugging**
If issues persist, check browser console (F12 → Console) for detailed logs:
- Look for emoji-prefixed messages (🎯, 📁, 📤, etc.)
- Note any specific error messages
- Check network requests for failed API calls

---

**This advanced documentation reflects the current state of the Disney Trip Planner as a comprehensive, enterprise-ready application with sophisticated user management, authentication, and trip planning capabilities.** 