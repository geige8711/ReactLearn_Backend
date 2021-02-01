import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true,
      index: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
      unique: true,
    },
    profile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: String,
    about: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zip: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    gender: {
      type: String,
    },
    isStaff: {
      type: Boolean,
      required: true,
      default: false,
    },
    photo: {
      data: String,
      contentType: String,
    },
    resetPasswordLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.salt = await bcrypt.genSalt(
    Math.round(new Date().valueOf() * Math.random())
  );
  const mySalt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, mySalt);
});

const User = mongoose.model("User", userSchema);

export default User;
