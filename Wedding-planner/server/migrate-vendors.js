const mongoose = require('mongoose');
const Vendor = require('./models/vendorModel');

async function migrateVendors() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/wedding-planner');

    // Find all vendors with contractURL field
    const vendors = await Vendor.find({ contractURL: { $exists: true } });

    // Update each vendor to use contractFile instead of contractURL
    for (const vendor of vendors) {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { contractFile: vendor.contractURL || '' },
        $unset: { contractURL: 1 }
      });
    }

    // Also add fileURL field if it doesn't exist
    const vendorsWithoutFileURL = await Vendor.find({ fileURL: { $exists: false } });

    for (const vendor of vendorsWithoutFileURL) {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { fileURL: '' }
      });
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateVendors(); 