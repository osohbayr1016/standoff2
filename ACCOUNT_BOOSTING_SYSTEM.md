# Account Boosting System

## Overview

The Account Boosting System is a professional service platform that connects customers with verified professional players for account boosting services. This system allows professional players to offer their services and customers to find reliable boosters for various games.

## Features

### For Customers

- **Browse Professional Players**: View approved pro players with detailed profiles
- **Filter by Game**: Find boosters for specific games
- **View Ratings & Reviews**: See player performance and customer feedback
- **Secure Transactions**: Safe and verified boosting services
- **Detailed Profiles**: Comprehensive information about each pro player

### For Professional Players

- **Application System**: Submit applications to become a verified pro player
- **Profile Management**: Create and manage boosting service profiles
- **Performance Tracking**: Monitor boost success rates and ratings
- **Admin Approval**: Professional verification process

### For Administrators

- **Application Review**: Review and approve/reject pro player applications
- **Status Management**: Manage pro player statuses (Pending, Approved, Rejected, Suspended)
- **Performance Monitoring**: Track system statistics and performance
- **Quality Control**: Ensure only qualified players are approved

## System Architecture

### Backend Components

#### 1. ProPlayer Model (`backend/src/models/ProPlayer.ts`)

```typescript
interface IProPlayer {
  userId: mongoose.Types.ObjectId;
  game: string;
  rank: string;
  currentRank: string;
  targetRank: string;
  price: number;
  estimatedTime: string;
  description: string;
  status: ProPlayerStatus;
  adminNotes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  totalBoosts: number;
  successfulBoosts: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
}
```

#### 2. API Routes (`backend/src/routes/proPlayerRoutes.ts`)

- `GET /api/pro-players` - Get approved pro players
- `GET /api/pro-players/:id` - Get specific pro player details
- `POST /api/pro-players` - Create pro player profile
- `PUT /api/pro-players/:id` - Update pro player profile
- `DELETE /api/pro-players/:id` - Delete pro player profile
- `GET /api/pro-players/admin/applications` - Admin: Get all applications
- `PATCH /api/pro-players/admin/:id/status` - Admin: Update application status
- `GET /api/pro-players/admin/stats` - Admin: Get system statistics

### Frontend Components

#### 1. Main Account Boosting Page (`frontend/src/app/account-boosting/page.tsx`)

- Displays grid of approved professional players
- Game filtering system
- Pagination support
- Call-to-action for applying to become a pro player

#### 2. Pro Player Detail Page (`frontend/src/app/account-boosting/[id]/page.tsx`)

- Comprehensive player information
- Boosting service details
- Performance statistics
- Contact and booking options

#### 3. Application Page (`frontend/src/app/account-boosting/apply/page.tsx`)

- Form for users to apply as pro players
- Game and rank selection
- Service description and pricing
- Application submission

#### 4. Admin Management (`frontend/src/app/admin/pro-players/page.tsx`)

- Review pending applications
- Approve/reject applications
- Manage pro player statuses
- View detailed application information

## User Workflow

### Becoming a Pro Player

1. **Navigate to Account Boosting**: Visit `/account-boosting`
2. **Click Apply Button**: Click "Apply to Become a Pro Player"
3. **Fill Application Form**: Complete the application with:
   - Game selection
   - Current and target ranks
   - Skill level
   - Pricing information
   - Service description
4. **Submit Application**: Form validation and submission
5. **Admin Review**: Application reviewed by administrators
6. **Approval Process**: Admin approves or rejects with notes
7. **Profile Activation**: Approved players can start accepting requests

### Using Account Boosting Services

1. **Browse Pro Players**: View approved professional players
2. **Filter Options**: Filter by game, rank, or other criteria
3. **View Details**: Click on player cards for detailed information
4. **Contact Player**: Use contact options to discuss boosting
5. **Request Service**: Submit boosting requests through the platform

## Admin Workflow

### Managing Applications

