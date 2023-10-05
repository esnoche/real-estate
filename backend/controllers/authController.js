import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
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

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return next(errorHandler(404, "User NotFound"));
    }

    const validPassword = bcryptjs.compareSync(password, existingUser.password);

    if (!validPassword) {
      return next(errorHandler(401, "Invalid Password"));
    }

    const token = jwt.sign({id: existingUser._id}, "jjk");// similar as salting

    const {password: pass, ...rest} = existingUser._doc;// do not want to send the password to client
    
    res.cookie("access_token", token, {httpOnly: true}).status(200).json(rest);

  } catch (error) {

    next(error);

  }
}
