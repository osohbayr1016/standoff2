# Squad Invitation and Application System 🎮

## Overview

The E-Sport Connection platform now includes a comprehensive squad invitation and application system that allows squad leaders to control how players can join their squads. Players can be invited directly, apply for membership, or join freely depending on the squad's settings.

## Features

### 🎯 Squad Join Types

Squads can now be configured with three different join types:

1. **Invite Only** (`INVITE_ONLY`)

   - Only squad leaders can invite players
   - Players cannot apply or join directly
   - Most restrictive option for competitive teams

2. **Open for Applications** (`OPEN_FOR_APPLY`)

   - Players can apply to join the squad
   - Squad leaders review and approve/reject applications
   - Balanced approach for team building

3. **Everyone Can Join** (`EVERYONE_CAN_JOIN`)
   - Players can join the squad directly
   - No approval process required
   - Most open option for casual teams

### 📨 Invitation System

- **Send Invitations**: Squad leaders can invite specific players
- **Invitation Messages**: Optional personal messages with invitations
- **Invitation Expiration**: Invitations expire after 7 days
- **Response Handling**: Players can accept or decline invitations
- **Duplicate Prevention**: Prevents multiple pending invitations to the same user

### 📝 Application System

- **Submit Applications**: Players can apply to join squads
- **Application Messages**: Optional messages explaining why they want to join
- **Application Review**: Squad leaders can approve or reject applications
- **Response Messages**: Leaders can provide feedback on decisions
- **Duplicate Prevention**: Prevents multiple pending applications from the same user

## Backend Implementation

### New Models

#### SquadInvitation

```typescript
interface ISquadInvitation {
  squad: ObjectId; // Squad ID
  invitedUser: ObjectId; // User being invited
  invitedBy: ObjectId; // User who sent invitation
  status: InvitationStatus; // PENDING, ACCEPTED, DECLINED, EXPIRED
  message?: string; // Optional invitation message
  expiresAt: Date; // Expiration date (7 days)
}
```

#### SquadApplication

```typescript
interface ISquadApplication {
  squad: ObjectId; // Squad ID
  applicant: ObjectId; // User applying
  status: ApplicationStatus; // PENDING, APPROVED, REJECTED, WITHDRAWN
  message?: string; // Application message
  responseMessage?: string; // Leader's response
  respondedBy?: ObjectId; // Who responded
  respondedAt?: Date; // When response was given
}
```

#### Updated Squad Model

```typescript
interface ISquad {
  // ... existing fields ...
  joinType: SquadJoinType; // New field for join settings
}
```

### New API Endpoints

#### Squad Management

- `PUT /api/squads/:id/join-settings` - Update squad join type

#### Invitations

- `POST /api/squads/:id/invite` - Send invitation to player
- `POST /api/squads/:id/respond-invitation` - Accept/decline invitation
- `GET /api/squads/:id/invitations` - Get squad invitations (leader only)
- `GET /api/squads/user/:userId/invitations` - Get user's invitations

#### Applications

- `POST /api/squads/:id/apply` - Apply to join squad
- `POST /api/squads/:id/respond-application` - Approve/reject application
- `GET /api/squads/:id/applications` - Get squad applications (leader only)
- `GET /api/squads/user/:userId/applications` - Get user's applications

### Enhanced Endpoints

#### Join Squad

- Now checks squad join type before allowing direct joins
- Redirects users to appropriate action based on join type

## Frontend Implementation

### New API Routes

- `/api/squads/[id]/invite` - Send invitations
- `/api/squads/[id]/respond-invitation` - Handle invitation responses
- `/api/squads/[id]/apply` - Submit applications
- `/api/squads/[id]/respond-application` - Handle application responses
- `/api/squads/[id]/join-settings` - Update join settings
- `/api/squads/[id]/invitations` - Get squad invitations
- `/api/squads/[id]/applications` - Get squad applications
- `/api/squads/user/[userId]/invitations` - Get user invitations
- `/api/squads/user/[userId]/applications` - Get user applications

