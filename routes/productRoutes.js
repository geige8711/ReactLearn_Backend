import express from "express";
const router = express.Router();
import {
  createProduct,
  createProductReview,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
  createProducts,
} from "../controllers/productController.js";
import { protect, staffAuth } from "../middleware/authMiddleware.js";

router
  .route("/")
  .get(protect, staffAuth, getProducts)
  .post(protect, staffAuth, createProduct);
router
  .route("/:id")
  .get(protect, staffAuth, getProductById)
  .delete(protect, staffAuth, deleteProduct)
  .put(protect, staffAuth, updateProduct);

router.route("/:id/reviews").post(protect, createProductReview);
router.post("/create-multiple", protect, staffAuth, createProducts);

export default router;
