import express from "express";
import mongoose from "mongoose";

const app = express();

const connectToMongoDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/real-estate");
    console.log("connected to mongodb");
  } catch (error) {
    console.log(error);
  }
};

connectToMongoDB();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
