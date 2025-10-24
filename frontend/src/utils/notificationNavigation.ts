import { useRouter } from 'next/navigation';

export interface NotificationData {
  _id: string;
  type: 'MESSAGE' | 'SYSTEM' | 'INVITATION';
  title: string;
  content: string;
  senderId?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  relatedMessageId?: string;
  relatedClanId?: string;
  status: string;
  createdAt: string;
}

export class NotificationNavigation {
  private router: any;

  constructor(router: any) {
    this.router = router;
  }

  /**
   * Navigate to the appropriate page based on notification type and data
   */
  navigateToNotificationTarget(notification: NotificationData): void {
    try {
      switch (notification.type) {
        case 'MESSAGE':
          this.handleMessageNotification(notification);
          break;
        case 'SYSTEM':
          this.handleSystemNotification(notification);
          break;
        case 'INVITATION':
          this.handleInvitationNotification(notification);
          break;
        default:
          console.warn('Unknown notification type:', notification.type);
          // Default to home page for unknown types
          this.router.push('/');
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
      // Fallback to home page on error
      this.router.push('/');
    }
  }

  /**
   * Handle MESSAGE type notifications
   */
  private handleMessageNotification(notification: NotificationData): void {
    if (notification.senderId) {
      // For message notifications, we could navigate to a chat page
      // or open a chat modal. For now, let's navigate to the user's profile
      this.router.push(`/players/${notification.senderId._id}`);
    } else {
      // If no sender info, navigate to messages page
      this.router.push('/messages');
    }
  }

  /**
   * Handle SYSTEM type notifications
   */
  private handleSystemNotification(notification: NotificationData): void {
    const content = notification.content.toLowerCase();
    const title = notification.title.toLowerCase();

    // Check for match-related notifications
    if (content.includes('match') || content.includes('тоглолт') || title.includes('match')) {
      this.router.push('/matchmaking');
      return;
    }

    // Check for tournament-related notifications
    if (content.includes('tournament') || content.includes('тэмцээн') || title.includes('tournament')) {
      this.router.push('/tournaments');
      return;
    }

    // Check for squad-related notifications
    if (content.includes('squad') || content.includes('баг') || title.includes('squad')) {
      if (notification.relatedClanId) {
        this.router.push(`/squads/${notification.relatedClanId}`);
      } else {
        this.router.push('/squads');
      }
      return;
    }

    // Check for bounty coin notifications
    if (content.includes('bounty') || content.includes('coin') || title.includes('bounty')) {
      this.router.push('/bounty-coins');
      return;
    }

    // Check for leaderboard/ranking notifications
    if (content.includes('leaderboard') || content.includes('ranking') || content.includes('амжилт')) {
      this.router.push('/leaderboard');
      return;
    }

    // Check for profile-related notifications
    if (content.includes('profile') || content.includes('профайл') || title.includes('profile')) {
      this.router.push('/profile');
      return;
    }

    // Check for news notifications
    if (content.includes('news') || content.includes('мэдээ') || title.includes('news')) {
      this.router.push('/news');
      return;
    }

    // Check for admin notifications
    if (content.includes('admin') || content.includes('админ') || title.includes('admin')) {
      this.router.push('/admin');
      return;
    }

    // Default for system notifications - go to home
    this.router.push('/');
  }

  /**
   * Handle INVITATION type notifications
   */
  private handleInvitationNotification(notification: NotificationData): void {
    const content = notification.content.toLowerCase();
    const title = notification.title.toLowerCase();

    // Check for squad invitations
    if (content.includes('squad') || content.includes('баг') || title.includes('squad')) {
      if (notification.relatedClanId) {
        this.router.push(`/squads/${notification.relatedClanId}`);
      } else {
        this.router.push('/squads');
      }
      return;
    }

    // Check for match invitations
    if (content.includes('match') || content.includes('тоглолт') || title.includes('match')) {
      this.router.push('/matchmaking');
      return;
    }

    // Check for tournament invitations
    if (content.includes('tournament') || content.includes('тэмцээн') || title.includes('tournament')) {
      this.router.push('/tournaments');
      return;
    }

    // Default for invitation notifications - go to squads page
    this.router.push('/squads');
  }
}

/**
 * Hook to use notification navigation
 */
export const useNotificationNavigation = () => {
  const router = useRouter();
  const navigation = new NotificationNavigation(router);

  return {
    navigateToNotification: (notification: NotificationData) => {
      navigation.navigateToNotificationTarget(notification);
    }
  };
};