### TypeScript Types

Complete type definitions for:

- Squad join types
- Invitation statuses
- Application statuses
- Request/response interfaces
- User and squad interfaces

### Utility Functions

Comprehensive service functions for:

- Squad management
- Invitation handling
- Application processing
- Join type validation
- Helper utilities

## Usage Examples

### For Squad Leaders

#### Setting Join Type

```typescript
await updateSquadJoinSettings(
  squadId,
  {
    joinType: SquadJoinType.INVITE_ONLY,
    userId: leaderId,
  },
  token
);
```

#### Inviting Players

```typescript
await invitePlayerToSquad(
  squadId,
  {
    invitedUserId: "player123",
    message: "We'd love to have you on our team!",
    userId: leaderId,
  },
  token
);
```

#### Reviewing Applications

```typescript
await respondToApplication(
  squadId,
  {
    applicationId: "app123",
    response: "APPROVE",
    responseMessage: "Welcome to the team!",
    userId: leaderId,
  },
  token
);
```

### For Players

#### Applying to Squads

```typescript
await applyToSquad(
  squadId,
  {
    userId: "player123",
    message: "I'm a dedicated player looking for a competitive team",
  },
  token
);
```

#### Responding to Invitations

```typescript
await respondToInvitation(
  squadId,
  {
    invitationId: "inv123",
    response: "ACCEPT",
    userId: "player123",
  },
  token
);
```

## Security Features

### Authorization

- Only squad leaders can send invitations
- Only squad leaders can review applications
- Only squad leaders can update join settings
- Users can only respond to their own invitations

### Validation

- Prevents duplicate invitations/applications
- Validates squad capacity before adding members
- Checks invitation expiration dates
- Ensures proper join type compliance

### Data Integrity

- TTL indexes for expired invitations
- Unique constraints on pending invitations/applications
- Proper error handling and validation

## Database Indexes

### SquadInvitation

- `{ squad: 1, invitedUser: 1 }` - Unique constraint
- `{ invitedUser: 1, status: 1 }` - User invitation queries
- `{ squad: 1, status: 1 }` - Squad invitation queries
- `{ expiresAt: 1 }` - TTL for expired invitations

### SquadApplication

- `{ squad: 1, applicant: 1 }` - Unique constraint
- `{ applicant: 1, status: 1 }` - User application queries
- `{ squad: 1, status: 1 }` - Squad application queries
- `{ createdAt: -1 }` - Chronological ordering

## Future Enhancements

### Planned Features

- **Email Notifications**: Send emails for invitations and applications
- **Push Notifications**: Real-time notifications for responses
- **Bulk Operations**: Invite multiple players at once
- **Invitation Templates**: Pre-written invitation messages
- **Application Scoring**: Rate applications based on criteria
- **Auto-approval**: Rules-based automatic application approval

### Integration Opportunities

- **Discord Bot**: Manage squad operations via Discord
- **Mobile App**: Native mobile experience
- **Analytics Dashboard**: Track squad growth and engagement
- **Tournament Integration**: Automatic squad formation for events

## Testing

### Backend Testing

- All new endpoints tested for proper authorization
- Validation logic tested with edge cases
- Database constraints verified
- Error handling tested

### Frontend Testing

- API integration tested
- Type safety verified
- Error handling tested
- User experience validated

## Deployment

### Backend

- New models deployed to database
- API endpoints available
- Database indexes created
- Environment variables configured

### Frontend

- New API routes deployed
- TypeScript types available
- Utility functions accessible
- Ready for UI implementation

## Conclusion

The squad invitation and application system provides a robust foundation for team management in the E-Sport Connection platform. It gives squad leaders full control over their team composition while providing players with multiple ways to join squads based on their preferences and the squad's requirements.

The system is designed to be scalable, secure, and user-friendly, with comprehensive error handling and validation. It supports the platform's goal of facilitating meaningful connections between e-sports players and teams.
