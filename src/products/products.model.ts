
import { Schema, model, Document, Model, Query } from 'mongoose';

export interface PriceHistory {
     price: number,
     cost: number,
     discount: number,
     changedAt:Date
}


export interface Variety {
     cost: number,
     price: number,
     discount?: number,
     completedOrder: number,
     canceledOrder: number,
     rejectedOrder: number,
     quantity: number,
     value?: string,
     key?: string,
     deficitQuantity: number,
     totalPurchasedPrice:number,
     outOfStock: boolean,
     totalOrder:number,
     imageUrl?: string,
     priceHistory: PriceHistory[]
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
     totalQuantity:Number,
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
          totalPurchasedPrice:{ type:Number, default:0},
          completedOrder: { type: Number, default: 0 },
          canceledOrder: { type: Number, default: 0 },
          rejectedOrder: { type: Number, default: 0 },
          totalOrder: { type: Number, default: 0 },
          priceHistory: [{
               price: Number,
               cost: Number,
               discount: Number,
               changedAt:Date
          }],
          totalQuantity: Number,
          quantity: Number,
          deficitQuantity:Number,
          outOfStock: { type: Boolean, default: false },
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
}, {
     timestamps: true
});

export const ProductsModel: Model<Products> = model<Products>('products', ProductsSchema);

export interface Category {
     value:string
}

interface ICategory extends Document{ }

export interface Animal {
     value:string
}

interface IAnimal extends Document { }


const CategorySchema = new Schema<ICategory>({
     value: { type: String, unique: true }
});

export const CategoryModel = model<ICategory>('CategoryModel', CategorySchema);

const AnimalSchema = new Schema<IAnimal>({
     value: { type: String, unique: true }
})

export const AnimalModel = model<IAnimal>('AnimalModel', AnimalSchema);