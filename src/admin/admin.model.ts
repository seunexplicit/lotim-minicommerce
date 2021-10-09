import { Schema, model, Document, Model, Query } from 'mongoose';

interface OTP {
     createdAt: Date,
     code:string
}

export interface Admin extends Document {
     otp: OTP,
     pin: string,
     lastLogin: Date,
     email:string
}

const AdminSchema = new Schema<Admin>({
     otp: {
          createdAt: Date,
          code:String
     },
     pin: String,
     lastLogin: Date,
     email: { type: String, required: true }
});

export const AdminModel = model<Admin>('Admin', AdminSchema);