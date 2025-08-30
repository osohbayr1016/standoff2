# Bounty Coin System

## Overview

The Bounty Coin system is a comprehensive in-game currency system that rewards players for tournament participation and provides various spending options within the E-Sport Connection platform.

## Features

### 1. Tournament Rewards

- **Winning Team**: Each player receives 50 Bounty Coins
- **Losing Team**: Each player loses 25 Bounty Coins (minimum 0)
- **Auto Win**: No bounty coins distributed (for walkovers or technical issues)

### 2. Currency Conversion

- **Purchase Rate**: 10 Bounty Coins = 2,000 MNT (1 BC = 200 MNT)
- **Withdrawal Rate**: 1 Bounty Coin = 200 MNT
- **Example**: Winning team (50 BC) = 10,000 MNT value

### 3. Spending Options

- **Squad Level Up**: Spend coins to increase squad experience and level
- **In-Game Purchases**: Buy items, skins, or other digital goods
- **Withdrawal**: Convert to real money (MNT)

## Technical Implementation

### Backend Models

#### BountyCoin Model

```typescript
interface IBountyCoin {
  userId: ObjectId;
  squadId?: ObjectId;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Array<{
    type: "earn" | "spend" | "purchase" | "withdraw";
    amount: number;
    description: string;
    tournamentId?: ObjectId;
    matchId?: ObjectId;
    timestamp: Date;
  }>;
}
```

#### TournamentMatch Model Updates

```typescript
interface ITournamentMatch {
  // ... existing fields
  bountyCoinsDistributed: boolean;
  bountyCoinAmount: number;
  matchType: "normal" | "auto_win" | "walkover";
}
```

#### Squad Model Updates

```typescript
interface ISquad {
  // ... existing fields
  level: number;
  experience: number;
  totalBountyCoinsEarned: number;
  totalBountyCoinsSpent: number;
}
```

### API Endpoints

#### Bounty Coin Routes

- `GET /api/bounty-coins/balance/:userId` - Get user balance
- `GET /api/bounty-coins/squad/:squadId` - Get squad summary
- `POST /api/bounty-coins/purchase` - Purchase coins with real money
- `POST /api/bounty-coins/spend` - Spend coins (e.g., squad level up)
- `POST /api/bounty-coins/withdraw` - Withdraw to real money
- `GET /api/bounty-coins/transactions/:userId` - Get transaction history

#### Tournament Match Routes

- `PUT /api/tournament-matches/:matchId/result` - Update match result (Admin)
- `GET /api/tournament-matches/:matchId/stats` - Get match statistics

### Frontend Pages

#### User Pages

- `/bounty-coins` - Main bounty coin dashboard
  - Balance overview
  - Transaction history
  - Squad progress
  - Quick actions

#### Admin Pages

- `/admin/match-results` - Match result management
  - Update match results
  - Choose match type (normal/auto_win/walkover)
  - Manage bounty coin distribution

## Business Logic

### Match Result Types

#### Normal Match

- Bounty coins are distributed
- Winner: +50 BC per player
- Loser: -25 BC per player (minimum 0)
- Total coins involved: 75 BC

#### Auto Win

- No bounty coins distributed
- Winner advances to next round
- Used for walkovers or technical issues

#### Walkover

- No bounty coins distributed
- Winner advances to next round
- Used when one team doesn't show up

### Squad Leveling System

- **Experience Gain**: 1 Bounty Coin = 10 experience points
- **Level Up**: Every 100 experience points = 1 level
- **Maximum Level**: 100
- **Benefits**: Higher squad prestige and potential rewards

### Transaction Types

1. **Earn**: Tournament winnings
2. **Spend**: Squad level up, purchases
3. **Purchase**: Real money to bounty coins
4. **Withdraw**: Bounty coins to real money

## Security Features

### Admin Controls

- Only admins can update match results
- Match type selection affects bounty coin distribution
- Transaction logging for all operations

### Balance Protection

- Users cannot go below 0 bounty coins
- Loser penalty is capped at current balance
- All transactions are logged and auditable

### Payment Validation

- Purchase amounts are validated against expected rates
- Withdrawal requests are logged and require approval
- Real money conversion rates are fixed and transparent

## Future Enhancements

### Planned Features

- **Tournament Prizes**: Direct bounty coin rewards for tournament winners
- **Achievement System**: Bonus coins for special accomplishments
- **Referral Rewards**: Coins for inviting new players
- **Seasonal Events**: Special coin earning opportunities

### Technical Improvements

- **Real-time Updates**: Live balance updates during matches
- **Mobile App**: Dedicated mobile interface for bounty coins
- **Analytics Dashboard**: Detailed spending and earning analytics
- **API Rate Limiting**: Protection against abuse

## Deployment Notes

### Database Migration

- New models need to be added to MongoDB
- Existing tournaments will have default bounty coin settings
- Squad levels will start at 1 with 0 experience

### Environment Variables

- No additional environment variables required
- All rates are hardcoded in the business logic
- Can be made configurable in future versions

### Testing

- Test match result updates with different match types
- Verify bounty coin distribution calculations
- Test edge cases (0 balance, maximum levels)
- Validate transaction logging

## Support and Maintenance

### Monitoring

- Track bounty coin distribution rates
- Monitor transaction volumes
- Alert on unusual spending patterns
- Regular balance reconciliation

### User Support

- Clear documentation on how the system works
- Support for balance disputes
- Transaction history access
- Help with squad leveling decisions

---

This system provides a comprehensive reward mechanism that encourages tournament participation while offering meaningful progression and spending options for players.
