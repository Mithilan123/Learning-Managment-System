import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Create server/.env (see server/.env.example).");
  }
  const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;
