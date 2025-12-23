"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTECTION_CONFIG = exports.DIVISION_CONFIG = void 0;
exports.canUpgradeDivision = canUpgradeDivision;
exports.getNextDivision = getNextDivision;
exports.getPreviousDivision = getPreviousDivision;
exports.shouldDemoteDivision = shouldDemoteDivision;
exports.calculateBountyCoinsForMatch = calculateBountyCoinsForMatch;
exports.processDivisionChange = processDivisionChange;
exports.useProtection = useProtection;
exports.resetProtections = resetProtections;
exports.isValidDivision = isValidDivision;
exports.getDivisionInfo = getDivisionInfo;
const Squad_1 = require("../models/Squad");
exports.DIVISION_CONFIG = {
    [Squad_1.SquadDivision.SILVER]: {
        name: "Silver Division",
        minCoins: 0,
        maxCoins: 250,
        upgradeCost: 250,
        bountyCoinPrice: 10000,
        bountyCoinAmount: 50,
        deductionAmount: 25,
    },
    [Squad_1.SquadDivision.GOLD]: {
        name: "Gold Division",
        minCoins: 0,
        maxCoins: 750,
        upgradeCost: 750,
        bountyCoinPrice: 20000,
        bountyCoinAmount: 50,
        deductionAmount: 25,
    },
    [Squad_1.SquadDivision.DIAMOND]: {
        name: "Diamond Division",
        minCoins: 0,
        maxCoins: Infinity,
        upgradeCost: Infinity,
        bountyCoinPrice: 30000,
        bountyCoinAmount: 50,
        deductionAmount: 25,
    },
};
exports.PROTECTION_CONFIG = {
    maxProtections: 2,
    resetProtectionsOnWin: true,
    resetProtectionsOnDivisionChange: true,
};
function canUpgradeDivision(currentDivision, currentCoins) {
    const config = exports.DIVISION_CONFIG[currentDivision];
    return currentCoins >= config.upgradeCost;
}
function getNextDivision(currentDivision) {
    switch (currentDivision) {
        case Squad_1.SquadDivision.SILVER:
            return Squad_1.SquadDivision.GOLD;
        case Squad_1.SquadDivision.GOLD:
            return Squad_1.SquadDivision.DIAMOND;
        case Squad_1.SquadDivision.DIAMOND:
            return null;
        default:
            return null;
    }
}
function getPreviousDivision(currentDivision) {
    switch (currentDivision) {
        case Squad_1.SquadDivision.SILVER:
            return null;
        case Squad_1.SquadDivision.GOLD:
            return Squad_1.SquadDivision.SILVER;
        case Squad_1.SquadDivision.DIAMOND:
            return Squad_1.SquadDivision.GOLD;
        default:
            return null;
    }
}
function shouldDemoteDivision(currentDivision, currentCoins, protectionCount, consecutiveLosses) {
    if (protectionCount > 0) {
        return false;
    }
    if (currentCoins === 0 && consecutiveLosses >= 2) {
        return true;
    }
    return false;
}
function calculateBountyCoinsForMatch(division, isWinner) {
    const config = exports.DIVISION_CONFIG[division];
    if (isWinner) {
        return config.bountyCoinAmount;
    }
    else {
        return -config.deductionAmount;
    }
}
function processDivisionChange(currentDivision, currentCoins, isUpgrade) {
    if (isUpgrade) {
        const nextDivision = getNextDivision(currentDivision);
        if (!nextDivision) {
            throw new Error("Cannot upgrade further");
        }
        const config = exports.DIVISION_CONFIG[currentDivision];
        const coinsSpent = Math.min(config.upgradeCost, currentCoins);
        return {
            newDivision: nextDivision,
            newCoins: Math.max(0, currentCoins - coinsSpent),
            coinsSpent,
        };
    }
    else {
        const prevDivision = getPreviousDivision(currentDivision);
        if (!prevDivision) {
            throw new Error("Cannot demote further");
        }
        return {
            newDivision: prevDivision,
            newCoins: 0,
            coinsSpent: 0,
        };
    }
}
function useProtection(protectionCount) {
    return Math.max(0, protectionCount - 1);
}
function resetProtections() {
    return exports.PROTECTION_CONFIG.maxProtections;
}
function isValidDivision(division) {
    return Object.values(Squad_1.SquadDivision).includes(division);
}
function getDivisionInfo(division) {
    return exports.DIVISION_CONFIG[division];
}
