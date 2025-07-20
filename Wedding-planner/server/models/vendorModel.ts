import { Schema, model, Types } from 'mongoose';

export type VendorStatus = 'Pending' | 'Confirmed' | 'Paid';

export type VendorType = 'music' | 'food' | 'photography' | 'decor' | 'other';

export interface IVendor {
  weddingID: Types.ObjectId;
  vendorName: string;
  price: number;
  notes?: string;
  contractURL?: string;
  proposalURL?: string;
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
    notes: {
      type: String,
      trim: true,
    },
    contractURL: {
      type: String,
      trim: true,
    },
    proposalURL: {
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
      enum: ['music', 'food', 'photography', 'decor', 'other'],
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Vendor = model<IVendor>('Vendor', vendorSchema);
export default Vendor;