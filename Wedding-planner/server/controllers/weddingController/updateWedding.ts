import { Request, Response } from 'express';
import Wedding from '../../models/weddingModel';

const updateWedding = async (req: Request, res: Response) => {
  try {
    console.log('🚀 updateWedding called');
    console.log('🔄 Updating wedding with ID:', req.params.id);
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Meal pricing in request:', JSON.stringify(req.body.mealPricing, null, 2));
    
    // Check if wedding exists before update
    const existingWedding = await Wedding.findById(req.params.id);
    console.log('📋 Existing wedding before update:', JSON.stringify(existingWedding, null, 2));
    console.log('🍽️ Existing meal pricing before update:', JSON.stringify(existingWedding?.mealPricing, null, 2));
    
    // Log the exact update operation
    console.log('🔧 Update operation:', {
      id: req.params.id,
      updateData: req.body,
      mealPricingInUpdate: req.body.mealPricing
    });
    
    // Ensure mealPricing is included in the update
    const updateData = {
      ...req.body,
      mealPricing: req.body.mealPricing || existingWedding?.mealPricing
    };
    
    console.log('🔧 Final update data:', JSON.stringify(updateData, null, 2));
    
    const updated = await Wedding.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    if (!updated) {
      console.log('❌ Wedding not found');
      return res.status(404).json({ message: 'Wedding not found' });
    }
    
    console.log('✅ Wedding updated successfully:', JSON.stringify(updated, null, 2));
    console.log('🍽️ Meal pricing after update:', JSON.stringify(updated.mealPricing, null, 2));
    
    // Verify the update was saved correctly
    const verifyWedding = await Wedding.findById(req.params.id);
    console.log('🔍 Verification - Wedding from database after update:', JSON.stringify(verifyWedding, null, 2));
    console.log('🍽️ Verification - Meal pricing from database after update:', JSON.stringify(verifyWedding?.mealPricing, null, 2));
    
    // Ensure mealPricing is included in response
    const responseData = {
      ...updated.toObject(),
      mealPricing: updated.mealPricing || req.body.mealPricing
    };
    
    console.log('🍽️ Final mealPricing in response:', JSON.stringify(responseData.mealPricing, null, 2));
    console.log('📦 Full response data:', JSON.stringify(responseData, null, 2));
    
    res.json(responseData);
  } catch (err: any) {
    console.error('❌ Error updating wedding:', err);
    res.status(400).json({ message: err.message });
  }
};

export default updateWedding;
