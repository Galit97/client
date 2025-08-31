const mongoose = require('mongoose');
const Guest = require('./models/guestModel').default;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding-planner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateGuests() {
  try {
    // Find all guests that are missing the new fields
    const guests = await Guest.find({
      $or: [
        { dietaryRestrictions: { $exists: false } },
        { group: { $exists: false } },
        { side: { $exists: false } },
        { notes: { $exists: false } }
      ]
    });

    for (const guest of guests) {
      const updates = {};
      
      if (!guest.dietaryRestrictions) {
        updates.dietaryRestrictions = 'רגיל';
      }
      
      if (!guest.group) {
        updates.group = '';
      }
      
      if (!guest.side) {
        updates.side = 'shared';
      }
      
      if (!guest.notes) {
        updates.notes = '';
      }

      if (Object.keys(updates).length > 0) {
        await Guest.findByIdAndUpdate(guest._id, updates);
      }
    }
  } catch (error) {
    console.error('Error during guest migration:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateGuests();