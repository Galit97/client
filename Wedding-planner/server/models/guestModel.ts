import { Schema, model, Document, Types } from 'mongoose';

export type GuestStatus = 'Invited' | 'Confirmed' | 'Declined' | 'Arrived';

export interface IGuest {
  weddingID: Types.ObjectId;     
  firstName: string;
  lastName: string;
  phone?: string;
  status: GuestStatus;
  seatsReserved: number;
  tableNumber?: number;
  invitationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    weddingID: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Invited', 'Confirmed', 'Declined', 'Arrived'],
      default: 'Invited',
    },
    seatsReserved: {
      type: Number,
      default: 1,
    },
    tableNumber: {
      type: Number,
    },
    invitationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Guest = model<IGuest>('Guest', guestSchema);
export default Guest;