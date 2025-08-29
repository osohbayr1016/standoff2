# Tournament System Implementation

## Overview

This document outlines the comprehensive tournament system implementation for the E-Sport Connection platform, designed according to the requirements specified. The system supports squad-based tournament registration with payment verification, bracket generation, and match management.

## Key Features Implemented

### 1. Squad-Based Registration System

**Requirements Met:**

- ✅ Only squads with 5-7 members can register
- ✅ Squad leaders can register their teams
- ✅ 5000 MNT registration fee with payment verification
- ✅ Squad must have a unique TAG and team name

**Implementation:**

- **Squad Model** (`backend/src/models/Squad.ts`)

  - Supports 5-7 members per squad
  - Unique TAG system
  - Leader management
  - Game-specific squads
  - Squad logo/banner support

- **Squad Routes** (`backend/src/routes/squadRoutes.ts`)
  - Create, update, and manage squads
  - Add/remove squad members
  - Squad leader permissions
  - Search and filter squads by game

### 2. Tournament Registration with Payment Verification

**Requirements Met:**

- ✅ Payment verification system
- ✅ Admin approval process
- ✅ Registration status tracking

**Implementation:**

- **TournamentRegistration Model** (`backend/src/models/TournamentRegistration.ts`)

  - Links tournaments to squads
  - Payment status tracking (pending, paid, failed, refunded)
  - Payment proof upload support
  - Admin approval workflow
  - Registration status (registered, active, eliminated, winner, etc.)

- **Tournament Registration Routes** (`backend/src/routes/tournamentRegistrationRoutes.ts`)
  - Squad registration for tournaments
  - Payment status management
  - Admin approval system
  - Registration cancellation

### 3. Tournament Bracket and Match Management

**Requirements Met:**

- ✅ Random bracket generation
- ✅ Match scheduling and results
- ✅ Admin match management
- ✅ Tournament progression tracking

**Implementation:**

- **TournamentMatch Model** (`backend/src/models/TournamentMatch.ts`)

  - Match scheduling and timing
  - Score tracking
  - Winner/loser management
  - Walkover handling
  - Admin notes and match status

- **Tournament Match Routes** (`backend/src/routes/tournamentMatchRoutes.ts`)
  - Automatic bracket generation
  - Random squad pairing
  - Match result management
  - Next round generation
  - Tournament bracket visualization

### 4. Enhanced Tournament Model

**Requirements Met:**

- ✅ Unlimited squad capacity
- ✅ Custom prize distribution
- ✅ Banner and organizer image support
- ✅ Removed tax system

**Implementation:**

- **Updated Tournament Model** (`backend/src/models/Tournament.ts`)
  - Custom prize distribution (1st, 2nd, 3rd place)
  - Banner image support
  - Organizer profile picture
  - Squad-based participant tracking
  - Entry fee system (5000 MNT)

### 5. Frontend Components

**Implementation:**

- **Squads Page** (`frontend/src/app/squads/page.tsx`)

  - Squad browsing and search
  - Squad creation interface
  - Member management
  - Game filtering

- **Updated Tournament Detail Page** (`frontend/src/app/tournaments/[id]/page.tsx`)
  - Squad-based registration
  - Prize distribution display
  - Payment information
  - Registration status

## API Endpoints

### Squad Management

```
GET    /api/squads                    - Get all squads
GET    /api/squads/:id                - Get squad by ID
POST   /api/squads                    - Create squad
PUT    /api/squads/:id                - Update squad
POST   /api/squads/:id/members        - Add member to squad
DELETE /api/squads/:id/members/:memberId - Remove member from squad
GET    /api/squads/game/:game         - Get squads by game
GET    /api/squads/user/:userId       - Get user's squads
```

### Tournament Registration

```
GET    /api/tournament-registrations                    - Get all registrations (admin)
POST   /api/tournament-registrations/register          - Register squad for tournament
PUT    /api/tournament-registrations/:id/payment       - Update payment status
PUT    /api/tournament-registrations/:id/approve       - Approve registration
GET    /api/tournament-registrations/tournament/:id    - Get tournament registrations
GET    /api/tournament-registrations/squad/:id         - Get squad registrations
DELETE /api/tournament-registrations/:id               - Cancel registration
```

### Tournament Matches

```
POST   /api/tournament-matches/generate-brackets/:id   - Generate tournament brackets
GET    /api/tournament-matches/tournament/:id          - Get tournament matches
GET    /api/tournament-matches/:id                     - Get match by ID
PUT    /api/tournament-matches/:id/result              - Update match result
PUT    /api/tournament-matches/:id/schedule            - Schedule match
PUT    /api/tournament-matches/:id/start               - Start match
GET    /api/tournament-matches/tournament/:id/bracket  - Get tournament bracket
```

## Database Schema

### Squad Collection

```javascript
{
  _id: ObjectId,
  name: String,           // Squad name
  tag: String,            // Unique squad tag
  leader: ObjectId,       // Squad leader (User ID)
  members: [ObjectId],    // Array of member User IDs
  maxMembers: Number,     // 5-7 members
  game: String,           // Game this squad is for
  description: String,    // Squad description
  logo: String,           // Squad logo URL
  isActive: Boolean,      // Squad status
  createdAt: Date,
  updatedAt: Date
}
```

### TournamentRegistration Collection

```javascript
{
  _id: ObjectId,
  tournament: ObjectId,   // Tournament ID
  squad: ObjectId,        // Squad ID
  squadLeader: ObjectId,  // Squad leader User ID
  squadMembers: [ObjectId], // Squad member User IDs
  registrationFee: Number,  // 5000 MNT
  paymentStatus: String,    // pending, paid, failed, refunded
  paymentDate: Date,
  paymentProof: String,     // Payment proof image URL
  registrationDate: Date,
  isApproved: Boolean,      // Admin approval
  approvedBy: ObjectId,     // Admin User ID
  approvedAt: Date,
  status: String,           // registered, active, eliminated, winner, etc.
  tournamentBracket: Mixed, // Bracket position data
  createdAt: Date,
  updatedAt: Date
}
```

### TournamentMatch Collection

```javascript
{
  _id: ObjectId,
  tournament: ObjectId,    // Tournament ID
  matchNumber: Number,     // Sequential match number
  round: Number,           // Tournament round
  squad1: ObjectId,        // First squad
  squad2: ObjectId,        // Second squad
  winner: ObjectId,        // Winning squad
  loser: ObjectId,         // Losing squad
  status: String,          // scheduled, in_progress, completed, cancelled
  scheduledTime: Date,     // When match is scheduled
  startTime: Date,         // When match started
  endTime: Date,           // When match ended
  score: {                 // Match score
    squad1Score: Number,
    squad2Score: Number
  },
  adminNotes: String,      // Admin notes
  isWalkover: Boolean,     // Walkover flag
  walkoverReason: String,  // Walkover reason
  createdAt: Date,
  updatedAt: Date
}
```

## Workflow

### 1. Squad Creation

1. User creates a squad with 5-7 members
2. Squad gets a unique TAG
3. Squad leader manages members
4. Squad is ready for tournament registration

### 2. Tournament Registration

1. Squad leader registers squad for tournament
2. Payment of 5000 MNT required
3. Payment proof uploaded
4. Admin verifies payment and approves registration
5. Squad appears in tournament participant list

### 3. Tournament Execution

1. Admin generates brackets when registration closes
2. Random pairing of squads
3. Matches scheduled and managed
4. Results recorded by admin
5. Winners advance to next round
6. Tournament continues until final winner

### 4. Prize Distribution

1. 1st, 2nd, 3rd place winners determined
2. Prize money distributed according to custom distribution
3. Tournament marked as completed

## Security Features

- Squad leader permissions for squad management
- Admin-only access to payment verification and match management
- Payment proof verification system
- Unique squad TAG validation
- Member limit enforcement (5-7 members)

## Future Enhancements

1. **Real-time Match Updates**

   - WebSocket integration for live match updates
   - Real-time bracket progression

2. **Advanced Payment System**

   - Integration with payment gateways
   - Automated payment verification

3. **Tournament Analytics**

   - Match statistics
   - Squad performance tracking
   - Tournament history

4. **Mobile App Support**
   - Push notifications for match updates
   - Mobile-optimized interfaces

## Testing

The system includes comprehensive error handling and validation:

- Squad member limit validation
- Payment status verification
- Tournament capacity checking
- Match result validation
- Admin permission checks

## Deployment Notes

1. Ensure MongoDB indexes are created for optimal performance
2. Set up proper CORS configuration for frontend-backend communication
3. Configure file upload for squad logos and payment proofs
4. Set up admin user accounts for tournament management
5. Test payment verification workflow thoroughly

This implementation provides a complete, scalable tournament system that meets all specified requirements while maintaining flexibility for future enhancements.
