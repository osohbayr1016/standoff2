import { NotificationNavigation } from '../notificationNavigation';

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

describe('NotificationNavigation', () => {
  let navigation: NotificationNavigation;

  beforeEach(() => {
    navigation = new NotificationNavigation(mockRouter);
    jest.clearAllMocks();
  });

  describe('MESSAGE notifications', () => {
    it('should navigate to sender profile for message notifications with sender', () => {
      const notification = {
        _id: '1',
        type: 'MESSAGE' as const,
        title: 'New message',
        content: 'You have a new message',
        senderId: {
          _id: 'sender123',
          name: 'John Doe',
          avatar: 'avatar.jpg'
        },
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/players/sender123');
    });

    it('should navigate to messages page for message notifications without sender', () => {
      const notification = {
        _id: '1',
        type: 'MESSAGE' as const,
        title: 'New message',
        content: 'You have a new message',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/messages');
    });
  });

  describe('SYSTEM notifications', () => {
    it('should navigate to matchmaking for match-related notifications', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'Match notification',
        content: 'Your match has been accepted',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/matchmaking');
    });

    it('should navigate to tournaments for tournament-related notifications', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'Tournament update',
        content: 'New tournament available',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/tournaments');
    });

    it('should navigate to specific squad for squad-related notifications with relatedClanId', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'Squad update',
        content: 'Your squad has been updated',
        relatedClanId: 'squad123',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/squads/squad123');
    });

    it('should navigate to squads page for squad-related notifications without relatedClanId', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'Squad update',
        content: 'Your squad has been updated',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/squads');
    });

    it('should navigate to bounty-coins for bounty-related notifications', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'Bounty update',
        content: 'You received bounty coins',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/bounty-coins');
    });

    it('should navigate to leaderboard for ranking notifications', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'Ranking update',
        content: 'Your ranking has changed',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/leaderboard');
    });

    it('should navigate to profile for profile-related notifications', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'Profile update',
        content: 'Your profile has been updated',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/profile');
    });

    it('should navigate to news for news-related notifications', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'News update',
        content: 'New news available',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/news');
    });

    it('should navigate to admin for admin-related notifications', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'Admin notification',
        content: 'Admin action required',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/admin');
    });

    it('should navigate to home for unknown system notifications', () => {
      const notification = {
        _id: '1',
        type: 'SYSTEM' as const,
        title: 'Unknown notification',
        content: 'Some random content',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  describe('INVITATION notifications', () => {
    it('should navigate to specific squad for squad invitations with relatedClanId', () => {
      const notification = {
        _id: '1',
        type: 'INVITATION' as const,
        title: 'Squad invitation',
        content: 'You have been invited to a squad',
        relatedClanId: 'squad123',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/squads/squad123');
    });

    it('should navigate to squads page for squad invitations without relatedClanId', () => {
      const notification = {
        _id: '1',
        type: 'INVITATION' as const,
        title: 'Squad invitation',
        content: 'You have been invited to a squad',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/squads');
    });

    it('should navigate to matchmaking for match invitations', () => {
      const notification = {
        _id: '1',
        type: 'INVITATION' as const,
        title: 'Match invitation',
        content: 'You have been invited to a match',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/matchmaking');
    });

    it('should navigate to tournaments for tournament invitations', () => {
      const notification = {
        _id: '1',
        type: 'INVITATION' as const,
        title: 'Tournament invitation',
        content: 'You have been invited to a tournament',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/tournaments');
    });
  });

  describe('Error handling', () => {
    it('should navigate to home on error', () => {
      const notification = {
        _id: '1',
        type: 'UNKNOWN' as any,
        title: 'Unknown notification',
        content: 'Some content',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z'
      };

      navigation.navigateToNotificationTarget(notification);

      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });
});
