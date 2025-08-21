export interface ClanMember {
  id: string;
  name: string;
  avatar: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
  joinedAt?: string;
}

export interface Clan {
  _id: string;
  name: string;
  tag: string;
  description?: string;
  logo?: string;
  leader?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  members?: ClanMember[];
  maxMembers: number;
  isPremium: boolean;
  createdAt: string;
  memberCount?: number;
  pendingInvitesCount?: number;
}
