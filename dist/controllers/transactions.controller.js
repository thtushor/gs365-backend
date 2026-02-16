"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkWithdrawCapability = exports.updateAffiliateWithdrawStatus = exports.updateTransactionStatus = exports.getTransactions = exports.createWithdraw = exports.createAffiliateWithdraw = exports.claimSpinBonus = exports.claimNotification = exports.createDeposit = void 0;
const connection_1 = require("../db/connection");
const transactions_1 = require("../db/schema/transactions");
const promotions_1 = require("../db/schema/promotions");
const settings_1 = require("../db/schema/settings");
const turnover_1 = require("../db/schema/turnover");
const users_1 = require("../db/schema/users");
const games_1 = require("../db/schema/games");
const currency_1 = require("../db/schema/currency");
const drizzle_orm_1 = require("drizzle-orm");
const refCode_1 = require("../utils/refCode");
const schema_1 = require("../db/schema");
const balance_model_1 = require("../models/balance.model");
const adminMainBalance_model_1 = require("../models/adminMainBalance.model");
const notifications_1 = require("../db/schema/notifications");
const __1 = require("..");
const spinBonusModel_1 = require("../models/spinBonusModel");
const createDeposit = async (req, res) => {
    try {
        const { userId, amount, currencyId, promotionId, paymentGatewayProviderAccountId, gatewayId, notes, givenTransactionId, attachment, } = req.body;
        const user = req.user;
        if (!userId || !amount || !currencyId) {
            return res.status(400).json({
                status: false,
                message: "userId, amount and currencyId are required",
            });
        }
        const customTransactionId = await (0, refCode_1.generateUniqueTransactionId)();
        const [promotionData] = promotionId
            ? await connection_1.db
                .select()
                .from(promotions_1.promotions)
                .where((0, drizzle_orm_1.eq)(promotions_1.promotions.id, promotionId))
                .limit(1)
            : [];
        const bonusAmount = promotionId
            ? Number(amount) * (promotionData.bonus / 100)
            : 0;
        const [gatewayData] = gatewayId
            ? await connection_1.db
                .select({
                paymentMethod: schema_1.paymentMethods,
            })
                .from(schema_1.paymentGateway)
                .leftJoin(schema_1.paymentMethods, (0, drizzle_orm_1.eq)(schema_1.paymentGateway.methodId, schema_1.paymentMethods.id))
                .where((0, drizzle_orm_1.eq)(schema_1.paymentGateway.id, gatewayId))
                .limit(1)
            : [];
        const paymentMethodName = gatewayData?.paymentMethod?.name?.toLowerCase();
        const [currencyData] = paymentMethodName?.includes("international") ||
            paymentMethodName?.includes("crypto")
            ? await connection_1.db
                .select()
                .from(currency_1.currencies)
                .where((0, drizzle_orm_1.eq)(currency_1.currencies.code, "USD"))
                .limit(1)
            : await connection_1.db
                .select()
                .from(currency_1.currencies)
                .where((0, drizzle_orm_1.eq)(currency_1.currencies.code, "BDT"))
                .limit(1);
        // console.log({ paymentMethodName })
        const [currentConversionRate] = await connection_1.db
            .select({
            rate: settings_1.settings.conversionRate,
        })
            .from(settings_1.settings)
            .limit(1);
        // if (paymentMethodName) {
        //   throw new Error("Data error")
        // }
        const convertedAmount = currencyData?.code === "BDT"
            ? Number(amount || 0)
            : Number(amount) * Number(currentConversionRate?.rate || 1);
        const convertedBonusAmount = currencyData?.code === "BDT"
            ? Number(bonusAmount || 0)
            : Number(bonusAmount) * Number(currentConversionRate?.rate || 1);
        const [createdTxn] = await connection_1.db.insert(transactions_1.transactions).values({
            userId: Number(userId),
            type: "deposit",
            paymentGatewayId: gatewayId,
            amount: Number(convertedAmount),
            currencyId: currencyData?.id,
            promotionId: promotionId ? Number(promotionId) : null,
            bonusAmount: Number(convertedBonusAmount?.toFixed(2)),
            status: "pending",
            customTransactionId,
            paymentGatewayProviderAccountId: paymentGatewayProviderAccountId
                ? Number(paymentGatewayProviderAccountId)
                : null,
            notes: notes ?? null,
            givenTransactionId: givenTransactionId ?? null,
            attachment: attachment ?? null,
            processedBy: user?.userType === "admin" ? user?.id : null,
            processedByUser: user?.userType === "user" ? user?.id : null,
            conversionRate: currentConversionRate.rate ?? null,
        });
        await connection_1.db.insert(notifications_1.notifications).values({
            notificationType: "admin_player_transaction",
            title: `New deposit transaction from user #${userId}`,
            description: `
        A new deposit transaction has been created by user <strong> ${user.username} (#${userId})</strong>.<br/>
        Amount: <strong>${convertedAmount} ${currencyData?.code}</strong><br/>
        Bonus: <strong>${convertedBonusAmount?.toFixed(2) ?? 0} ${currencyData?.code}</strong><br/>
        Payment Gateway: <strong>${gatewayId}</strong><br/>
        Transaction ID: <strong>${customTransactionId}</strong>
        Promotion ID: <strong>${promotionId}</strong>
      `,
            amount: String(0), // ✅ decimal column → string
            turnoverMultiply: null,
            playerIds: String(userId),
            promotionId: promotionId ? Number(promotionId) : null,
            link: `/players/${userId}/profile/transactions`,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: "active",
            createdBy: Number(user?.id ?? 0), // ✅ ensure numeric int
        });
        __1.io.emit("admin-notifications", {
            notificationType: "admin_player_transaction",
            title: `New deposit transaction from user #${userId}`,
            description: `
        A new deposit transaction has been created by user <strong> ${user.username} (#${userId})</strong>.<br/>
        Amount: <strong>${convertedAmount} ${currencyData?.code}</strong><br/>
        Bonus: <strong>${convertedBonusAmount?.toFixed(2) ?? 0} ${currencyData?.code}</strong><br/>
        Payment Gateway: <strong>${gatewayId}</strong><br/>
        Transaction ID: <strong>${customTransactionId}</strong>
        Promotion ID: <strong>${promotionId}</strong>
      `,
        });
        return res.status(201).json({
            status: true,
            message: "Deposit created. Pending approval.",
            data: {
                transactionId: createdTxn.insertId,
                customTransactionId,
            },
        });
    }
    catch (err) {
        console.error("createDeposit error", err);
        return res
            .status(500)
            .json({ status: false, message: "Internal Server Error", errors: err });
    }
};
exports.createDeposit = createDeposit;
const claimNotification = async (req, res) => {
    try {
        const { notificationId, userId } = req.body;
        if (!notificationId || !userId) {
            return res.status(400).json({
                status: false,
                message: "notificationId and userId are required",
            });
        }
        // Fetch notification and validate
        const [note] = await connection_1.db
            .select()
            .from(notifications_1.notifications)
            .where((0, drizzle_orm_1.eq)(notifications_1.notifications.id, Number(notificationId)));
        if (!note) {
            return res
                .status(404)
                .json({ status: false, message: "Notification not found" });
        }
        if (note.notificationType !== "claimable") {
            return res
                .status(400)
                .json({ status: false, message: "Notification is not claimable" });
        }
        // Check dates are valid to claim
        const now = new Date();
        if (note.startDate && now < new Date(note.startDate)) {
            return res
                .status(400)
                .json({ status: false, message: "Notification not started yet" });
        }
        if (note.endDate && now > new Date(note.endDate)) {
            return res
                .status(400)
                .json({ status: false, message: "Notification has expired" });
        }
        // Check user is targeted
        if (note.playerIds) {
            const ids = String(note.playerIds)
                .split(",")
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n));
            if (ids.length && !ids.includes(Number(userId))) {
                return res.status(403).json({
                    status: false,
                    message: "User not eligible for this notification",
                });
            }
        }
        const claimAmount = Number(note.amount || 0);
        const promotionId = Number(note.promotionId || 0);
        const [promotionData] = promotionId
            ? await connection_1.db
                .select()
                .from(promotions_1.promotions)
                .where((0, drizzle_orm_1.eq)(promotions_1.promotions.id, promotionId))
                .limit(1)
            : [];
        const promotionTurnoverMultiply = promotionData
            ? Number(promotionData.turnoverMultiply || 0)
            : 0;
        const promotionBonus = promotionData ? Number(promotionData.bonus || 0) : 0;
        const claimableBonus = claimAmount * (promotionBonus / 100);
        const claimableBonusTurnover = claimableBonus * (promotionTurnoverMultiply || 0);
        const turnoverMultiply = Number(note.turnoverMultiply || 0);
        if (!(claimAmount > 0) || !(turnoverMultiply >= 0)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid claim configuration" });
        }
        const [settingsData] = await connection_1.db.select().from(settings_1.settings).limit(1);
        // Resolve currency: prefer user's currency; fallback to BDT
        const [userRow] = await connection_1.db
            .select({
            id: users_1.users.id,
            currencyId: users_1.users.currency_id,
            userName: users_1.users.username,
        })
            .from(users_1.users)
            .where((0, drizzle_orm_1.eq)(users_1.users.id, Number(userId)));
        if (!userRow) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        const [currencyData] = await connection_1.db
            .select()
            .from(currency_1.currencies)
            .where((0, drizzle_orm_1.eq)(currency_1.currencies.code, "BDT"))
            .limit(1);
        // We will treat claimed amount as a deposit with promotion-like turnover
        const customTransactionId = await (0, refCode_1.generateUniqueTransactionId)();
        const trxResult = await connection_1.db.transaction(async (tx) => {
            // Create transaction (deposit)
            const [createdTxn] = await tx.insert(transactions_1.transactions).values({
                userId: Number(userId),
                type: "deposit",
                amount: claimAmount,
                bonusAmount: claimableBonus,
                currencyId: currencyData?.id || null,
                status: "approved", // immediate credit for claim
                customTransactionId,
                promotionId: promotionId ? Number(promotionId) : null,
                processedByUser: Number(userId),
                conversionRate: settingsData?.conversionRate || null,
                notes: `Claimed from notification ${notificationId}`,
            });
            const transactionId = createdTxn.insertId ?? createdTxn?.id;
            // Create turnover for the claim (promotion type semantics)
            const targetTurnover = Number((claimAmount * (turnoverMultiply || 0)).toFixed(2));
            if (targetTurnover > 0) {
                await tx.insert(turnover_1.turnover).values({
                    userId: Number(userId),
                    transactionId: transactionId,
                    type: "default",
                    status: "active",
                    turnoverName: `Claim turnover from notification ${notificationId}`,
                    depositAmount: claimAmount.toString(),
                    targetTurnover: targetTurnover.toString(),
                    remainingTurnover: targetTurnover.toString(),
                });
            }
            if (claimableBonusTurnover > 0) {
                await tx.insert(turnover_1.turnover).values({
                    userId: Number(userId),
                    transactionId: transactionId,
                    type: "promotion",
                    status: "active",
                    turnoverName: `Claim turnover from promotion ${promotionId}`,
                    depositAmount: claimableBonus.toString(),
                    targetTurnover: claimableBonusTurnover.toString(),
                    remainingTurnover: claimableBonusTurnover.toString(),
                });
            }
            // Admin main balance entry for promotion payout-like behavior
            await adminMainBalance_model_1.AdminMainBalanceModel.create({
                amount: claimAmount,
                type: "promotion",
                status: "approved",
                transactionId,
                currencyId: currencyData?.id || undefined,
                promotionName: `Claim from notification ${notificationId}`,
                notes: `Claim credit to user ${userId}`,
            }, tx);
            await adminMainBalance_model_1.AdminMainBalanceModel.create({
                amount: claimableBonus,
                type: "promotion",
                status: "approved",
                transactionId,
                currencyId: currencyData?.id || undefined,
                promotionName: `Claim from promotion ${promotionId}`,
                notes: `Claim credit to user ${userId}`,
            }, tx);
            // update
            await tx
                .update(notifications_1.notifications)
                .set({ status: "claimed" })
                .where((0, drizzle_orm_1.eq)(notifications_1.notifications.id, Number(notificationId)));
            // ✅ Create an admin notification for this claim deposit
            await tx.insert(notifications_1.notifications).values({
                notificationType: "admin_player_transaction",
                title: `New claim transaction from user #${userId}`,
                description: `
          A new claim deposit has been created by user <strong>${userRow.userName} (#${userId})</strong>.<br/>
          Amount: <strong>${claimAmount.toFixed(2)} ${currencyData?.code}</strong><br/>
          Bonus: <strong>${claimableBonus.toFixed(2)} ${currencyData?.code}</strong><br/>
          Transaction ID: <strong>${customTransactionId}</strong><br/>
          Promotion ID: <strong>${promotionId || "N/A"}</strong>
        `,
                amount: String(0),
                turnoverMultiply: null,
                playerIds: String(userId),
                promotionId: promotionId ? Number(promotionId) : null,
                link: `/players/${userId}/profile/transactions`,
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                status: "active",
                createdBy: Number(userId),
            });
            __1.io.emit("admin-notifications", {
                notificationType: "admin_player_transaction",
                title: `New claim transaction from user #${userId}`,
                description: `
          A new claim deposit has been created by user <strong>${userRow.userName} (#${userId})</strong>.<br/>
          Amount: <strong>${claimAmount.toFixed(2)} ${currencyData?.code}</strong><br/>
          Bonus: <strong>${claimableBonus.toFixed(2)} ${currencyData?.code}</strong><br/>
          Transaction ID: <strong>${customTransactionId}</strong><br/>
          Promotion ID: <strong>${promotionId || "N/A"}</strong>
        `,
            });
            return { transactionId };
        });
        return res.status(200).json({
            status: true,
            message: "Notification claimed successfully",
            data: {
                transactionId: trxResult.transactionId,
                amount: claimAmount,
                turnoverMultiply,
            },
        });
    }
    catch (err) {
        console.error("claimNotification error", err);
        return res
            .status(500)
            .json({ status: false, message: "Internal Server Error", errors: err });
    }
};
exports.claimNotification = claimNotification;
const claimSpinBonus = async (req, res) => {
    try {
        const { spinBonusAmount, isDailySpinCompleted, isSpinForcedByAdmin, lastSpinDate, isForcedSpinComplete, spinTurnOverMultiply, userId, } = req.body;
        // Resolve currency: prefer user's currency; fallback to BDT
        const [userRow] = await connection_1.db
            .select({
            id: users_1.users.id,
            currencyId: users_1.users.currency_id,
            userName: users_1.users.username,
            isDailySpinCompleted: users_1.users.isDailySpinCompleted,
            isSpinForcedByAdmin: users_1.users.isSpinForcedByAdmin,
            lastSpinDate: users_1.users.lastSpinDate,
            isForcedSpinComplete: users_1.users.isForcedSpinComplete,
        })
            .from(users_1.users)
            .for("update")
            .where((0, drizzle_orm_1.eq)(users_1.users.id, Number(userId)));
        if (!userRow) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        const claimAmount = spinBonusAmount;
        const turnoverMultiply = spinTurnOverMultiply;
        const [settingsData] = await connection_1.db.select().from(settings_1.settings).limit(1);
        const [currencyData] = await connection_1.db
            .select()
            .from(currency_1.currencies)
            .where((0, drizzle_orm_1.eq)(currency_1.currencies.code, "BDT"))
            .limit(1);
        // We will treat claimed amount as a deposit with promotion-like turnover
        const customTransactionId = await (0, refCode_1.generateUniqueTransactionId)();
        const trxResult = await connection_1.db.transaction(async (tx) => {
            // Create transaction (spin bonus)
            const [createdTxn] = await tx.insert(transactions_1.transactions).values({
                userId: Number(userId),
                type: "spin_bonus",
                amount: claimAmount,
                bonusAmount: 0,
                currencyId: currencyData?.id || null,
                status: "approved", // immediate credit for claim
                customTransactionId,
                promotionId: null,
                processedByUser: Number(userId),
                conversionRate: settingsData?.conversionRate || 0,
                notes: `Spin bonus claimed for user ${userId}`,
            });
            const transactionId = createdTxn.insertId ?? createdTxn?.id;
            // Create turnover for the claim (promotion type semantics)
            const targetTurnover = Number((claimAmount * (turnoverMultiply || 0)).toFixed(2));
            if (targetTurnover > 0) {
                await tx.insert(turnover_1.turnover).values({
                    userId: Number(userId),
                    transactionId: transactionId,
                    type: "spin_bonus",
                    status: "active",
                    turnoverName: `Claim turnover from spin bonus of user ${userId}`,
                    depositAmount: claimAmount.toString(),
                    targetTurnover: targetTurnover.toString(),
                    remainingTurnover: targetTurnover.toString(),
                });
            }
            console.log(currencyData);
            // Admin main balance entry for promotion payout-like behavior
            await adminMainBalance_model_1.AdminMainBalanceModel.create({
                amount: claimAmount,
                type: "spin_bonus",
                status: "approved",
                transactionId,
                currencyId: currencyData?.id || undefined,
                notes: `Claimed spin bonus for user ${userId}`,
            }, tx);
            await tx
                .update(users_1.users)
                .set({
                isDailySpinCompleted: isDailySpinCompleted,
                isSpinForcedByAdmin: isSpinForcedByAdmin,
                lastSpinDate: new Date(lastSpinDate),
                isForcedSpinComplete: isForcedSpinComplete,
            })
                .where((0, drizzle_orm_1.eq)(users_1.users.id, userId));
            await spinBonusModel_1.SpinBonusModel.create({
                userId,
                transactionId,
                amount: claimAmount,
                turnoverMultiply: spinTurnOverMultiply,
                conversionRate: settingsData?.conversionRate || null,
            }, tx);
            // ✅ Create an admin notification for this claim deposit
            await tx.insert(notifications_1.notifications).values({
                notificationType: "admin_player_transaction",
                title: `New spin bonus claimed for user #${userId}`,
                description: `
          A new claim spin bonus has been created by user <strong>${userRow.userName} (#${userId})</strong>.<br/>
          Amount: <strong>${claimAmount} ${currencyData?.code}</strong><br/>
          Turnover: <strong>${targetTurnover} ${currencyData?.code}</strong><br/>
          Transaction ID: <strong>${customTransactionId}</strong><br/>
        `,
                amount: String(0),
                turnoverMultiply: spinTurnOverMultiply,
                playerIds: String(userId),
                promotionId: null,
                link: `/players/${userId}/profile/transactions`,
                startDate: new Date(),
                endDate: new Date(),
                status: "claimed",
                createdBy: Number(userId),
            });
            __1.io.emit("admin-notifications", {
                notificationType: "admin_player_transaction",
                title: `New claim transaction from user #${userId}`,
                description: `
          A new claim spin bonus has been created by user <strong>${userRow.userName} (#${userId})</strong>.<br/>
          Amount: <strong>${claimAmount} ${currencyData?.code}</strong><br/>
          Turnover: <strong>${spinTurnOverMultiply} ${currencyData?.code}</strong><br/>
          Transaction ID: <strong>${customTransactionId}</strong><br/>
        `,
            });
            return { transactionId };
        });
        return res.status(200).json({
            status: true,
            message: "Spin bonus claimed successfully",
            data: {
                transactionId: trxResult.transactionId,
                amount: claimAmount,
                turnoverMultiply,
            },
        });
    }
    catch (err) {
        console.error("Spin bonus claimed error", err);
        return res
            .status(500)
            .json({ status: false, message: "Internal Server Error", errors: err });
    }
};
exports.claimSpinBonus = claimSpinBonus;
const createAffiliateWithdraw = async (req, res) => {
    try {
        const { affiliateId, amount, currencyId, withdrawMethod, // "bank" or "wallet"
        notes, attachment, 
        // Bank fields
        accountNumber, accountHolderName, bankName, branchName, branchAddress, swiftCode, iban, 
        // Wallet fields
        walletAddress, network, remainingBalance, } = req.body;
        const user = req.user;
        // ✅ Validate basic fields
        if (!affiliateId || !amount || !withdrawMethod) {
            return res.status(400).json({
                status: false,
                message: "Affiliate Id, Amount, Withdraw Method or Currencies are required",
            });
        }
        if (typeof remainingBalance !== "number" || remainingBalance < 0) {
            return res.status(400).json({
                status: false,
                message: "remainingBalance is not valid",
            });
        }
        // ✅ Validate method-specific fields
        if (withdrawMethod === "bank") {
            if (!accountNumber || !accountHolderName || !bankName) {
                return res.status(400).json({
                    status: false,
                    message: "For bank withdrawal, accountNumber, accountHolderName, and bankName are required",
                });
            }
        }
        else if (withdrawMethod === "wallet") {
            if (!walletAddress || !network) {
                return res.status(400).json({
                    status: false,
                    message: "For wallet withdrawal, walletAddress and network are required",
                });
            }
        }
        const customTransactionId = await (0, refCode_1.generateUniqueTransactionId)();
        const result = await connection_1.db.transaction(async (tx) => {
            await tx
                .update(schema_1.commission)
                .set({ status: "paid" })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commission.adminUserId, Number(affiliateId)), (0, drizzle_orm_1.eq)(schema_1.commission.status, "approved")));
            await tx
                .update(schema_1.adminUsers)
                .set({
                remainingBalance: remainingBalance,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, Number(affiliateId)));
            const [createdTxn] = await tx.insert(transactions_1.transactions).values({
                affiliateId: Number(affiliateId),
                type: "withdraw",
                amount: Number(amount),
                currencyId: Number(currencyId),
                status: "pending",
                customTransactionId,
                notes: notes ?? null,
                attachment: attachment ?? null,
                withdrawMethod,
                accountNumber: accountNumber ?? null,
                accountHolderName: accountHolderName ?? null,
                bankName: bankName ?? null,
                branchName: branchName ?? null,
                branchAddress: branchAddress ?? null,
                swiftCode: swiftCode ?? null,
                iban: iban ?? null,
                walletAddress: walletAddress ?? null,
                network: network ?? null,
            });
            // ✅ Create admin notification
            await tx.insert(notifications_1.notifications).values({
                notificationType: "admin_affiliate_transaction",
                title: `New withdrawal request from affiliate #${affiliateId}`,
                description: `
          Affiliate ID <strong>#${affiliateId})</strong> has requested a withdrawal.<br/>
          Amount: <strong>${amount.toFixed(2)}</strong><br/>
          Method: <strong>${withdrawMethod}</strong><br/>
          ${withdrawMethod === "bank"
                    ? `
              Bank: <strong>${bankName ?? "N/A"}</strong><br/>
              Account Holder: <strong>${accountHolderName ?? "N/A"}</strong><br/>
              Account No: <strong>${accountNumber ?? "N/A"}</strong><br/>`
                    : `
              Wallet Address: <strong>${walletAddress ?? "N/A"}</strong><br/>
              Network: <strong>${network ?? "N/A"}</strong><br/>`}
          Transaction ID: <strong>${customTransactionId}</strong>
        `,
                amount: String(amount),
                turnoverMultiply: null,
                playerIds: String(affiliateId),
                promotionId: null,
                link: `/affiliate-list/${affiliateId}/withdraw-history`,
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                status: "active",
                createdBy: Number(user?.id ?? 0),
            });
            __1.io.emit("admin-notifications", {
                notificationType: "admin_affiliate_transaction",
                title: `New withdrawal request from affiliate #${affiliateId}`,
                description: `
          Affiliate ID <strong>#${affiliateId})</strong> has requested a withdrawal.<br/>
          Amount: <strong>${amount.toFixed(2)}</strong><br/>
          Method: <strong>${withdrawMethod}</strong><br/>
          ${withdrawMethod === "bank"
                    ? `
              Bank: <strong>${bankName ?? "N/A"}</strong><br/>
              Account Holder: <strong>${accountHolderName ?? "N/A"}</strong><br/>
              Account No: <strong>${accountNumber ?? "N/A"}</strong><br/>`
                    : `
              Wallet Address: <strong>${walletAddress ?? "N/A"}</strong><br/>
              Network: <strong>${network ?? "N/A"}</strong><br/>`}
          Transaction ID: <strong>${customTransactionId}</strong>
        `,
            });
            const transactionId = createdTxn.insertId ?? createdTxn?.id;
            return { transactionId, customTransactionId };
        });
        return res.status(201).json({
            status: true,
            message: "Withdrawal request created successfully",
            data: result,
        });
    }
    catch (err) {
        console.error("createAffiliateWithdraw error", err);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            errors: err,
        });
    }
};
exports.createAffiliateWithdraw = createAffiliateWithdraw;
const createWithdraw = async (req, res) => {
    try {
        const { userId, amount, currencyId, paymentGatewayId, notes, attachment, 
        // Bank-specific fields
        accountNumber, accountHolderName, bankName, branchName, branchAddress, swiftCode, iban, 
        // Wallet-specific fields
        walletAddress, network, } = req.body;
        const user = req.user;
        if (!userId || !amount || !currencyId || !paymentGatewayId) {
            return res.status(400).json({
                status: false,
                message: "userId, paymentGatewayId, amount and currencyId are required",
            });
        }
        // Validate amount is positive
        if (Number(amount) <= 0) {
            return res.status(400).json({
                status: false,
                message: "Amount must be greater than 0",
            });
        }
        // Check if user exists
        const [userExists] = await connection_1.db
            .select()
            .from(users_1.users)
            .where((0, drizzle_orm_1.eq)(users_1.users.id, userId));
        if (!userExists) {
            return res.status(200).json({
                status: false,
                message: "User not found",
            });
        }
        const [getGateWayData] = await connection_1.db
            .select({
            id: schema_1.paymentGateway.id,
            name: schema_1.paymentGateway.name,
            paymentMethodName: schema_1.paymentMethods?.name,
        })
            .from(schema_1.paymentGateway)
            .leftJoin(schema_1.paymentMethods, (0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, schema_1.paymentGateway.methodId))
            .where((0, drizzle_orm_1.eq)(schema_1.paymentGateway.id, paymentGatewayId));
        console.log({ getGateWayData });
        if (!getGateWayData?.id) {
            return res.status(200).json({
                status: false,
                message: "Gateway not found",
            });
        }
        // Get minimum withdrawable balance from settings
        const [settingsRow] = await connection_1.db.select().from(settings_1.settings).limit(1);
        const minWithdrawableBalance = Number(settingsRow?.minWithdrawableBalance || 25000);
        // Check for pending turnover
        const pendingTurnover = await connection_1.db
            .select({
            id: turnover_1.turnover.id,
            remainingTurnover: turnover_1.turnover.remainingTurnover,
            targetTurnover: turnover_1.turnover.targetTurnover,
            type: turnover_1.turnover.type,
            status: turnover_1.turnover.status,
        })
            .from(turnover_1.turnover)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(turnover_1.turnover.userId, userId), (0, drizzle_orm_1.eq)(turnover_1.turnover.status, "active")));
        // Calculate user's current balance using BalanceModel
        const playerBalance = await balance_model_1.BalanceModel.calculatePlayerBalance(userId);
        const currentBalance = playerBalance.currentBalance || 0;
        // Check if user has sufficient withdrawable balance
        const hasSufficientBalance = currentBalance >= minWithdrawableBalance;
        // Check if there are any pending turnovers
        const hasPendingTurnover = pendingTurnover.length > 0;
        // User can withdraw if: sufficient balance AND no pending turnover
        const canWithdraw = hasSufficientBalance &&
            !hasPendingTurnover &&
            userExists.kyc_status !== "required";
        if (!canWithdraw) {
            let withdrawReason = "";
            if (userExists.kyc_status === "required") {
                withdrawReason = "Please verify your KYC status.";
            }
            else if (!hasSufficientBalance) {
                withdrawReason = `Insufficient balance. Current balance: ${currentBalance.toFixed(2)}, Minimum required: ${minWithdrawableBalance.toFixed(2)}`;
            }
            else if (hasPendingTurnover) {
                const turnoverDetails = pendingTurnover
                    .map((t) => `${t.type} turnover: ${Number(t.remainingTurnover).toFixed(2)} remaining out of ${Number(t.targetTurnover).toFixed(2)} target`)
                    .join(", ");
                withdrawReason = `Pending turnover requirements: ${turnoverDetails}`;
            }
            return res.status(400).json({
                status: false,
                message: "Withdrawal not allowed",
                data: {
                    canWithdraw: false,
                    currentBalance: Number(currentBalance.toFixed(2)),
                    minWithdrawableBalance,
                    hasSufficientBalance,
                    hasPendingTurnover,
                    withdrawReason,
                    pendingTurnover: pendingTurnover.map((t) => ({
                        id: t.id,
                        remainingTurnover: Number(t.remainingTurnover),
                        targetTurnover: Number(t.targetTurnover),
                        type: t.type,
                        status: t.status,
                    })),
                },
            });
        }
        // Check if withdrawal amount doesn't exceed current balance
        if (Number(amount) > currentBalance) {
            return res.status(400).json({
                status: false,
                message: "Withdrawal amount exceeds available balance",
                data: {
                    requestedAmount: Number(amount),
                    currentBalance: Number(currentBalance.toFixed(2)),
                    availableForWithdrawal: Number(currentBalance.toFixed(2)),
                },
            });
        }
        const customTransactionId = await (0, refCode_1.generateUniqueTransactionId)();
        const paymentMethodName = getGateWayData.paymentMethodName?.toLowerCase();
        const [currencyData] = paymentMethodName?.includes("international") ||
            paymentMethodName?.includes("crypto")
            ? await connection_1.db
                .select()
                .from(currency_1.currencies)
                .where((0, drizzle_orm_1.eq)(currency_1.currencies.code, "USD"))
                .limit(1)
            : await connection_1.db
                .select()
                .from(currency_1.currencies)
                .where((0, drizzle_orm_1.eq)(currency_1.currencies.code, "BDT"))
                .limit(1);
        const [currentConversionRate] = await connection_1.db
            .select({
            rate: settings_1.settings.conversionRate,
        })
            .from(settings_1.settings)
            .limit(1);
        const convertedAmount = currencyData?.code === "BDT"
            ? Number(amount || 0)
            : Number(amount) * Number(currentConversionRate?.rate || 1);
        // console.log({currencyData,paymentMethodName,currentConversionRate})
        // if(true) throw new Error("test")
        const result = await connection_1.db.transaction(async (tx) => {
            // Create withdrawal transaction
            const [createdTxn] = await tx.insert(transactions_1.transactions).values({
                userId: Number(userId),
                type: "withdraw",
                amount: Number(convertedAmount), // always convert to BDT
                currencyId: currencyData?.id || Number(currencyId),
                paymentGatewayId: Number(paymentGatewayId),
                status: "pending",
                customTransactionId,
                notes: notes ?? null,
                conversionRate: currentConversionRate.rate ?? null,
                attachment: attachment ?? null,
                // Bank-specific fields
                accountNumber: accountNumber ?? null,
                accountHolderName: accountHolderName ?? null,
                bankName: getGateWayData?.name ?? bankName ?? null,
                branchName: branchName ?? null,
                branchAddress: branchAddress ?? null,
                swiftCode: swiftCode ?? null,
                iban: iban ?? null,
                // Wallet-specific fields
                walletAddress: walletAddress ?? null,
                network: network ?? null,
                processedBy: user?.userType === "admin" ? user?.id : null,
                processedByUser: user?.userType === "user" ? user?.id : null,
            });
            await tx.insert(notifications_1.notifications).values({
                notificationType: "admin_player_transaction",
                title: `New withdrawal request from user #${userId}`,
                description: `
          A new withdrawal request has been submitted by user <strong>(#${userId})</strong>.<br/>
          Amount: <strong>${convertedAmount.toFixed(2)} ${currencyData?.code}</strong><br/>
          Gateway: <strong>${getGateWayData?.name}</strong><br/>
          Transaction ID: <strong>${customTransactionId}</strong><br/>
          Method: <strong>${walletAddress ? "Wallet" : "Bank"}</strong>
        `,
                amount: String(convertedAmount),
                turnoverMultiply: null,
                playerIds: String(userId),
                promotionId: null,
                link: `/players/${userId}/profile/transactions`,
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                status: "active",
                createdBy: Number(user?.id ?? 0),
            });
            __1.io.emit("admin-notifications", {
                notificationType: "admin_player_transaction",
                title: `New withdrawal request from user #${userId}`,
                description: `
          A new withdrawal request has been submitted by user <strong>(#${userId})</strong>.<br/>
          Amount: <strong>${convertedAmount.toFixed(2)} ${currencyData?.code}</strong><br/>
          Gateway: <strong>${getGateWayData?.name}</strong><br/>
          Transaction ID: <strong>${customTransactionId}</strong><br/>
          Method: <strong>${walletAddress ? "Wallet" : "Bank"}</strong>
        `,
            });
            const transactionId = createdTxn.insertId ?? createdTxn?.id;
            // Create admin main balance record for player withdrawal
            // await AdminMainBalanceModel.create(
            //   {
            //     amount: Number(amount),
            //     type: "player_withdraw",
            //     status: "pending", // Match transaction status
            //     transactionId: transactionId,
            //     currencyId: Number(currencyId),
            //     createdByPlayer: user?.userType === "user" ? user?.id : undefined,
            //     createdByAdmin: user?.userType === "admin" ? user?.id : undefined,
            //     notes: `Player withdrawal - Transaction ID: ${customTransactionId}`,
            //   },
            //   tx
            // );
            return { transactionId, customTransactionId };
        });
        return res.status(201).json({
            status: true,
            message: "Withdrawal request created successfully",
            data: {
                ...result,
                amount: Number(amount),
                status: "pending",
                currentBalance: Number(currentBalance.toFixed(2)),
                remainingBalance: Number((currentBalance - Number(amount)).toFixed(2)),
            },
        });
    }
    catch (err) {
        console.error("createWithdraw error", err);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
exports.createWithdraw = createWithdraw;
const getTransactions = async (req, res) => {
    try {
        const { page = 1, pageSize, limit, type, status, search, sortBy = "createdAt", sortOrder = "desc", userId, affiliateId, historyType = "global", dateFrom, dateTo, } = req.query;
        const currentPage = Math.max(Number(page) || 1, 1);
        const perPage = Math.max(Number(pageSize ?? limit) || 10, 1);
        const offset = (currentPage - 1) * perPage;
        const validTypes = ["deposit", "withdraw"];
        const validStatuses = ["approved", "pending", "rejected"];
        const whereClauses = [(0, drizzle_orm_1.inArray)(transactions_1.transactions.type, validTypes)];
        if (type && validTypes.includes(type)) {
            whereClauses.push((0, drizzle_orm_1.eq)(transactions_1.transactions.type, type));
        }
        if (status && validStatuses.includes(status)) {
            whereClauses.push((0, drizzle_orm_1.eq)(transactions_1.transactions.status, status));
        }
        if (userId && !Number.isNaN(Number(userId))) {
            whereClauses.push((0, drizzle_orm_1.eq)(transactions_1.transactions.userId, Number(userId)));
        }
        if (affiliateId && !Number.isNaN(Number(affiliateId))) {
            whereClauses.push((0, drizzle_orm_1.eq)(transactions_1.transactions.affiliateId, Number(affiliateId)));
        }
        if (historyType === "affiliate") {
            whereClauses.push((0, drizzle_orm_1.isNotNull)(transactions_1.transactions.affiliateId));
        }
        if (historyType === "user") {
            whereClauses.push((0, drizzle_orm_1.isNotNull)(transactions_1.transactions.userId));
        }
        if (historyType === "promotion") {
            whereClauses.push((0, drizzle_orm_1.isNotNull)(transactions_1.transactions.promotionId));
        }
        if (search && search.trim()) {
            whereClauses.push((0, drizzle_orm_1.like)(transactions_1.transactions.customTransactionId, `%${search}%`));
        }
        if (dateFrom) {
            const start = new Date(dateFrom);
            start.setHours(0, 0, 0, 0);
            whereClauses.push((0, drizzle_orm_1.sql) `${transactions_1.transactions.createdAt} >= ${start}`);
        }
        if (dateTo) {
            const end = new Date(dateTo);
            end.setHours(23, 59, 59, 999);
            whereClauses.push((0, drizzle_orm_1.sql) `${transactions_1.transactions.createdAt} <= ${end}`);
        }
        const whereExpr = whereClauses.length
            ? drizzle_orm_1.and(...whereClauses)
            : undefined;
        const sortableColumns = {
            createdAt: transactions_1.transactions.createdAt,
            id: transactions_1.transactions.id,
            amount: transactions_1.transactions.amount,
            status: transactions_1.transactions.status,
            type: transactions_1.transactions.type,
        };
        const orderColumn = sortableColumns[sortBy] ?? transactions_1.transactions.createdAt;
        const orderExpr = (String(sortOrder).toLowerCase() === "asc"
            ? (0, drizzle_orm_1.asc)(orderColumn)
            : (0, drizzle_orm_1.desc)(orderColumn));
        const total = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
            .from(transactions_1.transactions)
            .where(whereExpr)
            .then((rows) => Number(rows[0]?.count || 0));
        const processedByUser = (0, drizzle_orm_1.aliasedTable)(users_1.users, "processedByUser");
        const processedByAdmin = (0, drizzle_orm_1.aliasedTable)(schema_1.adminUsers, "processedByAdmin");
        const data = await connection_1.db
            .select({
            // Transaction fields
            id: transactions_1.transactions.id,
            userId: transactions_1.transactions.userId,
            affiliateId: transactions_1.transactions.affiliateId,
            type: transactions_1.transactions.type,
            amount: transactions_1.transactions.amount,
            currencyId: transactions_1.transactions.currencyId,
            promotionId: transactions_1.transactions.promotionId,
            promotionName: promotions_1.promotions.promotionName,
            promotionPercentage: promotions_1.promotions?.bonus,
            bonusAmount: transactions_1.transactions.bonusAmount,
            gameId: transactions_1.transactions.gameId,
            status: transactions_1.transactions.status,
            customTransactionId: transactions_1.transactions.customTransactionId,
            givenTransactionId: transactions_1.transactions.givenTransactionId,
            attachment: transactions_1.transactions.attachment,
            notes: transactions_1.transactions.notes,
            paymentGatewayProviderAccountId: transactions_1.transactions.paymentGatewayProviderAccountId,
            accountNumber: transactions_1.transactions.accountNumber,
            accountHolderName: transactions_1.transactions.accountHolderName,
            bankName: transactions_1.transactions.bankName,
            branchName: transactions_1.transactions.branchName,
            branchAddress: transactions_1.transactions.branchAddress,
            swiftCode: transactions_1.transactions.swiftCode,
            iban: transactions_1.transactions.iban,
            walletAddress: transactions_1.transactions.walletAddress,
            network: transactions_1.transactions.network,
            processedById: transactions_1.transactions.processedBy,
            processedByUserId: transactions_1.transactions?.processedByUser,
            processedAt: transactions_1.transactions.processedAt,
            createdAt: transactions_1.transactions.createdAt,
            updatedAt: transactions_1.transactions.updatedAt,
            // User fields
            userUsername: users_1.users.username,
            userFullname: users_1.users.fullname,
            userPhone: users_1.users.phone,
            userEmail: users_1.users.email,
            userStatus: users_1.users.status,
            userIsVerified: users_1.users.isVerified,
            userCreatedAt: users_1.users.created_at,
            // affiliate
            affiliateUsername: schema_1.adminUsers.username,
            affiliateName: schema_1.adminUsers.fullname,
            affiliatePhone: schema_1.adminUsers.phone,
            affiliateEmail: schema_1.adminUsers.email,
            affiliateStatus: schema_1.adminUsers.status,
            affiliateRegisterDate: schema_1.adminUsers.created_at,
            // Game fields
            gameName: games_1.games.name,
            gameStatus: games_1.games.status,
            gameLogo: games_1.games.gameLogo,
            gameUrl: games_1.games.gameUrl,
            paymentGateway: schema_1.paymentGateway,
            // Currency fields
            usdConversion: transactions_1.transactions.conversionRate,
            paymentMethodName: schema_1.paymentMethods.name,
            currencyCode: currency_1.currencies.code,
            currencyName: currency_1.currencies.name,
            currencySymbol: currency_1.currencies.symbol,
            processedBy: (0, drizzle_orm_1.sql) `
  CASE 
    WHEN ${transactions_1.transactions.processedBy} IS NOT NULL THEN ${processedByAdmin.username}
    WHEN ${transactions_1.transactions.processedByUser} IS NOT NULL THEN ${processedByUser.username}
  END
`,
            processedByRoleType: (0, drizzle_orm_1.sql) `
CASE 
  WHEN ${transactions_1.transactions.processedBy} IS NOT NULL THEN ${processedByAdmin.role}
  WHEN ${transactions_1.transactions.processedByUser} IS NOT NULL THEN ${"player"}
END
`,
        })
            .from(transactions_1.transactions)
            .leftJoin(schema_1.paymentGateway, (0, drizzle_orm_1.eq)(schema_1.paymentGateway.id, transactions_1.transactions.paymentGatewayId))
            .leftJoin(schema_1.paymentMethods, (0, drizzle_orm_1.eq)(schema_1.paymentGateway.methodId, schema_1.paymentMethods.id))
            .leftJoin(promotions_1.promotions, (0, drizzle_orm_1.eq)(transactions_1.transactions.promotionId, promotions_1.promotions.id))
            .leftJoin(users_1.users, (0, drizzle_orm_1.eq)(transactions_1.transactions.userId, users_1.users.id))
            .leftJoin(schema_1.currencyConversion, (0, drizzle_orm_1.eq)(transactions_1.transactions.currencyId, schema_1.currencyConversion.toCurrency))
            .leftJoin(processedByAdmin, (0, drizzle_orm_1.eq)(transactions_1.transactions?.processedBy, processedByAdmin?.id))
            .leftJoin(processedByUser, (0, drizzle_orm_1.eq)(transactions_1.transactions.processedByUser, processedByUser.id))
            .leftJoin(schema_1.adminUsers, (0, drizzle_orm_1.eq)(transactions_1.transactions.affiliateId, schema_1.adminUsers.id))
            .leftJoin(games_1.games, (0, drizzle_orm_1.eq)(transactions_1.transactions.gameId, games_1.games.id))
            .leftJoin(currency_1.currencies, (0, drizzle_orm_1.eq)(transactions_1.transactions.currencyId, currency_1.currencies.id))
            .where(whereExpr)
            .orderBy(orderExpr)
            .limit(perPage)
            .offset(offset);
        return res.status(200).json({
            status: true,
            data,
            pagination: {
                page: currentPage,
                pageSize: perPage,
                total,
                totalPages: Math.ceil(total / perPage),
            },
        });
    }
    catch (err) {
        console.error("getTransactions error", err);
        return res
            .status(500)
            .json({ status: false, message: "Internal Server Error", errors: err });
    }
};
exports.getTransactions = getTransactions;
const updateTransactionStatus = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status, notes } = req.body;
        if (Number.isNaN(id)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid transaction id" });
        }
        const validStatuses = ["approved", "pending", "rejected"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Invalid or missing status. Allowed: approved, pending, rejected",
            });
        }
        const [existing] = await connection_1.db
            .select()
            .from(transactions_1.transactions)
            .where((0, drizzle_orm_1.eq)(transactions_1.transactions.id, id));
        if (!existing) {
            return res
                .status(404)
                .json({ status: false, message: "Transaction not found" });
        }
        const processedBy = req?.user?.id ?? null;
        const updatePayload = {
            status: status,
            processedAt: new Date(),
        };
        if (processedBy)
            updatePayload.processedBy = Number(processedBy);
        if (typeof notes === "string")
            updatePayload.notes = notes;
        await connection_1.db
            .update(transactions_1.transactions)
            .set(updatePayload)
            .where((0, drizzle_orm_1.eq)(transactions_1.transactions.id, id));
        // --- APPROVED FLOW ---
        if (status === "approved") {
            const baseAmount = Number(existing.amount);
            const userIdExisting = Number(existing.userId);
            // Settings lookup
            const [settingsRow] = await connection_1.db.select().from(settings_1.settings).limit(1);
            const defaultTurnoverMultiply = Number(settingsRow?.defaultTurnover ?? 1);
            const defaultTarget = baseAmount * defaultTurnoverMultiply;
            // --- Default turnover ---
            if (existing.type === "deposit") {
                const [existingDefaultTurnover] = await connection_1.db
                    .select()
                    .from(turnover_1.turnover)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(turnover_1.turnover.transactionId, id), (0, drizzle_orm_1.eq)(turnover_1.turnover.type, "default")));
                if (existingDefaultTurnover) {
                    // Update
                    await connection_1.db
                        .update(turnover_1.turnover)
                        .set({
                        userId: userIdExisting,
                        status: "active",
                        depositAmount: baseAmount.toString(),
                        targetTurnover: defaultTarget.toString(),
                        remainingTurnover: defaultTarget.toString(),
                        turnoverName: `Deposited for TXN ${existing.customTransactionId}`,
                    })
                        .where((0, drizzle_orm_1.eq)(turnover_1.turnover.id, existingDefaultTurnover.id));
                }
                else {
                    // Insert
                    await connection_1.db.insert(turnover_1.turnover).values({
                        userId: userIdExisting,
                        transactionId: id,
                        type: "default",
                        status: "active",
                        turnoverName: `Deposited for TXN ${existing.customTransactionId}`,
                        depositAmount: baseAmount.toString(),
                        targetTurnover: defaultTarget.toString(),
                        remainingTurnover: defaultTarget.toString(),
                    });
                }
            }
            // --- Promotion turnover & bonus ---
            if (existing.promotionId && existing.type === "deposit") {
                const [promo] = await connection_1.db
                    .select()
                    .from(promotions_1.promotions)
                    .where((0, drizzle_orm_1.eq)(promotions_1.promotions.id, existing.promotionId));
                if (promo) {
                    const bonusAmount = (baseAmount * Number(promo.bonus)) / 100;
                    const promoTarget = bonusAmount * Number(promo.turnoverMultiply ?? 1);
                    const [existingPromoTurnover] = await connection_1.db
                        .select()
                        .from(turnover_1.turnover)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(turnover_1.turnover.transactionId, id), (0, drizzle_orm_1.eq)(turnover_1.turnover.type, "promotion")));
                    if (existingPromoTurnover) {
                        // Update
                        await connection_1.db
                            .update(turnover_1.turnover)
                            .set({
                            userId: userIdExisting,
                            status: "active",
                            depositAmount: baseAmount.toString(),
                            targetTurnover: promoTarget.toString(),
                            remainingTurnover: promoTarget.toString(),
                            turnoverName: `Promotion: ${promo.promotionName}`,
                        })
                            .where((0, drizzle_orm_1.eq)(turnover_1.turnover.id, existingPromoTurnover.id));
                    }
                    else {
                        // Insert
                        await connection_1.db.insert(turnover_1.turnover).values({
                            userId: userIdExisting,
                            transactionId: id,
                            type: "promotion",
                            status: "active",
                            turnoverName: `Promotion: ${promo.promotionName}`,
                            depositAmount: baseAmount.toString(),
                            targetTurnover: promoTarget.toString(),
                            remainingTurnover: promoTarget.toString(),
                        });
                    }
                    // Always update transaction bonus amount
                    await connection_1.db
                        .update(transactions_1.transactions)
                        .set({ bonusAmount: bonusAmount.toString() })
                        .where((0, drizzle_orm_1.eq)(transactions_1.transactions.id, id));
                    // --- Admin main balance for promotion ---
                    const [existingPromoBalance] = await connection_1.db.query.adminMainBalance.findMany({
                        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.adminMainBalance.transactionId, id), (0, drizzle_orm_1.eq)(schema_1.adminMainBalance.type, "promotion")),
                    });
                    if (existingPromoBalance) {
                        await adminMainBalance_model_1.AdminMainBalanceModel.update(existingPromoBalance.id, {
                            amount: bonusAmount,
                            status: "approved",
                            promotionId: promo.id,
                            promotionName: promo.promotionName,
                            currencyId: existing.currencyId,
                            notes: `Promotion bonus - ${promo.promotionName} (${promo.bonus}%)`,
                        });
                    }
                    else {
                        await adminMainBalance_model_1.AdminMainBalanceModel.create({
                            amount: bonusAmount,
                            type: "promotion",
                            status: "approved",
                            promotionId: promo.id,
                            promotionName: promo.promotionName,
                            transactionId: id,
                            currencyId: existing.currencyId,
                            notes: `Promotion bonus - ${promo.promotionName} (${promo.bonus}%)`,
                        });
                    }
                }
            }
            // --- Admin main balance for deposit/withdraw ---
            const type = existing?.type === "deposit"
                ? "player_deposit"
                : existing.type === "withdraw"
                    ? "player_withdraw"
                    : "promotion";
            const [existingMainBalance] = await connection_1.db.query.adminMainBalance.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.adminMainBalance.transactionId, id), (0, drizzle_orm_1.eq)(schema_1.adminMainBalance.type, "promotion")),
            });
            if (existingMainBalance) {
                await adminMainBalance_model_1.AdminMainBalanceModel.update(existingMainBalance.id, {
                    amount: baseAmount,
                    status: "approved",
                    currencyId: existing.currencyId,
                    notes: `Player ${type} - Transaction ID: ${existing.customTransactionId}`,
                });
            }
            else {
                await adminMainBalance_model_1.AdminMainBalanceModel.create({
                    amount: baseAmount,
                    type,
                    status: "approved",
                    transactionId: id,
                    currencyId: existing.currencyId,
                    notes: `Player ${type} - Transaction ID: ${existing.customTransactionId}`,
                });
            }
        }
        // --- REJECTED / PENDING ---
        if (["rejected", "pending"].includes(status)) {
            await connection_1.db
                .update(turnover_1.turnover)
                .set({ status: "inactive" })
                .where((0, drizzle_orm_1.eq)(turnover_1.turnover.transactionId, id));
        }
        // Always sync AdminMainBalance statuses
        await adminMainBalance_model_1.AdminMainBalanceModel.updateByTransactionId(id, {
            status: status,
        });
        const [updated] = await connection_1.db
            .select()
            .from(transactions_1.transactions)
            .where((0, drizzle_orm_1.eq)(transactions_1.transactions.id, id));
        return res.status(200).json({
            status: true,
            message: `Transaction status updated to ${status}`,
            data: updated,
        });
    }
    catch (err) {
        console.error("updateTransactionStatus error", err);
        return res
            .status(500)
            .json({ status: false, message: "Internal Server Error", errors: err });
    }
};
exports.updateTransactionStatus = updateTransactionStatus;
const updateAffiliateWithdrawStatus = async (req, res) => {
    const tx = connection_1.db; // If you use transaction wrapper, replace with `await db.transaction(...)`
    try {
        const id = Number(req.params.id);
        const { status, notes } = req.body;
        if (Number.isNaN(id)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid transaction id" });
        }
        const validStatuses = ["approved", "pending", "rejected"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Invalid or missing status. Allowed: approved, pending, rejected",
            });
        }
        const [existing] = await connection_1.db
            .select()
            .from(transactions_1.transactions)
            .where((0, drizzle_orm_1.eq)(transactions_1.transactions.id, id));
        if (!existing) {
            return res
                .status(404)
                .json({ status: false, message: "Transaction not found" });
        }
        const affiliateId = existing.affiliateId;
        const processedBy = req?.user?.id ?? null;
        const updatePayload = {
            status: status,
            processedAt: new Date(),
        };
        if (processedBy)
            updatePayload.processedBy = Number(processedBy);
        if (typeof notes === "string")
            updatePayload.notes = notes;
        await tx
            .update(transactions_1.transactions)
            .set(updatePayload)
            .where((0, drizzle_orm_1.eq)(transactions_1.transactions.id, id));
        // Update corresponding adminMainBalance records to match transaction status
        await adminMainBalance_model_1.AdminMainBalanceModel.updateByTransactionId(id, {
            status: status, // Update status to match transaction
        });
        // Apply extra logic based on status
        if (status === "approved") {
            // ✅ Mark all 'paid' commissions as 'settled' for this affiliate
            await tx
                .update(schema_1.commission)
                .set({ status: "settled" })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commission.adminUserId, Number(affiliateId)), (0, drizzle_orm_1.eq)(schema_1.commission.status, "paid")));
        }
        else if (status === "rejected") {
            const paidCommissions = await tx
                .select()
                .from(schema_1.commission)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commission.adminUserId, Number(affiliateId)), (0, drizzle_orm_1.eq)(schema_1.commission.status, "paid")));
            console.log("paidCommissions", paidCommissions);
            if (paidCommissions.length > 0) {
                await tx
                    .update(schema_1.commission)
                    .set({ status: "approved" })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commission.adminUserId, Number(affiliateId)), (0, drizzle_orm_1.eq)(schema_1.commission.status, "paid")));
                // ✅ Set remaining balance to 0
                await tx
                    .update(schema_1.adminUsers)
                    .set({ remainingBalance: 0 })
                    .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, Number(affiliateId)));
            }
            else {
                // ✅ No 'paid' commissions, so restore the amount back to remaining balance
                await tx
                    .update(schema_1.adminUsers)
                    .set({
                    remainingBalance: (0, drizzle_orm_1.sql) `${schema_1.adminUsers.remainingBalance} + ${Number(existing.amount)}`,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, Number(affiliateId)));
            }
        }
        const [updated] = await connection_1.db
            .select()
            .from(transactions_1.transactions)
            .where((0, drizzle_orm_1.eq)(transactions_1.transactions.id, id));
        return res.status(200).json({
            status: true,
            message: `Transaction status updated to ${status}`,
            data: updated,
        });
    }
    catch (err) {
        console.error("updateTransactionStatus error", err);
        return res
            .status(500)
            .json({ status: false, message: "Internal Server Error", errors: err });
    }
};
exports.updateAffiliateWithdrawStatus = updateAffiliateWithdrawStatus;
const checkWithdrawCapability = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (Number.isNaN(userId)) {
            return res.status(400).json({
                status: false,
                message: "Invalid user ID",
            });
        }
        // Check if user exists
        const [user] = await connection_1.db.select().from(users_1.users).where((0, drizzle_orm_1.eq)(users_1.users.id, userId));
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }
        // Get minimum withdrawable balance from settings
        const [settingsRow] = await connection_1.db.select().from(settings_1.settings).limit(1);
        const minWithdrawableBalance = Number(settingsRow?.minWithdrawableBalance || 25000);
        // Check for pending turnover
        const pendingTurnover = await connection_1.db
            .select({
            id: turnover_1.turnover.id,
            remainingTurnover: turnover_1.turnover.remainingTurnover,
            targetTurnover: turnover_1.turnover.targetTurnover,
            type: turnover_1.turnover.type,
            status: turnover_1.turnover.status,
        })
            .from(turnover_1.turnover)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(turnover_1.turnover.userId, userId), (0, drizzle_orm_1.eq)(turnover_1.turnover.status, "active")));
        // Calculate user's current balance using BalanceModel
        const playerBalance = await balance_model_1.BalanceModel.calculatePlayerBalance(userId);
        const currentBalance = playerBalance.currentBalance;
        // Check if user has sufficient withdrawable balance
        const hasSufficientBalance = currentBalance >= minWithdrawableBalance;
        // Check if there are any pending turnovers
        const hasPendingTurnover = pendingTurnover.length > 0;
        // User can withdraw if: sufficient balance AND no pending turnover
        const canWithdraw = hasSufficientBalance &&
            !hasPendingTurnover &&
            user.kyc_status !== "required" &&
            user.status === "active";
        // Determine the reason why withdrawal is not allowed
        let withdrawReason = null;
        if (!canWithdraw) {
            if (user.kyc_status === "required") {
                withdrawReason = "KYC is not verified";
            }
            else if (user.status !== "active") {
                withdrawReason = "User is not active";
            }
            else if (!hasSufficientBalance) {
                withdrawReason = `Insufficient balance. Current balance: ${currentBalance.toFixed(2)}, Minimum required: ${minWithdrawableBalance.toFixed(2)}`;
            }
            else if (hasPendingTurnover) {
                withdrawReason = `Turnover has not yet reached`;
            }
        }
        return res.status(200).json({
            status: true,
            message: "Withdraw capability check completed",
            data: {
                canWithdraw,
                currentBalance: Number(currentBalance.toFixed(2)),
                minWithdrawableBalance,
                hasSufficientBalance,
                hasPendingTurnover,
                withdrawReason,
                pendingTurnover: pendingTurnover.map((t) => ({
                    id: t.id,
                    remainingTurnover: Number(t.remainingTurnover),
                    targetTurnover: Number(t.targetTurnover),
                    type: t.type,
                    status: t.status,
                })),
                balanceBreakdown: {
                    totalDeposits: playerBalance.totalDeposits,
                    totalWins: playerBalance.totalWins,
                    totalWithdrawals: playerBalance.totalWithdrawals,
                    totalLosses: playerBalance.totalLosses,
                },
            },
        });
    }
    catch (error) {
        console.error("Error checking withdraw capability:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.checkWithdrawCapability = checkWithdrawCapability;
