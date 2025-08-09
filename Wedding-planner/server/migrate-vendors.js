const mongoose = require('mongoose');
const Vendor = require('./models/vendorModel');

async function migrateVendors() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/wedding-planner');
    console.log('Connected to MongoDB');

    // Find all vendors with contractURL field
    const vendors = await Vendor.find({ contractURL: { $exists: true } });
    console.log(`Found ${vendors.length} vendors with contractURL field`);

    // Update each vendor to use contractFile instead of contractURL
    for (const vendor of vendors) {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { contractFile: vendor.contractURL || '' },
        $unset: { contractURL: 1 }
      });
      console.log(`Updated vendor: ${vendor.vendorName}`);
    }

    // Also add fileURL field if it doesn't exist
    const vendorsWithoutFileURL = await Vendor.find({ fileURL: { $exists: false } });
    console.log(`Found ${vendorsWithoutFileURL.length} vendors without fileURL field`);

    for (const vendor of vendorsWithoutFileURL) {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { fileURL: '' }
      });
      console.log(`Added fileURL to vendor: ${vendor.vendorName}`);
    }

    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateVendors(); 