# Dynamic Tournament Cards Implementation

## Overview

The tournament page now features fully dynamic tournament cards that automatically adapt to real data from the backend API, with fallback to demo data for development and testing purposes.

## Features

### 🎯 **Dynamic Data Integration**

- **Real-time API Integration**: Fetches tournament data from `/api/tournaments` endpoint
- **Automatic Fallback**: Uses demo data when API is unavailable
- **Data Transformation**: Automatically maps backend data to frontend interface

### 🎨 **Dynamic Visual Elements**

- **Game-Specific Backgrounds**: Different gradient backgrounds based on game type
- **Dynamic Icons**: Game-specific SVG icons (MLBB, Valorant, CS:GO)
- **Status-Based Styling**: Colors and button text change based on tournament status
- **Responsive Design**: Cards adapt to different screen sizes

### 🔍 **Smart Filtering & Search**

- **Game Filter**: Filter tournaments by specific games
- **Status Filter**: Filter by tournament status (registration_open, upcoming, ongoing, etc.)
- **Search Functionality**: Search tournaments by name, description, or organizer
- **Real-time Results**: Shows count of filtered tournaments

### 📊 **Dynamic Content Display**

- **Participant Progress**: Visual progress bar showing registration status
- **Status Indicators**: Color-coded badges for different tournament states
- **Dynamic Buttons**: Button text and colors change based on tournament status
- **Responsive Layout**: Cards automatically adjust to content length

## Components

### TournamentCard Component

Located at: `src/components/TournamentCard.tsx`

**Key Features:**

- Accepts tournament data as props
- Automatically handles missing data with fallbacks
- Responsive design with hover effects
- Status-based styling and button text

**Props:**

```typescript
interface TournamentCardProps {
  tournament: Tournament;
  index: number; // For staggered animations
}
```

### Tournaments Page

Located at: `src/app/tournaments/page.tsx`

**Key Features:**

- Fetches data from backend API
- Implements filtering and search
- Handles loading and error states
- Falls back to demo data when needed

## Data Structure

### Tournament Interface

```typescript
interface Tournament {
  _id: string;
  name: string;
  game: string;
  description: string;
  organizer: {
    _id: string;
    name: string;
    logo?: string;
    isVerified?: boolean;
  };
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  prizePool: number;
  currency: string;
  maxParticipants: number;
  currentParticipants: number;
  format: string;
  entryFee: number;
  location: string;
  status:
    | "upcoming"
    | "registration_open"
    | "registration_closed"
    | "ongoing"
    | "completed";
  requirements: string[];
  rules: string[];
  createdAt: string;
  updatedAt: string;
}
```

## Game-Specific Features

### Mobile Legends: Bang Bang

- **Background**: Blue to purple gradient
- **Icon**: Custom MLBB SVG icon
- **Default Game**: Set as primary game type

### Valorant

- **Background**: Red to orange gradient
- **Icon**: Custom Valorant SVG icon
- **Team Format**: 5v5 team-based

### CS:GO

- **Background**: Yellow to orange gradient
- **Icon**: Custom CS:GO SVG icon
- **Team Format**: 5v5 team-based

## Status-Based Features

### Registration Open

- **Button**: "Бүртгүүлэх" (Register)
- **Color**: Green to blue gradient
- **Action**: Links to registration page

### Upcoming

- **Button**: "Дэлгэрэнгүй үзэх" (View Details)
- **Color**: Blue to purple gradient
- **Action**: Links to tournament details

### Ongoing

- **Button**: "Тэмцээний мэдээ" (Tournament News)
- **Color**: Purple to pink gradient
- **Action**: Links to live updates

### Completed

- **Button**: "Үр дүнг харах" (View Results)
- **Color**: Gray
- **Action**: Links to results page

## Demo Data

Located at: `src/data/demoTournaments.ts`

**Purpose:**

- Development and testing
- Fallback when API is unavailable
- Example of expected data structure

**Features:**

- 6 sample tournaments
- Multiple game types
- Various statuses and formats
- Realistic Mongolian content

## Usage

### Basic Implementation

```tsx
import TournamentCard from "../components/TournamentCard";

// In your component
{
  tournaments.map((tournament, index) => (
    <TournamentCard
      key={tournament._id}
      tournament={tournament}
      index={index}
    />
  ));
}
```

### With Filtering

```tsx
const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(
  []
);

// Filter logic
useEffect(() => {
  let filtered = tournaments;
  if (selectedGame !== "all") {
    filtered = filtered.filter((t) => t.game === selectedGame);
  }
  setFilteredTournaments(filtered);
}, [tournaments, selectedGame]);
```

## Customization

### Adding New Games

1. Create new SVG icon in `public/images/game-icons/`
2. Update `getGameIcon()` function in TournamentCard
3. Add game-specific background in `getGameBackground()`

### Modifying Card Layout

1. Edit TournamentCard component
2. Adjust CSS classes and Tailwind utilities
3. Update responsive breakpoints as needed

### Adding New Status Types

1. Update Tournament interface status union type
2. Add new case in `getStatusColor()` and `getStatusText()`
3. Update button logic in action button section

## Performance Features

- **Staggered Animations**: Cards animate in sequence using Framer Motion
- **Lazy Loading**: Images load only when needed
- **Optimized Rendering**: Efficient re-renders with proper state management
- **Responsive Images**: Next.js Image component with optimization

## Browser Support

- **Modern Browsers**: Full support for all features
- **CSS Grid**: Responsive layout system
- **CSS Custom Properties**: Dynamic styling
- **ES6+ Features**: Modern JavaScript functionality

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live tournament updates
- **Advanced Filtering**: Date range, prize pool range, location-based
- **Tournament Analytics**: Charts and statistics
- **User Preferences**: Save filter preferences
- **Tournament Recommendations**: AI-powered suggestions
