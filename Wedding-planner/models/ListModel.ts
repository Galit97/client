import { Schema, model, Types } from 'mongoose';

export type ListType = 'importantThings' | 'weddingDay';

export interface IListItem {
  id: string;
  text: string;
  done?: boolean;
}

export interface IListDoc {
  weddingID: Types.ObjectId;
  type: ListType;
  items: IListItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const listSchema = new Schema<IListDoc>(
  {
    weddingID: { type: Schema.Types.ObjectId, ref: 'Wedding', required: true },
    type: { type: String, enum: ['importantThings', 'weddingDay'], required: true },
    items: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        done: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

listSchema.index({ weddingID: 1, type: 1 }, { unique: true });

const ListModel = model<IListDoc>('List', listSchema);
export default ListModel;

