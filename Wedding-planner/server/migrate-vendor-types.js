const mongoose = require('mongoose');

async function migrateVendorTypes() {
  try {
    // Try to load .env file if it exists
    try {
      require('dotenv').config();
    } catch (e) {
      // No .env file found, using default connection
    }

    // Connect to MongoDB using the same connection string as your app
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/wedding-planner';
    
    await mongoose.connect(mongoUri);

    // Get the database instance
    const db = mongoose.connection.db;
    
    // Update the collection validation schema
    await db.command({
      collMod: 'vendors',
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["weddingID", "vendorName", "price", "type"],
          properties: {
            weddingID: {
              bsonType: "objectId"
            },
            vendorName: {
              bsonType: "string"
            },
            price: {
              bsonType: "number"
            },
            depositPaid: {
              bsonType: "bool"
            },
            depositAmount: {
              bsonType: "number"
            },
            notes: {
              bsonType: "string"
            },
            contractFile: {
              bsonType: "string"
            },
            fileURL: {
              bsonType: "string"
            },
            status: {
              enum: ["Pending", "Confirmed", "Paid"]
            },
            type: {
              enum: [
                "music", "food", "photography", "decor", "clothes", 
                "makeup_hair", "internet_orders", "lighting_sound", 
                "guest_gifts", "venue_deposit", "bride_dress", 
                "groom_suit", "shoes", "jewelry", "rsvp", 
                "design_tables", "bride_bouquet", "chuppah", 
                "flowers", "other"
              ]
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      // Make sure MongoDB is running on your system
    }
    
    if (error.message.includes('Authentication failed')) {
      // Check your MongoDB connection string in .env file
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

migrateVendorTypes(); 