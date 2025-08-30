import mongoose from "mongoose";
import TournamentMatch from "../models/TournamentMatch";
import TournamentRegistration from "../models/TournamentRegistration";

// Helper function to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate bracket matches based on tournament format
export function generateBracketMatches(
  squads: any[],
  format: string,
  tournamentId: string
): any[] {
  const matches = [];
  let matchNumber = 1;
  let round = 1;

  if (format === "Single Elimination") {
    const shuffledSquads = shuffleArray([...squads]);

    if (shuffledSquads.length % 2 !== 0) {
      shuffledSquads.push(null); // null represents a bye
    }

    for (let i = 0; i < shuffledSquads.length; i += 2) {
      if (shuffledSquads[i] && shuffledSquads[i + 1]) {
        matches.push({
          tournament: new mongoose.Types.ObjectId(tournamentId),
          matchNumber: matchNumber++,
          round: round,
          squad1: shuffledSquads[i]._id,
          squad2: shuffledSquads[i + 1]._id,
          status: "scheduled",
          scheduledTime: new Date(),
          bountyCoinAmount: 50,
          matchType: "normal",
        });
      } else if (shuffledSquads[i]) {
        matches.push({
          tournament: new mongoose.Types.ObjectId(tournamentId),
          matchNumber: matchNumber++,
          round: round,
          squad1: shuffledSquads[i]._id,
          squad2: null,
          status: "completed",
          winner: shuffledSquads[i]._id,
          matchType: "auto_win",
          bountyCoinAmount: 50,
        });
      }
    }
  } else if (format === "Double Elimination") {
    const shuffledSquads = shuffleArray([...squads]);

    // Winners bracket
    for (let i = 0; i < shuffledSquads.length; i += 2) {
      if (shuffledSquads[i] && shuffledSquads[i + 1]) {
        matches.push({
          tournament: new mongoose.Types.ObjectId(tournamentId),
          matchNumber: matchNumber++,
          round: round,
          squad1: shuffledSquads[i]._id,
          squad2: shuffledSquads[i + 1]._id,
          status: "scheduled",
          scheduledTime: new Date(),
          bountyCoinAmount: 50,
          matchType: "winners_bracket",
        });
      }
    }

    // Losers bracket will be generated after first round results
  } else if (format === "Round Robin") {
    const shuffledSquads = shuffleArray([...squads]);

    for (let i = 0; i < shuffledSquads.length; i++) {
      for (let j = i + 1; j < shuffledSquads.length; j++) {
        matches.push({
          tournament: new mongoose.Types.ObjectId(tournamentId),
          matchNumber: matchNumber++,
          round: round,
          squad1: shuffledSquads[i]._id,
          squad2: shuffledSquads[j]._id,
          status: "scheduled",
          scheduledTime: new Date(),
          bountyCoinAmount: 50,
          matchType: "round_robin",
        });
      }
    }
  }

  return matches;
}

// Generate tournament matches for a specific tournament
export async function generateTournamentMatches(
  tournamentId: string
): Promise<void> {
  try {
    // Get all registered squads for this tournament
    const registrations = await TournamentRegistration.find({
      tournament: tournamentId,
      status: "registered",
    }).populate("squad");

    if (registrations.length < 2) {
      throw new Error("Need at least 2 squads to generate matches");
    }

    const squads = registrations.map((reg) => reg.squad);

    // Get tournament format
    const { default: Tournament } = await import("../models/Tournament");
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Generate matches based on tournament format
    const matches = generateBracketMatches(
      squads,
      tournament.format,
      tournamentId
    );

    // Save matches to database
    await TournamentMatch.insertMany(matches);

    console.log(
      `Generated ${matches.length} matches for tournament ${tournamentId}`
    );
  } catch (error) {
    console.error("Error generating tournament matches:", error);
    throw error;
  }
}

// Get squad statistics for a tournament
export function getSquadStats(matches: any[]): Record<string, any> {
  const stats: Record<string, any> = {};

  matches.forEach((match) => {
    if (match.squad1 && match.squad2) {
      // Initialize squad stats if they don't exist
      if (!stats[match.squad1._id]) {
        stats[match.squad1._id] = { wins: 0, losses: 0, bountyCoins: 0 };
      }
      if (!stats[match.squad2._id]) {
        stats[match.squad2._id] = { wins: 0, losses: 0, bountyCoins: 0 };
      }

      // Update stats based on match result
      if (match.winner) {
        if (match.winner === match.squad1._id) {
          stats[match.squad1._id].wins++;
          stats[match.squad2._id].losses++;
          stats[match.squad1._id].bountyCoins += match.bountyCoinAmount || 50;
          stats[match.squad2._id].bountyCoins -= 25;
        } else {
          stats[match.squad2._id].wins++;
          stats[match.squad1._id].losses++;
          stats[match.squad2._id].bountyCoins += match.bountyCoinAmount || 50;
          stats[match.squad1._id].bountyCoins -= 25;
        }
      }
    }
  });

  return stats;
}
