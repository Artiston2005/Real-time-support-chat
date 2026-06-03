import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  sessionId: string;
  role: 'customer' | 'agent';
  createdAt: Date;
}

const UserSessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'agent'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUserSession>('UserSession', UserSessionSchema);
