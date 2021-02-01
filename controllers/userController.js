import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";
import shortId from "shortid";
import _ from "lodash";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import formidable from "formidable";
import fs from "fs";
import { Buffer } from "buffer";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isStaff: user.isStaff,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const preRegisterUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    res.status(400);
    throw new Error("The Email is already taken!");
  }
  const token = jwt.sign(
    { name, email, password },
    process.env.JWT_ACCOUNT_ACTIVATION,
    { expiresIn: "1h" }
  );

  const emailData = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Password reset link`,
    html: `
          <p>Please use the following link to activate your account:</p>
          <p>${process.env.CLIENT_URL}/activate/${token}</p>
        `,
  };

  try {
    await sgMail.send(emailData);
    res.json({ message: `Email has been sent to ${email}` });
  } catch (error) {
    console.error(error);
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const token = req.body.token;

  if (token) {
    const decoded = await jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);
    const { name, email, password } = decoded;
    let username = shortId.generate();
    let profile = `${process.env.CLIENT_URL}/profile/${username}`;
    const user = await User.create({
      name,
      email,
      password,
      profile,
      username,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isStaff: user.isStaff,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } else {
    return res.json({ message: "something went wrong. try again" });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "30m",
    });

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Password reset link`,
      html: `
        <p>Please use the following link to reset your password:</p>
        <p>${process.env.CLIENT_URL}/password-reset/${token}</p>
      `,
    };
    try {
      await user.updateOne({ resetPasswordLink: token });
      await sgMail.send(emailData);
      res.json({ message: `Email has been sent to ${email}` });
    } catch (error) {
      console.error("something wrong, please try again");
    }
  } else {
    res.status(401);
    throw new Error("User with that email does not exist");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  if (resetPasswordLink) {
    const decoded = await jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD
    );
    const { _id } = decoded;
    console.log(_id);
    let user = await User.findOne({ resetPasswordLink });

    if (user) {
      user.password = newPassword;
      user.resetPasswordLink = "";

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isStaff: updatedUser.isStaff,
        token: generateToken(updatedUser._id),
      });
    } else {
      throw new Error("something went wrong. Try later");
    }
  }
});

const createUser = asyncHandler(async (req, res) => {
  let form = new formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "Image could not upload" });
    }
    const {
      gender,
      name,
      email,
      password,
      phoneNumber,
      address,
      city,
      state,
      zip,
      about,
    } = fields;

    if (!email || email.length === 0) {
      return res.status(400).json({ error: "email is required" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "password is too short" });
    }

    let newUser = new User();
    newUser.gender = gender;
    newUser.email = email;
    newUser.password = password;
    newUser.phoneNumber = phoneNumber;
    newUser.address = address;
    newUser.city = city;
    newUser.state = state;
    newUser.zip = zip;
    newUser.about = about;
    newUser.isStaff = true;
    newUser.username = shortId.generate();
    newUser.name = name;
    newUser.profile = `${process.env.CLIENT_URL}/profile/${newUser.username}`;

    if (files.photo && files.photo.size > 0) {
      if (files.photo.size > 10000000) {
        return res
          .status(400)
          .json({ error: "Image should be less than 1Mb in size" });
      }
      newUser.photo.data = Buffer.from(
        fs.readFileSync(files.photo.path)
      ).toString("base64");
      newUser.photo.contentType = files.photo.type;
    }
    newUser.save((err, result) => {
      if (err) {
        return res.status(400).json({ err });
      }
      res.json({
        _id: result._id,
        name: result.name,
        email: result.email,
        isStaff: result.isStaff,
      });
    });
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    let form = new formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: "Image could not upload" });
      }
      const {
        gender,
        name,
        email,
        password,
        phoneNumber,
        address,
        city,
        state,
        zip,
        about,
      } = fields;

      if (!email || email.length === 0) {
        return res.status(400).json({ error: "email is required" });
      }

      if (password && password.length < 6) {
        return res.status(400).json({ error: "password is too short" });
      }

      if (password && password.length >= 6) {
        user.password = password;
      }

      user.gender = gender;
      user.email = email;
      user.phoneNumber = phoneNumber;
      user.address = address;
      user.city = city;
      user.state = state;
      user.zip = zip;
      user.about = about;
      user.name = name;

      if (files.photo && files.photo.size > 0) {
        if (files.photo.size > 10000000) {
          return res
            .status(400)
            .json({ error: "Image should be less than 1Mb in size" });
        }
        user.photo.data = Buffer.from(
          fs.readFileSync(files.photo.path)
        ).toString("base64");
        user.photo.contentType = files.photo.type;
      }
      user.save((err, result) => {
        if (err) {
          return res.status(400).json({ err });
        }
        res.json({
          _id: result._id,
          name: result.name,
          email: result.email,
          isStaff: result.isStaff,
        });
      });
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const createUsers = asyncHandler(async (req, res) => {
  const users = req.body;
  users.forEach((user) => {
    if (user.email) {
      const newUser = new User({ ...user });
      newUser.isStaff = true;
      newUser.password = "123456";
      newUser.username = shortId.generate();
      newUser.profile = `${process.env.CLIENT_URL}/profile/${newUser.username}`;
      newUser.save((err, result) => {
        if (err) {
          console.log(err);
        } else {
        }
      });
    }
  });
  return res.json(users);
});

export {
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
};
