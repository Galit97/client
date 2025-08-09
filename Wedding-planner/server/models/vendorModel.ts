import { Schema, model, Types } from 'mongoose';

export type VendorStatus = 'Pending' | 'Confirmed' | 'Paid';

export type VendorType = 'music' | 'food' | 'photography' | 'decor' | 'clothes' | 'makeup_hair' | 'internet_orders' | 'lighting_sound' | 'guest_gifts' | 'venue_deposit' | 'bride_dress' | 'groom_suit' | 'shoes' | 'jewelry' | 'rsvp' | 'design_tables' | 'bride_bouquet' | 'chuppah' | 'flowers' | 'other';

export interface IVendor {
  weddingID: Types.ObjectId;
  vendorName: string;
  price: number;
  depositPaid: boolean;
  depositAmount: number;
  notes?: string;
  contractFile?: string;
  fileURL?: string;
  status: VendorStatus;
  type: VendorType;
  createdAt?: Date;
  updatedAt?: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    weddingID: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
    },
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    contractFile: {
      type: String,
      trim: true,
    },
    fileURL: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Paid'],
      default: 'Pending',
    },
    type: {
      type: String,
      enum: ['music', 'food', 'photography', 'decor', 'clothes', 'makeup_hair', 'internet_orders', 'lighting_sound', 'guest_gifts', 'venue_deposit', 'bride_dress', 'groom_suit', 'shoes', 'jewelry', 'rsvp', 'design_tables', 'bride_bouquet', 'chuppah', 'flowers', 'other'],
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Vendor = model<IVendor>('Vendor', vendorSchema);
export default Vendor;