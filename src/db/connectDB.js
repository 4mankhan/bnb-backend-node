// db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // No need for useNewUrlParser or useUnifiedTopology in Mongoose 7+
    const conn = await mongoose.connect(`${process.env.MONGO_URI}/microservice-snippet`);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // exit process on failure
  }
};

export default connectDB;