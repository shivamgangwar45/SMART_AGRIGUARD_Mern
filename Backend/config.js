import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5557;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET || "agriguard_secret_123";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;