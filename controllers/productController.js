import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import formidable from "formidable";

const createProduct = asyncHandler(async (req, res) => {
  let form = new formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "Image could not upload" });
    }
    const {
      name,
      price,
      mainImage,
      secondaryImages,
      category,
      description,
      status,
    } = fields;

    let newProduct = new Product();
    newProduct.name = name;
    newProduct.price = price;
    newProduct.mainImage = mainImage;
    newProduct.secondaryImages = secondaryImages.split(",");
    newProduct.category = category;
    newProduct.description = description;
    newProduct.status = status;
    newProduct.createdBy = req.user._id;
    newProduct.countInStock = 0;
    newProduct.numReviews = 0;

    newProduct.save((err, result) => {
      if (err) {
        return res.status(400).json({ err });
      }
      res.status(201).json(result);
    });
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  let form = new formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "Image could not upload" });
    }
    const {
      name,
      price,
      mainImage,
      secondaryImages,
      category,
      description,
      countInStock,
      status,
    } = fields;
    product.name = name;
    product.price = price;
    product.mainImage = mainImage;
    product.secondaryImages = secondaryImages.split(",");
    product.category = category;
    product.description = description;
    product.createdBy = req.user._id;
    product.countInStock = countInStock;
    product.status = status === "1";

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({ err });
      }
      res.status(201).json(result);
    });
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    const deletedProduct = await product.remove();
    res.json(deletedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "id name"
  );
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate("category", "id name");
  res.json(products);
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

const createProducts = asyncHandler(async (req, res) => {
  const products = req.body;
  products.forEach((product) => {
    const newProduct = new Product({ ...product });
    newProduct.createdBy = req.user._id;
    newProduct.save((err, result) => {
      if (err) {
        console.log(err);
      } else {
      }
    });
  });
  return res.json(products);
});

export {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
  createProductReview,
  createProducts,
};
