export enum ProPlayerStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export interface ProPlayer {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    rating: number;
    totalReviews: number;
    bio?: string;
    gameExpertise?: string;
  };
  game: string;
  rank: string;
  currentRank: string;
  targetRank: string;
  price: number;
  estimatedTime: string;
  description: string;
  status: ProPlayerStatus;
  adminNotes?: string;
  approvedBy?: {
    _id: string;
    name: string;
  };
  approvedAt?: string;
  totalBoosts: number;
  successfulBoosts: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProPlayerApplication {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  game: string;
  rank: string;
  currentRank: string;
  targetRank: string;
  price: number;
  estimatedTime: string;
  description: string;
  status: ProPlayerStatus;
  adminNotes?: string;
  approvedBy?: {
    _id: string;
    name: string;
  };
  approvedAt?: string;
  totalBoosts: number;
  successfulBoosts: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProPlayerRequest {
  game: string;
  rank: string;
  currentRank: string;
  targetRank: string;
  price: number;
  estimatedTime: string;
  description: string;
}

export interface UpdateProPlayerRequest {
  game?: string;
  rank?: string;
  currentRank?: string;
  targetRank?: string;
  price?: number;
  estimatedTime?: string;
  description?: string;
}

export interface ProPlayerStats {
  stats: Array<{
    _id: string;
    count: number;
    totalBoosts: number;
    successfulBoosts: number;
    avgRating: number;
  }>;
  totalApplications: number;
  pendingApplications: number;
}

export interface ProPlayersResponse {
  proPlayers: ProPlayer[];
  pagination: {
    current: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApplicationsResponse {
  applications: ProPlayerApplication[];
  pagination: {
    current: number;
    total: number;
    hasMore: boolean;
  };
}
