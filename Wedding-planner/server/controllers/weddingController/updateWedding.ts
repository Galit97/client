import { Request, Response } from 'express';
import Wedding from '../../models/weddingModel';

const updateWedding = async (req: Request, res: Response) => {
  try {
  
    
    // Check if wedding exists before update
    const existingWedding = await Wedding.findById(req.params.id);
   
    
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
    
 
    
    res.json(responseData);
  } catch (err: any) {
  
    res.status(400).json({ message: err.message });
  }
};

export default updateWedding;
