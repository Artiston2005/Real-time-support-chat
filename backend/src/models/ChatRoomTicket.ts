import mongoose, { Schema, Document } from 'mongoose';
import { IUserSession } from './UserSession';

export interface IChatRoomTicket extends Document {
  roomId: string;
  status: 'open' | 'resolved';
  customerSessionId: IUserSession['_id'];
  agentSessionId?: IUserSession['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomTicketSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  customerSessionId: { type: Schema.Types.ObjectId, ref: 'UserSession', required: true },
  agentSessionId: { type: Schema.Types.ObjectId, ref: 'UserSession' }
}, { timestamps: true });

export default mongoose.model<IChatRoomTicket>('ChatRoomTicket', ChatRoomTicketSchema);
