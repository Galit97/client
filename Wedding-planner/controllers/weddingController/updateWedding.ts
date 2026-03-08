import { Request, Response } from 'express';
import Wedding from '../../models/weddingModel';

const updateWedding = async (req: Request, res: Response) => {
  try {
    // Check if wedding exists before update
    const existingWedding = await Wedding.findById(req.params.id);
    
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
      return res.status(404).json({ message: 'Wedding not found' });
    }
    
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