1. **Access Admin Panel**: Navigate to `/admin/pro-players`
2. **Review Applications**: View all pending applications
3. **Evaluate Candidates**: Check player qualifications and descriptions
4. **Make Decision**: Approve, reject, or request more information
5. **Add Notes**: Provide feedback or reasons for decisions
6. **Monitor Performance**: Track approved players' success rates

### Status Management

- **PENDING**: New application awaiting review
- **APPROVED**: Player verified and can accept requests
- **REJECTED**: Application denied (can reapply)
- **SUSPENDED**: Temporarily suspended from service

## Security Features

- **Admin Verification**: Only admins can approve pro players
- **User Authentication**: Protected routes for profile management
- **Status Validation**: Prevents unauthorized status changes
- **Input Validation**: Form validation and sanitization
- **Rate Limiting**: API endpoint protection

## Database Schema

### ProPlayer Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  game: String,
  rank: String,
  currentRank: String,
  targetRank: String,
  price: Number,
  estimatedTime: String,
  description: String,
  status: String (enum),
  adminNotes: String,
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  totalBoosts: Number,
  successfulBoosts: Number,
  rating: Number,
  totalReviews: Number,
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `{ status: 1, game: 1, isAvailable: 1 }` - For filtering approved players
- `{ userId: 1 }` - For user-specific queries

## API Endpoints

### Public Endpoints

- `GET /api/pro-players` - List approved pro players
- `GET /api/pro-players/:id` - Get pro player details

### Authenticated Endpoints

- `POST /api/pro-players` - Create pro player profile
- `PUT /api/pro-players/:id` - Update profile
- `DELETE /api/pro-players/:id` - Delete profile

### Admin Endpoints

- `GET /api/pro-players/admin/applications` - Get all applications
- `PATCH /api/pro-players/admin/:id/status` - Update status
- `GET /api/pro-players/admin/stats` - Get statistics

## Testing

### Backend Testing

Run the test script to verify system functionality:

```bash
cd backend
node test-pro-players.js
```

### Frontend Testing

- Navigate to `/account-boosting` to view the main page
- Test filtering and pagination
- Verify responsive design on different screen sizes
- Test form validation on application page

## Configuration

### Environment Variables

- `MONGODB_URI` - Database connection string
- `NEXT_PUBLIC_API_URL` - Frontend API base URL

### Supported Games

- Mobile Legends: Bang Bang
- League of Legends
- Dota 2
- Valorant
- CS:GO
- PUBG Mobile
- Free Fire
- Call of Duty: Mobile
- Arena of Valor
- Wild Rift

### Rank System

- Bronze, Silver, Gold, Platinum, Diamond
- Master, Grandmaster, Challenger
- Legend, Mythic, Immortal, Radiant
- Global Elite, Supreme, Legendary Eagle

## Future Enhancements

### Planned Features

- **Payment Integration**: Secure payment processing
- **Chat System**: Direct communication between customers and pros
- **Order Management**: Structured boosting request system
- **Review System**: Customer feedback and ratings
- **Analytics Dashboard**: Performance metrics and insights
- **Mobile App**: Native mobile application
- **Multi-language Support**: Internationalization

### Technical Improvements

- **Real-time Updates**: WebSocket integration for live status
- **Image Upload**: Profile picture and verification documents
- **Search Optimization**: Advanced filtering and search
- **Performance Monitoring**: System health and metrics
- **Automated Testing**: Comprehensive test coverage

## Troubleshooting

### Common Issues

1. **Application Not Submitting**

   - Check form validation errors
   - Verify user authentication
   - Check browser console for errors

2. **Pro Players Not Loading**

   - Verify backend API is running
   - Check database connection
   - Verify pro player status is "APPROVED"

3. **Admin Access Issues**
   - Verify user role is "ADMIN"
   - Check authentication token
   - Verify admin routes are accessible

### Debug Mode

Enable debug logging in the backend:

```javascript
console.log("Debug info:", { data, error, status });
```

## Support

For technical support or questions about the Account Boosting System:

- Check the application logs
- Review the API documentation
- Contact the development team
- Submit issues through the project repository

## License

This system is part of the E-Sport Connection platform and follows the same licensing terms.
