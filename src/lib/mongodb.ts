
import mongoose from 'mongoose';

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expiry-tracker';

let cached = global as any;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (e) {
    cached.mongoose.promise = null;
    throw e;
  }

  return cached.mongoose.conn;
}

// Define Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['food', 'medicine', 'cosmetics', 'other']
  },
  expiryDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  notes: String,
  image: String,
  storageInstructions: String,
  opened: Boolean,
  openedDate: Date,
  dosage: String,
  prescriptionDetails: String,
  frequency: String,
  openAfterUse: String,
  deletionReason: {
    type: String,
    enum: ['consumed', 'expired', 'discarded', 'other']
  }
});

// Only define the model if it hasn't been defined already
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Define User Schema for authentication
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Note: In production, this should be hashed
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
