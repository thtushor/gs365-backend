import { Request, Response } from "express";
import { BetResultModel } from "../models/betResult.model";
import { asyncHandler } from "../utils/asyncHandler";

export const getGameWiseStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log("🔄 Fetching game-wise statistics...");
    
    // Extract query parameters
    const {
      dateFrom,
      dateTo,
      gameId,
      gameName,
      providerId,
      categoryId,
      userId,
      status,
      limit = 50,
      offset = 0,
      sortBy = "totalBets",
      sortOrder = "desc",
    } = req.query;

    // Parse and validate parameters
    const filters = {
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      gameId: gameId ? Number(gameId) : undefined,
      gameName: gameName as string | undefined,
      providerId: providerId ? Number(providerId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      userId: userId? Number(userId):undefined,
      status: status as string | undefined,
      limit: Number(limit),
      offset: Number(offset),
      sortBy: sortBy as "totalBets" | "totalBetAmount" | "totalWinAmount" | "totalLossAmount" | "totalPlayers" | "winRate",
      sortOrder: sortOrder as "asc" | "desc",
    };

    // Validate date parameters
    if (filters.dateFrom && isNaN(filters.dateFrom.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid dateFrom parameter",
      });
    }

    if (filters.dateTo && isNaN(filters.dateTo.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid dateTo parameter",
      });
    }

    // Validate numeric parameters
    if (filters.limit < 1 || filters.limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    if (filters.offset < 0) {
      return res.status(400).json({
        success: false,
        message: "Offset must be non-negative",
      });
    }

    // Get game-wise statistics
    const result = await BetResultModel.getGameWiseStats(filters);

    console.log("✅ Game-wise statistics fetched successfully");

         res.status(200).json({
       success: true,
       message: "Game-wise statistics retrieved successfully",
       data: result.data,
       summary: result.summary,
       pagination: result.pagination,
      filters: {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        gameId: filters.gameId,
        gameName: filters.gameName,
        providerId: filters.providerId,
        categoryId: filters.categoryId,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching game-wise statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch game-wise statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export const getGameStatsById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    
    if (!gameId || isNaN(Number(gameId))) {
      return res.status(400).json({
        success: false,
        message: "Valid gameId is required",
      });
    }

    console.log(`🔄 Fetching statistics for game ID: ${gameId}`);

    const result = await BetResultModel.getGameWiseStats({
      gameId: Number(gameId),
      limit: 1,
      offset: 0,
    });

    if (result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game not found or no statistics available",
      });
    }

    console.log("✅ Game statistics fetched successfully");

    res.status(200).json({
      success: true,
      message: "Game statistics retrieved successfully",
      data: result.data[0],
    });
  } catch (error) {
    console.error("❌ Error fetching game statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch game statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
