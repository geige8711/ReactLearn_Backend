import asyncHandler from "express-async-handler";
import Banner from "../models/bannerModel.js";
import formidable from "formidable";

const createBanner = asyncHandler(async (req, res) => {
  let form = new formidable({ multiples: true });
  const banners = await Banner.find({});
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "Image could not upload" });
    }
    const { imageUrl, linkTo, bannerCaption } = fields;

    let newBanner = new Banner();
    newBanner.imageUrl = imageUrl;
    newBanner.linkTo = linkTo;
    newBanner.caption = bannerCaption;

    newBanner.position = banners.length + 1;

    newBanner.save((err, result) => {
      if (err) {
        return res.status(400).json({ err });
      }
      res.status(201).json(result);
    });
  });
});

const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort("position");
  res.json(banners);
});

const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (banner) {
    res.json(banner);
  } else {
    res.status(404);
    throw new Error("banner not found");
  }
});

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (banner) {
    await banner.remove();
    res.json({ message: "banner removed" });
  } else {
    res.status(404);
    throw new Error("banner not found");
  }
});

const updateBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (banner) {
    let form = new formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: "Image could not upload" });
      }
      const { position, linkTo, caption, imageUrl } = fields;

      if (!linkTo || linkTo.length === 0) {
        return res.status(400).json({ error: "linkTo is required" });
      }

      banner.position = position;
      banner.linkTo = linkTo;
      banner.caption = caption;
      if (imageUrl) {
        banner.imageUrl = imageUrl;
      }

      banner.save((err, result) => {
        if (err) {
          return res.status(400).json({ err });
        }
        res.json(result);
      });
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  createBanner,
  getBanners,
  deleteBanner,
  getBannerById,
  updateBannerById,
};
