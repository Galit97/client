import { Schema, model, Types } from 'mongoose';

export interface IVendorComparison {
  weddingID: Types.ObjectId;
  type: string;
  comparisons: Array<{
    id: string;
    name: string;
    price: number;
    notes?: string;
    phone?: string;
    instagram?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const vendorComparisonSchema = new Schema<IVendorComparison>(
  {
    weddingID: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    comparisons: [{
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      notes: String,
      phone: String,
      instagram: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique type per wedding
vendorComparisonSchema.index({ weddingID: 1, type: 1 }, { unique: true });

const VendorComparison = model<IVendorComparison>('VendorComparison', vendorComparisonSchema);
export default VendorComparison; 