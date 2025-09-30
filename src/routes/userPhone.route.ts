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
} from "../controllers/userPhone.controller";

const router = Router();

router.use(verifyToken);

router.post("/", createUserPhone);
router.get("/", getUserPhones);
router.get("/user/:userId", getUserPhonesByUser);
router.get("/:id", getUserPhoneById);
router.put("/:id", updateUserPhone);
router.delete("/:id", deleteUserPhone);
router.patch("/:id/set-primary", setPrimaryUserPhone);
router.patch("/:id/verify", verifyUserPhone);

export default router;


