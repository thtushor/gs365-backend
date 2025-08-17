import { Request, Response } from "express";
import { BetResultModel, BetResultFilters } from "../models/betResult.model";
import { asyncHandler } from "../utils/asyncHandler";

export const BetResultController = {
  // Get bet results with comprehensive filtering
  getBetResults: asyncHandler(async (req: Request, res: Response) => {
    try {
      const {
        userId,
        gameId,
        betStatus,
        playingStatus,
        dateFrom,
        dateTo,
        minBetAmount,
        maxBetAmount,
        gameName,
        providerName,
        isMobile,
        limit = 50,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filters object
      const filters: BetResultFilters = {
        limit: Number(limit),
        offset: Number(offset),
        sortBy: sortBy as 'createdAt' | 'betAmount' | 'userScore' | 'betPlacedAt',
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      // Add optional filters
      if (userId) filters.userId = Number(userId);
      if (gameId) filters.gameId = Number(gameId);
      if (betStatus) {
        const betStatusArray = Array.isArray(betStatus) ? betStatus : [betStatus];
        const validBetStatuses = ['win', 'loss', 'pending', 'cancelled'] as const;
        const filteredBetStatuses = betStatusArray
          .map(status => String(status))
          .filter((status): status is 'win' | 'loss' | 'pending' | 'cancelled' => 
            validBetStatuses.includes(status as any)
          );
        if (filteredBetStatuses.length > 0) {
          filters.betStatus = filteredBetStatuses;
        }
      }
      if (playingStatus) {
        const playingStatusArray = Array.isArray(playingStatus) ? playingStatus : [playingStatus];
        const validPlayingStatuses = ['playing', 'completed', 'abandoned'] as const;
        const filteredPlayingStatuses = playingStatusArray
          .map(status => String(status))
          .filter((status): status is 'playing' | 'completed' | 'abandoned' => 
            validPlayingStatuses.includes(status as any)
          );
        if (filteredPlayingStatuses.length > 0) {
          filters.playingStatus = filteredPlayingStatuses;
        }
      }
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);
      if (minBetAmount) filters.minBetAmount = Number(minBetAmount);
      if (maxBetAmount) filters.maxBetAmount = Number(maxBetAmount);
      if (gameName) filters.gameName = gameName as string;
      if (providerName) filters.providerName = providerName as string;
      if (isMobile !== undefined) filters.isMobile = isMobile === 'true';

      const result = await BetResultModel.getBetResultsWithFilters(filters);

      res.status(200).json({
        success: true,
        message: "Bet results retrieved successfully",
        data: result.data,
        pagination: {
          page: Number(offset),
          pageSize: Number(limit),
          totalPages: Math.ceil(result.total / Number(limit)),
          hasMore: result.total > (Number(offset) + Number(limit))
        },
        filters: result.filters,
        count: result.data.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve bet results",
        error: error.message,
      });
    }
  }),

  // Get bet result by ID
  getBetResultById: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Bet result ID is required",
        });
      }

      const betResult = await BetResultModel.getBetResultById(Number(id));

      if (!betResult) {
        return res.status(404).json({
          success: false,
          message: "Bet result not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Bet result retrieved successfully",
        data: betResult,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve bet result",
        error: error.message,
      });
    }
  }),

  // Get bet result statistics
  getBetResultStats: asyncHandler(async (req: Request, res: Response) => {
    try {
      const {
        userId,
        gameId,
        betStatus,
        dateFrom,
        dateTo
      } = req.query;

      // Build filters object for stats
      const filters: any = {};

      if (userId) filters.userId = Number(userId);
      if (gameId) filters.gameId = Number(gameId);
      if (betStatus) {
        const betStatusArray = Array.isArray(betStatus) ? betStatus : [betStatus];
        filters.betStatus = betStatusArray.map(status => String(status));
      }
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);

      const stats = await BetResultModel.getBetResultStats(filters);

      res.status(200).json({
        success: true,
        message: "Bet result statistics retrieved successfully",
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve bet result statistics",
        error: error.message,
      });
    }
  }),

  // Get bet results by user
  getBetResultsByUser: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const filters: BetResultFilters = {
        userId: Number(userId),
        limit: Number(limit),
        offset: Number(offset),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = await BetResultModel.getBetResultsWithFilters(filters);

      res.status(200).json({
        success: true,
        message: "User bet results retrieved successfully",
        data: result.data,
        pagination: {
          total: result.total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: result.total > (Number(offset) + Number(limit))
        },
        count: result.data.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user bet results",
        error: error.message,
      });
    }
  }),

  // Get bet results by game
  getBetResultsByGame: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!gameId) {
        return res.status(400).json({
          success: false,
          message: "Game ID is required",
        });
      }

      const filters: BetResultFilters = {
        gameId: Number(gameId),
        limit: Number(limit),
        offset: Number(offset),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = await BetResultModel.getBetResultsWithFilters(filters);

      res.status(200).json({
        success: true,
        message: "Game bet results retrieved successfully",
        data: result.data,
        pagination: {
          total: result.total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: result.total > (Number(offset) + Number(limit))
        },
        count: result.data.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve game bet results",
        error: error.message,
      });
    }
  }),

  // Get bet results by status
  getBetResultsByStatus: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const validStatuses = ['win', 'loss', 'pending', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be one of: win, loss, pending, cancelled",
        });
      }

      const filters: BetResultFilters = {
        betStatus: [status as 'win' | 'loss' | 'pending' | 'cancelled'],
        limit: Number(limit),
        offset: Number(offset),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = await BetResultModel.getBetResultsWithFilters(filters);

      res.status(200).json({
        success: true,
        message: "Bet results by status retrieved successfully",
        data: result.data,
        pagination: {
          total: result.total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: result.total > (Number(offset) + Number(limit))
        },
        count: result.data.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve bet results by status",
        error: error.message,
      });
    }
  }),
};