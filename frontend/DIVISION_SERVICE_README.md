# Division Service Implementation

## Overview

The `DivisionService` is a comprehensive service class that provides all the functionality needed to manage squad divisions, bounty coins, and division-related operations in the e-sports platform.

## Features

### 🏆 **Division Management**

- **Three Division Levels**: Silver, Gold, and Diamond
- **Division Information**: Display names, colors, requirements, and descriptions
- **Progression System**: Upgrade costs and requirements for each division
- **Visual Elements**: Emojis, colors, and coin images for each division

### 💰 **Bounty Coin System**

- **Purchase System**: Different coin prices for each division
- **Upgrade Mechanics**: Automatic calculation of upgrade possibilities
- **Progress Tracking**: Visual progress bars and percentage calculations
- **Protection System**: Loss protection mechanisms

### 🔄 **API Integration**

- **Backend Communication**: Full integration with division API endpoints
- **Error Handling**: Robust error handling with fallbacks
- **Data Transformation**: Automatic data mapping and validation
- **Async Operations**: Promise-based API calls

## API Endpoints

### Base URL

```
/api/divisions
```

### Available Endpoints

- `GET /info` - Get all divisions information
- `GET /leaderboard/{division}` - Get division leaderboard
- `GET /squad/{squadId}` - Get squad division information
- `POST /protection/{squadId}` - Use protection for a squad
- `POST /purchase/{squadId}` - Purchase bounty coins
- `POST /process-match/{matchId}` - Process match result (admin only)

## Division Levels

### 🥈 Silver Division

- **Requirements**: 0-250 Bounty Coins
- **Upgrade Cost**: 250 BC to Gold
- **Coin Price**: 10,000 ₮ per coin
- **Description**: Starting point for new squads
- **Emoji**: 🥈

### 🥇 Gold Division

- **Requirements**: 0-750 Bounty Coins
- **Upgrade Cost**: 750 BC to Diamond
- **Coin Price**: 20,000 ₮ per coin
- **Description**: Intermediate level squads
- **Emoji**: 🥇

### 💎 Diamond Division

- **Requirements**: 0+ Bounty Coins
- **Upgrade Cost**: None (highest level)
- **Coin Price**: 30,000 ₮ per coin
- **Description**: Elite level squads
- **Emoji**: 💎

## Usage Examples

### Basic Division Information

```typescript
import { DivisionService } from "../services/divisionService";
import { SquadDivision } from "../types/division";

// Get division display name
const displayName = DivisionService.getDivisionDisplayName(
  SquadDivision.SILVER
);
// Returns: "Silver Division"

// Get division color
const color = DivisionService.getDivisionColor(SquadDivision.GOLD);
// Returns: "#FFD700"

// Get division emoji
const emoji = DivisionService.getDivisionEmoji(SquadDivision.DIAMOND);
// Returns: "💎"
```

### Upgrade Calculations

```typescript
// Check if squad can upgrade
const canUpgrade = DivisionService.canUpgradeToNextDivision(
  SquadDivision.SILVER,
  300
);
// Returns: true (300 BC >= 250 BC required)

// Get next division
const nextDivision = DivisionService.getNextDivision(SquadDivision.SILVER);
// Returns: SquadDivision.GOLD

// Calculate progress percentage
const progress = DivisionService.calculateProgressToNextDivision(
  SquadDivision.SILVER,
  200
);
// Returns: 80.0 (200/250 * 100)
```

### API Operations

```typescript
// Get all divisions info
const divisionsInfo = await DivisionService.getDivisionsInfo();

// Get division leaderboard
const leaderboard = await DivisionService.getDivisionLeaderboard(
  SquadDivision.SILVER,
  10
);

// Get squad division info
const squadInfo = await DivisionService.getSquadDivisionInfo("squad123");

// Purchase bounty coins
const purchaseResult = await DivisionService.purchaseBountyCoins(
  "squad123",
  100
);
```

## React Component Integration

### Squad Division Card

