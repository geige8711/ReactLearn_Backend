import express from "express";
const router = express.Router();
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
} from "../controllers/categoryController.js";
import { protect, staffAuth } from "../middleware/authMiddleware.js";

router.route("/create").post(protect, staffAuth, createCategory);
router.route("/update/:id").put(protect, staffAuth, updateCategory);
router.route("/delete/:id").delete(protect, staffAuth, deleteCategory);
router.route("/").get(protect, staffAuth, getCategories);

export default router;
