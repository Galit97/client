import { Schema, model, Types } from 'mongoose';

export interface IChecklist {
  task: string;               
  done: boolean;              
  relatedVendorId?: Types.ObjectId; 
  relatedoleId?: Types.ObjectId; 
  notes?: string;                
  dueDate?: Date;               
  createdAt?: Date;
  updatedAt?: Date;
}

const checklistSchema = new Schema<IChecklist>(
  {
    task: {
      type: String,
      required: true,
      trim: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
    relatedVendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    notes: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Checklist = model<IChecklist>('Checklist', checklistSchema);
export default Checklist;