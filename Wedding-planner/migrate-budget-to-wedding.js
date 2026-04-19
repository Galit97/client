const mongoose = require('mongoose');

// Define Budget schema for migration
const budgetSchema = new mongoose.Schema({
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weddingID: { type: mongoose.Schema.Types.ObjectId, ref: 'Wedding' },
  totalBudget: { type: Number, default: 0 },
  guestsMin: { type: Number, default: 50 },
  guestsMax: { type: Number, default: 150 },
  guestsExact: { type: Number },
  giftAvg: { type: Number, default: 500 },
  savePercent: { type: Number, default: 10 },
  budgetMode: { type: String, default: 'ניצמד' },
  personalPocket: { type: Number, default: 50000 },
  expenses: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Budget = mongoose.model('Budget', budgetSchema);

// Define Wedding schema for migration
const weddingSchema = new mongoose.Schema({
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  weddingDate: { type: Date, required: true },
  coupleName: String,
  startTime: String,
  location: String,
  addressDetails: String,
  budget: Number,
  budgetSettings: {
    guestsMin: { type: Number, default: 50 },
    guestsMax: { type: Number, default: 150 },
    guestsExact: { type: Number },
    giftAvg: { type: Number, default: 500 },
    savePercent: { type: Number, default: 10 },
    budgetMode: { type: String, default: 'ניצמד' },
    personalPocket: { type: Number, default: 50000 },
    totalBudget: { type: Number, default: 0 }
  },
  notes: String,
  weddingImage: String,
  guestCountExpected: { type: Number, default: 0 },
  guestCountConfirmed: { type: Number, default: 0 },
  vendorsCount: { type: Number, default: 0 },
  status: { type: String, default: 'Planning' },
  weddingName: String,
  checklist: [String],
  currency: { type: String, default: 'USD' },
  guestList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
  actualCost: { type: Number, default: 0 },
  budgetBreakdown: { type: mongoose.Schema.Types.Mixed },
  mealPricing: { type: mongoose.Schema.Types.Mixed },
  invites: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Wedding = mongoose.model('Wedding', weddingSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/wedding-planner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateBudgetsToWeddings() {
  try {
    // Get all budgets
    const budgets = await Budget.find({});
    
    for (const budget of budgets) {
      // Find the wedding for this budget
      const wedding = await Wedding.findOne({ 
        $or: [
          { ownerID: budget.ownerID },
          { participants: budget.ownerID }
        ]
      });
      
      if (!wedding) {
        continue;
      }
      
      // Create budget settings object
      const budgetSettings = {
        guestsMin: budget.guestsMin || 50,
        guestsMax: budget.guestsMax || 150,
        guestsExact: budget.guestsExact,
        giftAvg: budget.giftAvg || 500,
        savePercent: budget.savePercent || 10,
        budgetMode: budget.budgetMode || 'ניצמד',
        personalPocket: budget.personalPocket || 50000,
        totalBudget: budget.totalBudget || 0
      };
      
      // Update wedding with budget settings
      await Wedding.findByIdAndUpdate(
        wedding._id,
        { 
          budgetSettings,
          budget: budget.totalBudget || 0 // Also update legacy budget field
        },
        { new: true }
      );
    }
    
    // Optional: Remove old budget documents
    await Budget.deleteMany({});
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateBudgetsToWeddings(); 