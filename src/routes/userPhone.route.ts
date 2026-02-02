import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  createUserPhone,
  getUserPhones,
  getUserPhonesByUser,
  getUserPhoneById,
  updateUserPhone,
  deleteUserPhone,
  setPrimaryUserPhone,
  verifyUserPhone,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "../controllers/userPhone.controller";

const router = Router();

router.use(verifyToken);

router.post("/", createUserPhone);
router.get("/", getUserPhones);
router.get("/user/:userId", getUserPhonesByUser);
router.get("/:id", getUserPhoneById);
router.post("/update/:id", updateUserPhone);
router.post("/delete/:id", deleteUserPhone);
router.patch("/:id/set-primary", setPrimaryUserPhone);
router.patch("/:id/verify", verifyUserPhone);
router.post("/:id/send-otp", sendPhoneOtp);
router.post("/:id/verify-otp", verifyPhoneOtp);

export default router;


