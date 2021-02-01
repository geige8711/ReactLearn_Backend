import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import slugify from "slugify";

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name).toLowerCase();

    const category = new Category({ name, slug });

    const newCategory = await category.save();
    res.json(newCategory);
  } catch (error) {
    console.log(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const oldCategory = await Category.findById(req.params.id);
    const { name } = req.body;
    const slug = slugify(name).toLowerCase();

    oldCategory.name = name;
    oldCategory.slug = slug;

    const updatedCategory = await oldCategory.save();
    res.json(updatedCategory);
  } catch (error) {
    console.log(error);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await Category.deleteOne({ _id: id });
  res.json({ message: "deletedCategory" });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});
export { createCategory, deleteCategory, updateCategory, getCategories };
