import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";

export const signup = async (req, res) => {
  const { userName, email, password } = req.body;

  const hashedPassword = bcryptjs.hashSync(password, 10); //no need of await because of hashSync

  const newUser = new User({ userName, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json("user created successfully.");
  } catch (error) {
    // res.status(500).json(error.message);
    next(error); //next(errorHandler);
  }
};
