import { Schema, model } from 'mongoose';

export type UserRole =
  | 'Bride'
  | 'Groom'
  | 'MotherOfBride'
  | 'MotherOfGroom'
  | 'FatherOfBride'
  | 'FatherOfGroom'
  | 'Planner'
  | 'Member'
  | 'Other';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  passwordHash: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: [
        'Bride',
        'Groom',
        'MotherOfBride',
        'MotherOfGroom',
        'FatherOfBride',
        'FatherOfGroom',
        'Planner',
        'Member',
        'Other'
      ],
      required: true,
      default: 'Member',
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String, 
    },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>('User', userSchema);
export default User;
