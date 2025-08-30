import { FastifyInstance, FastifyPluginAsync } from "fastify";
import mongoose from "mongoose";
import BountyCoin from "../models/BountyCoin";
import Squad from "../models/Squad";

const bountyCoinRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  // Health check
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Bounty coin routes available",
      timestamp: new Date().toISOString(),
    });
  });

  // Get user's bounty coin balance
  fastify.get("/balance/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      // Check if user has bounty coin data
      let bountyCoinData = await BountyCoin.findOne({ userId }).lean();

      if (!bountyCoinData) {
        // If no bounty coin data exists, create it from squad data
        const squad = await Squad.findOne({
          $or: [{ leader: userId }, { members: userId }],
        })
          .select(
            "currentBountyCoins totalBountyCoinsEarned totalBountyCoinsSpent division"
          )
          .lean();

        if (squad) {
          const newBountyCoin = new BountyCoin({
            userId: userId,
            squadId: squad._id,
            balance: squad.currentBountyCoins || 0,
            totalEarned: squad.totalBountyCoinsEarned || 0,
            totalSpent: squad.totalBountyCoinsSpent || 0,
            transactions: [],
          });
          await newBountyCoin.save();
          bountyCoinData = await BountyCoin.findOne({ userId }).lean();
        } else {
          // Create default bounty coin data for user
          const newBountyCoin = new BountyCoin({
            userId: userId,
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
            transactions: [],
          });
          await newBountyCoin.save();
          bountyCoinData = await BountyCoin.findOne({ userId }).lean();
        }
      }

      return reply.send({
        success: true,
        data: bountyCoinData,
      });
    } catch (error) {
      console.error("Error fetching bounty coin balance:", error);
      return reply.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Get user's bounty coin transactions
  fastify.get("/transactions/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      const bountyCoinData = await BountyCoin.findOne({ userId }).lean();

      if (!bountyCoinData) {
        return reply.status(404).send({
          success: false,
          message: "Bounty coin data not found",
        });
      }

      return reply.send({
        success: true,
        data: bountyCoinData.transactions || [],
      });
    } catch (error) {
      console.error("Error fetching bounty coin transactions:", error);
      return reply.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Get squad's bounty coin summary
  fastify.get("/squad/:squadId", async (request, reply) => {
    try {
      const { squadId } = request.params as { squadId: string };

      const squad = await Squad.findById(squadId)
        .select(
          "name tag currentBountyCoins totalBountyCoinsEarned totalBountyCoinsSpent division"
        )
        .lean();

      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      return reply.send({
        success: true,
        data: {
          squadId: squad._id,
          squadName: squad.name,
          squadTag: squad.tag,
          currentBountyCoins: squad.currentBountyCoins || 0,
          totalEarned: squad.totalBountyCoinsEarned || 0,
          totalSpent: squad.totalBountyCoinsSpent || 0,
          division: squad.division || "SILVER",
        },
      });
    } catch (error) {
      console.error("Error fetching squad bounty coin summary:", error);
      return reply.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Get bounty coin leaderboard
  fastify.get("/leaderboard", async (request, reply) => {
    try {
      const { limit = "10" } = request.query as { limit?: string };

      const leaderboard = await Squad.find({})
        .select("name tag currentBountyCoins totalBountyCoinsEarned division")
        .sort({ currentBountyCoins: -1, totalBountyCoinsEarned: -1 })
        .limit(parseInt(limit) || 10)
        .lean();

      return reply.send({
        success: true,
        data: leaderboard.map((squad) => ({
          squadId: squad._id,
          squadName: squad.name,
          squadTag: squad.tag,
          currentBountyCoins: squad.currentBountyCoins || 0,
          totalEarned: squad.totalBountyCoinsEarned || 0,
          division: squad.division || "SILVER",
        })),
      });
    } catch (error) {
      console.error("Error fetching bounty coin leaderboard:", error);
      return reply.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Add transaction to user's bounty coin history
  fastify.post("/transaction", async (request, reply) => {
    try {
      const { userId, type, amount, description } = request.body as {
        userId: string;
        type: "earn" | "spend" | "purchase" | "withdraw";
        amount: number;
        description: string;
      };

      let bountyCoinData = await BountyCoin.findOne({ userId });

      if (!bountyCoinData) {
        // Create new bounty coin data if it doesn't exist
        bountyCoinData = new BountyCoin({
          userId,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          transactions: [],
        });
      }

      // Add transaction
      const transaction = {
        type,
        amount,
        description,
        timestamp: new Date(),
      };

      bountyCoinData.transactions.push(transaction);

      // Update balance and totals
      if (type === "earn" || type === "purchase") {
        bountyCoinData.balance += amount;
        bountyCoinData.totalEarned += amount;
      } else if (type === "spend" || type === "withdraw") {
        bountyCoinData.balance = Math.max(0, bountyCoinData.balance - amount);
        bountyCoinData.totalSpent += amount;
      }

      await bountyCoinData.save();

      return reply.send({
        success: true,
        data: {
          newBalance: bountyCoinData.balance,
          transaction,
        },
      });
    } catch (error) {
      console.error("Error adding bounty coin transaction:", error);
      return reply.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  });
};

export default bountyCoinRoutes;
