import mongoose, { Schema, Document, Types } from "mongoose";

export interface IExpense {
  description: string;
  amount: number;
  vendorType: string;
}

export interface IBudget extends Document {
  ownerID: Types.ObjectId; 
  totalBudget: number;
  expenses: IExpense[];
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  vendorType: { type: String, required: true },
});

const BudgetSchema = new Schema<IBudget>(
  {
    ownerID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalBudget: { type: Number, required: true, min: 0 },
    expenses: { type: [ExpenseSchema], default: [] },
  },
  { timestamps: true }
);

const Budget = mongoose.model<IBudget>("Budget", BudgetSchema);

export default Budget;
