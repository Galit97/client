import { Schema, model, Document, Types } from 'mongoose';

export type GuestStatus = 'Invited' | 'Confirmed' | 'Declined' | 'Arrived';

export interface IGuest {
  weddingID: Types.ObjectId;     
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  status: GuestStatus;
  seatsReserved: number;
  tableNumber?: number;
  invitationSent: boolean;
  dietaryRestrictions?: string;
  group?: string;
  side?: 'bride' | 'groom' | 'shared';
  notes?: string;
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
      required: true,
      trim: true,
    },
    email: {
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
    dietaryRestrictions: {
      type: String,
      enum: ['רגיל', 'צמחוני', 'טבעוני', 'ללא גלוטן', 'אחר'],
      default: 'רגיל',
    },
    group: {
      type: String,
      trim: true,
    },
    side: {
      type: String,
      enum: ['bride', 'groom', 'shared'],
      default: 'shared',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Guest = model<IGuest>('Guest', guestSchema);
export default Guest;