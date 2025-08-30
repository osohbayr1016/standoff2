# Division System Implementation

## Overview

Энэхүү division систем нь E-Sport Connection платформд баг squad-уудын түвшинг тодорхойлж, тэднийг Bounty Coin-р урамшуулах систем юм.

## Division Structure

### 1. Silver Division

- **Range**: 0-250 Bounty Coins
- **Upgrade Cost**: 250 Bounty Coins
- **Bounty Coin Price**: 50 coins = 10,000 MNT
- **Win Reward**: +50 coins
- **Lose Penalty**: -25 coins
- **Starting Point**: Бүх багууд эндээс эхэлнэ

### 2. Gold Division

- **Range**: 0-750 Bounty Coins
- **Upgrade Cost**: 750 Bounty Coins
- **Bounty Coin Price**: 50 coins = 20,000 MNT
- **Win Reward**: +50 coins
- **Lose Penalty**: -25 coins
- **Upgrade Requirement**: Silver Division-с 250 coins төлж орно

### 3. Diamond Division

- **Range**: 0+ Bounty Coins (хязгааргүй)
- **Upgrade Cost**: N/A (хамгийн дээд түвшин)
- **Bounty Coin Price**: 50 coins = 30,000 MNT
- **Win Reward**: +50 coins
- **Lose Penalty**: -25 coins
- **Upgrade Requirement**: Gold Division-с 750 coins төлж орно

## Protection System

### Protection Rules

- **Initial Protections**: Баг бүр 2 protection-той эхэлнэ
- **Protection Reset**: Хожих үед protection-ууд дахин 2 болно
- **Division Change**: Division өөрчлөгдөх үед protection-ууд reset болно
- **Protection Usage**: Хожигдох үед protection ашиглаж болно

### Demotion Logic

- **Demotion Condition**: 0 coins + 2 consecutive losses + 0 protections
- **Demotion Result**: Доод division-рүү унаж, coins 0-с эхэлнэ
- **Protection Reset**: Demotion-ын дараа protection-ууд 2 болно

## Technical Implementation

### Backend Components

#### 1. Models

- **Squad Model**: Division, currentBountyCoins, protectionCount, consecutiveLosses талбарууд нэмэгдсэн
- **TournamentMatch Model**: Division tracking, bounty coin changes нэмэгдсэн

#### 2. Services

- **DivisionService**: Division upgrade/demotion, protection management логик
- **Bounty Coin Distribution**: Match result-ын дараа bounty coin тооцоолох

#### 3. API Routes

- `/api/divisions/info` - Бүх division-ын мэдээлэл
- `/api/divisions/leaderboard/:division` - Division leaderboard
- `/api/divisions/squad/:squadId` - Squad-ын division мэдээлэл
- `/api/divisions/protection/:squadId` - Protection ашиглах
- `/api/divisions/purchase/:squadId` - Bounty coin худалдан авах
- `/api/divisions/process-match/:matchId` - Match result боловсруулах

### Frontend Components

#### 1. Pages

- **Divisions Page** (`/divisions`): Бүх division-ын мэдээлэл, leaderboard
- **Squad Detail Page**: Squad-ын division stats харуулах

#### 2. Components

- **DivisionCard**: Division мэдээлэл, upgrade cost, pricing
- **DivisionLeaderboard**: Division-ын top squads
- **DivisionStats**: Squad-ын division progress, protections

#### 3. Services

- **DivisionService**: API calls, division logic
- **Types**: Division interfaces, enums

## Database Schema Changes

### Squad Collection

```typescript
{
  // Existing fields...
  division: SquadDivision, // SILVER, GOLD, DIAMOND
  currentBountyCoins: number, // Current coins in division
  protectionCount: number, // 0-2 protections
  consecutiveLosses: number, // Consecutive losses count
}
```

### TournamentMatch Collection

```typescript
{
  // Existing fields...
  squad1Division: SquadDivision, // Division at match time
  squad2Division: SquadDivision,
  squad1BountyChange: number, // Bounty coin change
  squad2BountyChange: number,
  divisionChangesProcessed: boolean // Processing status
}
```

## API Endpoints

### Division Information

```http
GET /api/divisions/info
Response: Array of division configurations
```

### Division Leaderboard

