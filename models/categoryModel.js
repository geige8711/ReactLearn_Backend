import mongoose from "mongoose";
import Product from "../models/productModel.js";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("deleteOne", async function (next) {
  await Product.deleteMany({
    category: this.getQuery()._id,
  }).exec();
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
