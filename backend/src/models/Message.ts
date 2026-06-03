import mongoose, { Schema, Document } from 'mongoose';
import { IChatRoomTicket } from './ChatRoomTicket';
import { IUserSession } from './UserSession';

export interface IMessage extends Document {
  roomId: IChatRoomTicket['roomId'];
  senderId: IUserSession['sessionId'];
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  roomId: { type: String, required: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IMessage>('Message', MessageSchema);
