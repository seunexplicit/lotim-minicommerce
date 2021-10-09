
import { Schema, model, Document, Model, Query } from 'mongoose';

interface Variety {
     cost: number,
     price: number,
     discount?: number,
     totalPurchased?: number,
     failedPurchased?: number,
     quantity: number,
     value?: string,
     key?:string,
     imageUrl?: string,
}

interface Feature {
     key: string,
     value: string,
}

export interface IProducts {
     name: string,
     description?: string,
     features?: [Feature],
     category: [string],
     animal: [string],
     brand:string,
     varieties: [Variety],
     imageUrl: [string],
     activated?: boolean,
     outOfStock?: boolean,
}

interface Products extends IProducts, Document {
}

const ProductsSchema = new Schema<Products>({
     name: String,
     description: String,
     imageUrl: [{ type: String }],
     animal: [{ type: String }],
     category: [{ type: String }],
     brand:String,
     varieties: [{
          cost: Number,
          price: Number,
          discount: Number,
          failedPurchased: Number,
          quantity: Number,
          key: String,
          value:String,
          imageUrl: String,
     }],
     outOfStock: { type: Boolean, default: false },
     activated: { type: Boolean, default: true },
     features: [{
          value: String,
          key:String,
     }]
});

export const ProductsModel: Model<Products> = model<Products>('products', ProductsSchema);

interface Category {
     value:string
}

interface Animal {
     value:string
}