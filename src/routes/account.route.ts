import { Router } from "express";
import * as accountController from "../controllers/account.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router: Router = Router();

// Account Types
router.get("/types", asyncHandler(accountController.getAllAccountTypes));
router.post("/types", asyncHandler(accountController.createAccountType));
router.put("/types/:id", asyncHandler(accountController.updateAccountType));
router.delete("/types/:id", asyncHandler(accountController.deleteAccountType));

// Accounts
router.get("/", asyncHandler(accountController.getAllAccounts));
router.get("/:id", asyncHandler(accountController.getAccountById));
router.post("/", asyncHandler(accountController.createAccount));
router.put("/:id", asyncHandler(accountController.updateAccount));
router.delete("/:id", asyncHandler(accountController.deleteAccount));
router.patch("/status", asyncHandler(accountController.updateAccountStatus));

// Payment details CRUD
router.get(
  "/:id/payment-details",
  asyncHandler(accountController.getAccountPaymentDetails)
);
router.put(
  "/:id/payment-details",
  asyncHandler(accountController.updateAccountPaymentDetails)
);
router.delete(
  "/:id/payment-details",
  asyncHandler(accountController.deleteAccountPaymentDetails)
);

export default router;
