import mongoose from "mongoose";

const bannerSchema = mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    caption: {
      type: String,
    },
    linkTo: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
