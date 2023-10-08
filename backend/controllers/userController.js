import { errorHandler } from "../utils/error.js";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs"

export const test = (req, res) => {
  res.json({
    message: "bla bla",
  });
};


export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "access denied"));
  }
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      $set: {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        avatar: req.body.avatar,
      },
    }, { new: true });

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);

  } catch (error) {
    next(error);
  }
};