```http
GET /api/divisions/leaderboard/:division?limit=50
Response: Array of squad rankings
```

### Squad Division Info

```http
GET /api/divisions/squad/:squadId
Response: Squad's current division status
```

### Use Protection

```http
POST /api/divisions/protection/:squadId
Auth: Required
Response: Protection usage confirmation
```

### Purchase Bounty Coins

```http
POST /api/divisions/purchase/:squadId
Body: { amount: number }
Auth: Required
Response: Purchase confirmation
```

### Process Match Result

```http
POST /api/divisions/process-match/:matchId
Auth: Admin required
Response: Processing confirmation
```

## Business Logic

### Division Upgrade Process

1. Squad reaches upgrade threshold (250/750 coins)
2. System checks if upgrade is possible
3. Squad pays upgrade cost
4. Division changes, coins reset to 0
5. Protections reset to 2
6. Consecutive losses reset to 0

### Division Demotion Process

1. Squad reaches 0 coins
2. Squad loses 2 consecutive matches
3. Squad has no protections remaining
4. System demotes squad to previous division
5. Coins reset to 0
6. Protections reset to 2
7. Consecutive losses reset to 0

### Bounty Coin Distribution

1. Match completion triggers bounty coin calculation
2. Winners receive +50 coins based on their division
3. Losers lose -25 coins based on their division
4. Division changes are processed if thresholds are met
5. Protection system is updated based on results

## Testing

### Backend Tests

- Division upgrade/demotion logic
- Protection system functionality
- Bounty coin calculations
- Match result processing

### Frontend Tests

- Division page rendering
- Leaderboard functionality
- Squad division stats display
- API integration

## Deployment Status

### ✅ Completed

- [x] Backend models and schemas
- [x] Division service logic
- [x] API endpoints
- [x] Frontend components
- [x] Division page
- [x] Squad integration
- [x] Protection system
- [x] Bounty coin system

### 🔄 In Progress

- [ ] Payment integration for bounty coin purchases
- [ ] Admin panel for division management
- [ ] Division history tracking
- [ ] Advanced analytics

### 📋 Future Enhancements

- [ ] Division-specific tournaments
- [ ] Seasonal division resets
- [ ] Division rewards and achievements
- [ ] Division-based matchmaking

## Usage Examples

### Creating a New Squad

```typescript
const newSquad = {
  name: "New Warriors",
  division: SquadDivision.SILVER,
  currentBountyCoins: 0,
  protectionCount: 2,
  consecutiveLosses: 0,
};
```

### Processing Match Result

```typescript
await DivisionService.processMatchResult(matchId);
// Automatically updates squad divisions and bounty coins
```

### Using Protection

```typescript
await DivisionService.useProtection(squadId);
// Reduces protection count by 1
```

## Configuration

### Environment Variables

```env
# Division System
DIVISION_UPGRADE_SILVER=250
DIVISION_UPGRADE_GOLD=750
BOUNTY_COIN_SILVER=10000
BOUNTY_COIN_GOLD=20000
BOUNTY_COIN_DIAMOND=30000
```

### Division Constants

```typescript
export const DIVISION_CONFIG = {
  [SquadDivision.SILVER]: {
    maxCoins: 250,
    upgradeCost: 250,
    bountyCoinPrice: 10000,
  },
  // ... other divisions
};
```

## Monitoring and Analytics

### Key Metrics

- Division distribution across squads
- Upgrade/demotion rates
- Protection usage patterns
- Bounty coin economy balance
- Division progression speed

### Logging

- Division change events
- Protection usage
- Bounty coin transactions
- Match result processing

## Security Considerations

### Authentication

- Division info: Public access
- Protection usage: Squad member authentication
- Bounty coin purchase: Squad member authentication
- Match processing: Admin authentication

### Data Validation

- Bounty coin amounts validation
- Division state consistency
- Protection count limits
- Upgrade/demotion logic validation

## Support and Maintenance

### Common Issues

1. **Division not updating**: Check match processing status
2. **Protection not working**: Verify protection count and consecutive losses
3. **Bounty coins not updating**: Check match completion and distribution

### Maintenance Tasks

- Regular division balance checks
- Protection system monitoring
- Bounty coin economy analysis
- Division progression analytics

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
