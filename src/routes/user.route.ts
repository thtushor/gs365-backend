import { Router } from "express";
import {
  getAllUsers,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  userProfile,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/", (req, res, next) => {
  getAllUsers(req, res).catch(next);
});

router.post("/register", (req, res, next) => {
  registerUser(req, res).catch(next);
});

router.post("/login", (req, res, next) => {
  console.log("hit login page...")
  loginUser(req, res).catch(next);
});

router.get("/profile", verifyToken, (req, res, next) => {
  userProfile(req, res).catch(next);
});

router.post("/update/:id", (req, res, next) => {
  updateUser(req, res).catch(next);
});

router.post("/delete/:id", (req, res, next) => {
  deleteUser(req, res).catch(next);
});

export default router;
