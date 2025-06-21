# Disney Trip Planner 🏰✨

A comprehensive web application for planning your magical Disney vacation! This app helps you organize every aspect of your Disney trip, from transportation and park visits to rides, reservations, and dining plans.

## Features

### 🗓️ Trip Day Management
- Add multiple days to your trip
- Select which Disney parks you'll visit each day
- Color-coded park selection with icons

### 🚗 Transportation Planning
- Plan transportation between locations
- Support for Disney buses, monorail, boats, walking, Uber, Lyft, and rental cars
- Track departure and arrival times
- Add notes for special instructions

### 🎢 Rides & Attractions
- Add rides and attractions with priority levels (Must Do, Want to Do, If Time, Skip)
- Track ride types: attractions, shows, character meets, parades, fireworks
- Set time slots and duration estimates
- Mark FastPass and Genie+ selections
- Add notes and special instructions

### 📅 Reservations
- Manage dining, hotel, spa, tour, and other reservations
- Track confirmation numbers
- Set party sizes and times
- Add location and date information

### 🍽️ Food & Dining
- Plan quick service, table service, snacks, drinks, and desserts
- Set budgets for each dining experience
- Track locations and times
- Add notes about dietary preferences or special requests

### 🎨 Color-Coded Organization
- Each category has its own color scheme for easy identification
- Transportation: Blue
- Rides: Green
- Reservations: Purple
- Food: Orange

### 💾 Data Management
- **Local Storage**: Automatic saving to your device
- **Cloud Storage**: Optional Firebase integration for cross-device sync
- **Export/Import**: Save trip data as JSON files
- **No Account Required**: Works offline with local storage
- **Cross-Device Sync**: Available with Firebase setup (see `firebase-setup.md`)

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Start planning your Disney adventure!

### Building for Production

To create a production build:
```bash
npm run build
```

## Deployment

This app is set up with automatic deployment via GitHub and Netlify.

### 🚀 Deploying Updates

When you make changes to the app, follow these simple steps to deploy:

1. **Stage your changes:**
   ```bash
   git add .
   ```

2. **Commit with a descriptive message:**
   ```bash
   git commit -m "Description of your changes"
   ```

3. **Push to GitHub:**
   ```bash
   git push
   ```

4. **Automatic deployment:** Netlify will automatically detect the push and deploy your changes (usually takes 2-3 minutes)

### 📋 Example Deployment Workflow

```bash
# After making changes to your code
git add .
git commit -m "Added new Disney park selection feature"
git push

# Netlify will automatically:
# 1. Detect the GitHub push
# 2. Run npm install
# 3. Run npm run build  
# 4. Deploy to your live site
```

### 🔗 Repository & Deployment Links

- **GitHub Repository**: https://github.com/amclaughlin2005/disney-trip-planner
- **Live Site**: Your Netlify URL (check your Netlify dashboard)

### 🛠️ Common Deployment Commands

```bash
# Quick update
git add . && git commit -m "Quick fixes" && git push

# Feature update
git add . && git commit -m "Added cloud storage support" && git push

# Bug fix
git add . && git commit -m "Fixed date parsing issues" && git push

# Check current status
git status

# View commit history
git log --oneline

# Check remote repository
git remote -v
```

### 📊 Monitoring Deployments

- **Netlify Dashboard**: Monitor build status and deployment logs
- **GitHub**: View commit history and repository activity
- **Build Time**: Typically 2-3 minutes for full deployment
- **Build Status**: Check for any errors in Netlify deploy logs

## How to Use

### Adding Trip Days
1. Click "Add Day" to create a new trip day
2. Select the date and optionally choose a park
3. The day will be added to your trip timeline

### Planning Transportation
1. Expand the Transportation section on any day
2. Click "Add Transportation"
3. Select the type of transportation
4. Enter departure and arrival locations and times
5. Add any notes or special instructions

### Adding Rides
1. Expand the Rides & Attractions section
2. Click "Add Ride"
3. Enter the ride name, park, and type
4. Set your priority level
5. Optionally set a time slot and duration
6. Mark if you have FastPass or Genie+ access

### Making Reservations
1. Expand the Reservations section
2. Click "Add Reservation"
3. Select the reservation type
4. Enter location, date, time, and party size
5. Add confirmation number if available

### Planning Food
1. Expand the Food & Dining section
2. Click "Add Food"
3. Select the food type
4. Enter location, time, and budget
5. Add any dietary notes or preferences

### Managing Your Trip
- Use the summary cards at the top to see trip statistics
- Export your trip data to save it elsewhere
- Import previous trips to continue planning
- Edit or delete any items by clicking the edit/delete buttons

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: Local Storage + Optional Firebase Firestore
- **Deployment**: GitHub + Netlify (automatic CI/CD)
- **Build Tool**: Create React App

## Browser Support

This app works best in modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Local Storage API

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the Disney Trip Planner!

## License

This project is open source and available under the MIT License.

---

**Happy Planning! May your Disney vacation be as magical as you dream! ✨🏰** 