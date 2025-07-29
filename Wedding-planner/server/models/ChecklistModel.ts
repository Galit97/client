import { Schema, model, Types } from 'mongoose';

export interface IChecklist {
  weddingID: Types.ObjectId;    // Add wedding association
  task: string;               
  done: boolean;              
  relatedVendorId?: Types.ObjectId; 
  relatedRoleId?: Types.ObjectId;  // Fix typo
  notes?: string;                
  dueDate?: Date;               
  createdAt?: Date;
  updatedAt?: Date;
}

const checklistSchema = new Schema<IChecklist>(
  {
    weddingID: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
    },
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
    relatedRoleId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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