import { SquadDivision } from "../models/Squad";

// Division System Constants
export const DIVISION_CONFIG = {
  [SquadDivision.SILVER]: {
    name: "Silver Division",
    minCoins: 0,
    maxCoins: 250,
    upgradeCost: 250,
    bountyCoinPrice: 10000, // MNT for 50 bounty coins
    bountyCoinAmount: 50,
    deductionAmount: 25,
  },
  [SquadDivision.GOLD]: {
    name: "Gold Division",
    minCoins: 0,
    maxCoins: 750,
    upgradeCost: 750,
    bountyCoinPrice: 20000, // MNT for 50 bounty coins
    bountyCoinAmount: 50,
    deductionAmount: 25,
  },
  [SquadDivision.DIAMOND]: {
    name: "Diamond Division",
    minCoins: 0,
    maxCoins: Infinity,
    upgradeCost: Infinity, // No upgrade needed
    bountyCoinPrice: 30000, // MNT for 50 bounty coins
    bountyCoinAmount: 50,
    deductionAmount: 25,
  },
};

// Protection System
export const PROTECTION_CONFIG = {
  maxProtections: 2,
  resetProtectionsOnWin: true,
  resetProtectionsOnDivisionChange: true,
};

// Division Upgrade Logic
export function canUpgradeDivision(
  currentDivision: SquadDivision,
  currentCoins: number
): boolean {
  const config = DIVISION_CONFIG[currentDivision];
  return currentCoins >= config.upgradeCost;
}

export function getNextDivision(
  currentDivision: SquadDivision
): SquadDivision | null {
  switch (currentDivision) {
    case SquadDivision.SILVER:
      return SquadDivision.GOLD;
    case SquadDivision.GOLD:
      return SquadDivision.DIAMOND;
    case SquadDivision.DIAMOND:
      return null; // Already at highest division
    default:
      return null;
  }
}

export function getPreviousDivision(
  currentDivision: SquadDivision
): SquadDivision | null {
  switch (currentDivision) {
    case SquadDivision.SILVER:
      return null; // Already at lowest division
    case SquadDivision.GOLD:
      return SquadDivision.SILVER;
    case SquadDivision.DIAMOND:
      return SquadDivision.GOLD;
    default:
      return null;
  }
}

// Division Demotion Logic
export function shouldDemoteDivision(
  currentDivision: SquadDivision,
  currentCoins: number,
  protectionCount: number,
  consecutiveLosses: number
): boolean {
  // If has protection, don't demote
  if (protectionCount > 0) {
    return false;
  }

  // If at 0 coins and lost 2 consecutive matches without protection
  if (currentCoins === 0 && consecutiveLosses >= 2) {
    return true;
  }

  return false;
}

// Bounty Coin Calculations
export function calculateBountyCoinsForMatch(
  division: SquadDivision,
  isWinner: boolean
): number {
  const config = DIVISION_CONFIG[division];

  if (isWinner) {
    return config.bountyCoinAmount;
  } else {
    return -config.deductionAmount;
  }
}

// Division Change Logic
export function processDivisionChange(
  currentDivision: SquadDivision,
  currentCoins: number,
  isUpgrade: boolean
): {
  newDivision: SquadDivision;
  newCoins: number;
  coinsSpent: number;
} {
  if (isUpgrade) {
    const nextDivision = getNextDivision(currentDivision);
    if (!nextDivision) {
      throw new Error("Cannot upgrade further");
    }

    const config = DIVISION_CONFIG[currentDivision];
    // Spend only what is required up to the current coin balance
    const coinsSpent = Math.min(config.upgradeCost, currentCoins);

    return {
      newDivision: nextDivision,
      // Remaining coins carry over after spending the upgrade cost
      newCoins: Math.max(0, currentCoins - coinsSpent),
      coinsSpent,
    };
  } else {
    const prevDivision = getPreviousDivision(currentDivision);
    if (!prevDivision) {
      throw new Error("Cannot demote further");
    }

    return {
      newDivision: prevDivision,
      newCoins: 0, // Reset to 0 in new division
      coinsSpent: 0,
    };
  }
}

// Protection Management
export function useProtection(protectionCount: number): number {
  return Math.max(0, protectionCount - 1);
}

export function resetProtections(): number {
  return PROTECTION_CONFIG.maxProtections;
}

// Validation Functions
export function isValidDivision(division: string): division is SquadDivision {
  return Object.values(SquadDivision).includes(division as SquadDivision);
}

export function getDivisionInfo(division: SquadDivision) {
  return DIVISION_CONFIG[division];
}