```tsx
import { DivisionService } from "../services/divisionService";
import { SquadDivision } from "../types/division";

function SquadDivisionCard({ squadDivision, bountyCoins }) {
  const canUpgrade = DivisionService.canUpgradeToNextDivision(
    squadDivision,
    bountyCoins
  );
  const progress = DivisionService.calculateProgressToNextDivision(
    squadDivision,
    bountyCoins
  );
  const nextDivision = DivisionService.getNextDivision(squadDivision);
  const emoji = DivisionService.getDivisionEmoji(squadDivision);

  return (
    <div className="division-card">
      <h3>
        {emoji} {DivisionService.getDivisionDisplayName(squadDivision)}
      </h3>
      <p>{DivisionService.getDivisionDescription(squadDivision)}</p>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
        <span>{progress.toFixed(1)}%</span>
      </div>

      {canUpgrade && (
        <button className="upgrade-btn">
          Upgrade to{" "}
          {nextDivision && DivisionService.getDivisionDisplayName(nextDivision)}
        </button>
      )}
    </div>
  );
}
```

### Division Leaderboard

```tsx
function DivisionLeaderboard({ division }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const data = await DivisionService.getDivisionLeaderboard(division, 50);
        setLeaderboard(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [division]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="leaderboard">
      <h2>
        {DivisionService.getDivisionEmoji(division)}{" "}
        {DivisionService.getDivisionDisplayName(division)} Leaderboard
      </h2>
      {leaderboard.map((entry, index) => (
        <div key={entry._id} className="leaderboard-entry">
          <span className="rank">#{index + 1}</span>
          <span className="name">{entry.name}</span>
          <span className="coins">{entry.currentBountyCoins} BC</span>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

### API Error Handling

```typescript
try {
  const divisionsInfo = await DivisionService.getDivisionsInfo();
  // Process data
} catch (error) {
  if (error.response?.status === 404) {
    console.error("Divisions not found");
  } else if (error.response?.status === 500) {
    console.error("Server error");
  } else {
    console.error("Network error:", error.message);
  }
}
```

### Fallback Values

```typescript
// The service automatically provides fallback values
const divisionsInfo = await DivisionService.getDivisionsInfo();
// If API fails, returns empty array instead of throwing

const leaderboard = await DivisionService.getDivisionLeaderboard(
  SquadDivision.SILVER
);
// If API fails, returns empty array instead of throwing
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### API Client Configuration

The service uses a configured axios instance with:

- Automatic token injection
- Request/response interceptors
- Error handling
- Timeout configuration

## Performance Features

- **Static Methods**: No instance creation overhead
- **Caching**: API responses can be cached at component level
- **Lazy Loading**: Load division data only when needed
- **Error Boundaries**: Graceful degradation on API failures

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live division changes
- **Advanced Analytics**: Division performance metrics and trends
- **Custom Divisions**: User-defined division levels
- **Division Challenges**: Special events and competitions
- **Achievement System**: Division-specific badges and rewards

## Testing

### Unit Tests

```typescript
// Test division calculations
test("should calculate correct upgrade cost", () => {
  const cost = DivisionService.getUpgradeCost(SquadDivision.SILVER);
  expect(cost).toBe(250);
});

test("should determine upgrade possibility", () => {
  const canUpgrade = DivisionService.canUpgradeToNextDivision(
    SquadDivision.SILVER,
    300
  );
  expect(canUpgrade).toBe(true);
});
```

### Integration Tests

```typescript
// Test API integration
test("should fetch divisions info", async () => {
  const divisions = await DivisionService.getDivisionsInfo();
  expect(Array.isArray(divisions)).toBe(true);
  expect(divisions.length).toBeGreaterThan(0);
});
```

## Troubleshooting

### Common Issues

1. **Import Error**: Make sure `apiClient` is properly configured
2. **Type Errors**: Verify all types are imported correctly
3. **API Errors**: Check backend server status and API endpoints
4. **Build Errors**: Ensure all dependencies are installed

### Debug Mode

```typescript
// Enable debug logging
console.log("Division Service Debug Mode");
const divisions = await DivisionService.getDivisionsInfo();
console.log("Divisions:", divisions);
```

## Support

For issues or questions about the DivisionService:

1. Check the console for error messages
2. Verify API endpoint availability
3. Review TypeScript type definitions
4. Check network connectivity and CORS settings
