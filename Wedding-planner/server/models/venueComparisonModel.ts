import { Schema, model, Types } from 'mongoose';

export interface IVenueComparison {
  weddingID: Types.ObjectId;
  venues: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    website: string;
    notes: string;
    whatWeLiked: string;
    whatWeDidntLike: string;
    lightingAndSound: string;
    extras: string;
    basePrice: number;
    childDiscount: number;
    childAgeLimit: number;
    bulkThreshold: number;
    bulkPrice: number;
    bulkMaxGuests: number;
    reservePrice: number;
    reserveThreshold: number;
    reserveMaxGuests: number;
    lightingAndSoundPrice: number;
    extrasPrice: number;
    pricingDates: string;
    pricingDays: string;
    totalPrice: number;
    costPerPerson: number;
  }>;
  guestCounts: {
    guestCount: number;
    adultGuests: number;
    childGuests: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const venueComparisonSchema = new Schema<IVenueComparison>(
  {
    weddingID: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
      unique: true,
    },
    venues: [{
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      address: String,
      phone: String,
      website: String,
      notes: String,
      whatWeLiked: String,
      whatWeDidntLike: String,
      lightingAndSound: String,
      extras: String,
      basePrice: {
        type: Number,
        default: 0,
      },
      childDiscount: {
        type: Number,
        default: 0,
      },
      childAgeLimit: {
        type: Number,
        default: 0,
      },
      bulkThreshold: {
        type: Number,
        default: 0,
      },
      bulkPrice: {
        type: Number,
        default: 0,
      },
      bulkMaxGuests: {
        type: Number,
        default: 0,
      },
      reservePrice: {
        type: Number,
        default: 0,
      },
      reserveThreshold: {
        type: Number,
        default: 0,
      },
      reserveMaxGuests: {
        type: Number,
        default: 0,
      },
      lightingAndSoundPrice: {
        type: Number,
        default: 0,
      },
      extrasPrice: {
        type: Number,
        default: 0,
      },
      pricingDates: String,
      pricingDays: String,
      totalPrice: {
        type: Number,
        default: 0,
      },
      costPerPerson: {
        type: Number,
        default: 0,
      },
    }],
    guestCounts: {
      guestCount: {
        type: Number,
        default: 100,
      },
      adultGuests: {
        type: Number,
        default: 80,
      },
      childGuests: {
        type: Number,
        default: 20,
      },
    },
  },
  {
    timestamps: true,
  }
);

const VenueComparison = model<IVenueComparison>('VenueComparison', venueComparisonSchema);
export default VenueComparison; 