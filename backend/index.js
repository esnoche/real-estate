import express from "express";
import mongoose from "mongoose";
import router from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import listingRouter from "./routes/listingRoutes.js";

const connectToMongoDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/real-estate");
    console.log("connected to mongodb");
  } catch (error) {
    console.log(error);
  }
};
connectToMongoDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", router);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use((error, req, res, next)=>{
  const statCode = error.statusCode || 500;
  const msg = error.message || "Internal Server Error";

  return res.status(statCode).json({
    success: false,
    statusCode: statCode,
    message: msg,
  });
});