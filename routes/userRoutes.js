import express from "express";
const router = express.Router();
import {
  authUser,
  preRegisterUser,
  registerUser,
  forgotPassword,
  resetPassword,
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUser,
  createUsers,
} from "../controllers/userController.js";
import { protect, staffAuth } from "../middleware/authMiddleware.js";

router.get("/", protect, staffAuth, getUsers);
router
  .route("/:id")
  .get(protect, staffAuth, getUserById)
  .put(protect, staffAuth, updateUserById)
  .delete(protect, staffAuth, deleteUser);
router.post("/login", authUser);
router.post("/pre-signup", preRegisterUser);
router.post("/signup", registerUser);
router.post("/create", protect, staffAuth, createUser);
router.post("/create-multiple", protect, staffAuth, createUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
