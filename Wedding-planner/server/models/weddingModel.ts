import { Schema, model, Types } from 'mongoose';

export type WeddingStatus = 'Planning' | 'Confirmed' | 'Cancelled' | 'Finished' | 'Postponed';

export interface IWedding {
  ownerID: Types.ObjectId;          
  participants: Types.ObjectId[];   
  weddingDate: Date;
  coupleName?: string;
  startTime?: string;
  location?: string;
  addressDetails?: string;
  budget?: number;
  notes?: string;
  weddingImage?: string;
  guestCountExpected?: number;
  guestCountConfirmed?: number;
  vendorsCount?: number;
  status?: WeddingStatus;
  weddingName?: string;
  checklist?: string[];            
  currency?: string;                  
  guestList?: Types.ObjectId[];   
  actualCost?: number;
  budgetBreakdown?: Record<string, number>; 
  mealPricing?: {
    basePrice: number;
    childDiscount: number;
    childAgeLimit: number;
    bulkThreshold: number;
    bulkPrice: number;
    bulkMaxGuests: number;
    reservePrice: number;
    reserveThreshold: number;
    reserveMaxGuests: number;
  };
  invites?: {
    token: string;
    createdAt: Date;
    expiresAt?: Date;
    usedBy?: Types.ObjectId;
    usedAt?: Date;
    revoked?: boolean;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const weddingSchema = new Schema<IWedding>(
  {
    ownerID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    weddingDate: {
      type: Date,
      required: true,
    },
    coupleName: {
      type: String,
      trim: true,
    },
    startTime: {
      type: String,
    },
    location: {
      type: String,
      trim: true,
    },
    addressDetails: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
    },
    notes: {
      type: String,
      trim: true,
    },
    weddingImage: {
      type: String,
    },
    guestCountExpected: {
      type: Number,
      default: 0,
    },
    guestCountConfirmed: {
      type: Number,
      default: 0,
    },
    vendorsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Planning', 'Confirmed', 'Cancelled', 'Finished'],
      default: 'Planning',
    },
    weddingName: {
      type: String,
      trim: true,
    },
    checklist: [
      {
        type: String,
        trim: true,
      },
    ],
    currency: {
      type: String,
      default: 'USD',
    },
    guestList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Guest',
      },
    ],
    actualCost: {
      type: Number,
      default: 0,
    },
    budgetBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },
    mealPricing: {
      basePrice: {
        type: Number,
        default: 0,
      },
      childDiscount: {
        type: Number,
        default: 50,
      },
      childAgeLimit: {
        type: Number,
        default: 12,
      },
      bulkThreshold: {
        type: Number,
        default: 250,
      },
      bulkPrice: {
        type: Number,
        default: 0,
      },
      reservePrice: {
        type: Number,
        default: 0,
      },
      reserveThreshold: {
        type: Number,
        default: 300,
      },
      bulkMaxGuests: {
        type: Number,
        default: 300,
      },
      reserveMaxGuests: {
        type: Number,
        default: 500,
      },
    },
    invites: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        usedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date },
        revoked: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Wedding = model<IWedding>('Wedding', weddingSchema);
export default Wedding;