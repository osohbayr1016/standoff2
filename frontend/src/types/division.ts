export enum SquadDivision {
  SILVER = "SILVER",
  GOLD = "GOLD",
  DIAMOND = "DIAMOND",
}

export interface DivisionConfig {
  name: SquadDivision;
  displayName: string;
  requirements: string;
  upgradeCost: number | null;
  bountyCoinPrice: number;
  bountyCoinAmount: number;
  deductionAmount: number;
}

export interface SquadDivisionInfo {
  currentDivision: SquadDivision;
  currentBountyCoins: number;
  divisionConfig: DivisionConfig;
  nextDivision: SquadDivision | null;
  canUpgrade: boolean;
  protectionCount: number;
  consecutiveLosses: number;
  progress: number;
}

export interface DivisionLeaderboardEntry {
  _id: string;
  name: string;
  tag: string;
  currentBountyCoins: number;
  totalBountyCoinsEarned: number;
  level: number;
}

export interface DivisionLeaderboard {
  division: SquadDivision;
  entries: DivisionLeaderboardEntry[];
}

export interface BountyCoinPurchase {
  amount: number;
  cost: number;
  division: SquadDivision;
}
