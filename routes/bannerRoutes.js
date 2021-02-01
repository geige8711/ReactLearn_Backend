import express from "express";
const router = express.Router();
import {
  createBanner,
  getBanners,
  getBannerById,
  deleteBanner,
  updateBannerById,
} from "../controllers/bannerController.js";
import { protect, staffAuth } from "../middleware/authMiddleware.js";

router.route("/create").post(protect, staffAuth, createBanner);
router.route("/").get(protect, staffAuth, getBanners);
router
  .route("/:id")
  .get(protect, staffAuth, getBannerById)
  .put(protect, staffAuth, updateBannerById)
  .delete(protect, staffAuth, deleteBanner);

export default router;
