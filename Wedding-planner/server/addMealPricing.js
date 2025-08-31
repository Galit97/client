const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding-planner')
  .then(() => {})
  .catch(err => console.error('MongoDB connection error:', err));

// Define the wedding schema (simplified version)
const weddingSchema = new mongoose.Schema({
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  weddingDate: {
    type: Date,
    required: true,
  },
  startTime: String,
  location: String,
  addressDetails: String,
  budget: Number,
  notes: String,
  weddingImage: String,
  guestCountExpected: { type: Number, default: 0 },
  guestCountConfirmed: { type: Number, default: 0 },
  vendorsCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Planning', 'Confirmed', 'Cancelled', 'Finished'],
    default: 'Planning',
  },
  weddingName: String,
  checklist: [String],
  currency: { type: String, default: 'USD' },
  guestList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
  actualCost: { type: Number, default: 0 },
  budgetBreakdown: { type: Map, of: Number, default: {} },
  mealPricing: {
    basePrice: { type: Number, default: 0 },
    childDiscount: { type: Number, default: 50 },
    childAgeLimit: { type: Number, default: 12 },
    bulkThreshold: { type: Number, default: 250 },
    bulkPrice: { type: Number, default: 0 },
    bulkMaxGuests: { type: Number, default: 300 },
    reservePrice: { type: Number, default: 0 },
    reserveThreshold: { type: Number, default: 300 },
    reserveMaxGuests: { type: Number, default: 500 },
  },
}, {
  timestamps: true,
});

const Wedding = mongoose.model('Wedding', weddingSchema);

async function addMealPricingToWedding() {
  try {
    const wedding = await Wedding.findById('6887a674ace27971ca6056ef');
    
    if (!wedding) {
      return;
    }
    
    // Add default mealPricing if it doesn't exist
    if (!wedding.mealPricing) {
      const defaultMealPricing = {
        basePrice: 0,
        childDiscount: 50,
        childAgeLimit: 12,
        bulkThreshold: 250,
        bulkPrice: 0,
        bulkMaxGuests: 300,
        reservePrice: 0,
        reserveThreshold: 300,
        reserveMaxGuests: 500
      };
      
      wedding.mealPricing = defaultMealPricing;
      await wedding.save();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
addMealPricingToWedding(); 