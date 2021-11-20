import { Schema, model, Document, Model, Query, NativeError } from 'mongoose';

interface SubUserDoc extends Document {
     user: string
}
const deleteOneCallback = async function <T extends SubUserDoc>(self: Query<any, T>, props: 'orders' | 'activities' | 'enquiries' | 'appointments') {
     try {
          const _doc = await self.findOne(self.getQuery());
          const users = await UsersModel.findOne({ _id: _doc?.user });
          if (users) users[props] = users[props]?.filter(each => each !== _doc?._id);
          await users?.save();
          return true;
     }
     catch (err) {
          throw err;
     }
}

export interface UserLogin {
     email: string,
     password: string,
}

export interface Users {
     firstName?: string,
     email?: string,
     phoneNumber?: string,
}

export interface OrderProduct {
     quantity: number,
     product: string,
     price: number,
     cost: number,
     discount: number | null | undefined,
     variety: string
}

export interface Payment extends Document {
     status: boolean,
     data: {
          reference: string,
          amount: number,
          channel: string,
          paid_at: Date,
          fees: number,
          customer: {
               first_name: string,
               last_name: string,
               email: string,
               phone: string,
          }
     }
     productId: string,
     paymentFor: "consultation"|"product"|"service"
}

const PaymentSchema = new Schema<Payment>({
     status: Boolean,
     data: {
          reference: String,
          amount: Number,
          channel: String,
          paid_at: Date,
          fees: Number,
          customer: {
               first_name: String,
               last_name: String,
               email: String,
               phone: String,
          }
     },
     productId: String,
     paymentFor: { type: String, enum: ["consultation", "product", "service"] }
}, {
     timestamps: true
})

export const PaymentModel = model<Payment>("Payment", PaymentSchema);

export interface IOrder {
     delivery: boolean,
     deliveryAddress: string,
     paid: boolean,
     paymentReference?: string,
     orders: OrderProduct[],
     totalPurchasedPrice: number,
     fraudulent: boolean,
     status: 'open' | 'delivery' | 'closed' | 'rejected' | 'cancel',
     user: string,
     payment: string
}

export interface Orders extends IOrder, Document {
     remarks: string,
     closedAt: Date,
     receivedAt: Date,
     deliveryCommencedAt: Date,
     _delete:boolean
}

const OrdersSchema = new Schema<Orders>({
     payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
     remarks: String,
     closedAt: Date,
     deliveryCommencedAt: Date,
     totalPurchasedPrice: Number,
     delivery: Boolean,
     deliveryAddress: String,
     receivedAt: Date,
     fraudulent: { type: Boolean, select: false },
     paymentReference: String,
     paid: Boolean,
     status: {
          type: String, enum: ['open', 'delivery', 'closed', 'completed', 'cancelled'], default:'open'
     },
     _delete: { type: Boolean, default: false, select:false },
     user: { type: Schema.Types.ObjectId, ref: 'Users' },
     orders: [
          {
               quantity: Number,
               product: { type: Schema.Types.ObjectId, ref: 'products' },
               variety: String,
               price: Number,
               cost: Number,
               discount: Number
          }
     ]
}, {
     timestamps: true
});

OrdersSchema.pre("deleteOne", { query: true, document: false }, async function (this: Query<any, Orders>, next) {
     try {
          await deleteOneCallback(this, "orders");
          next()
     }
     catch (err) {
          next(err instanceof NativeError ? err : null);
     }
})

OrdersSchema.post("save", async function (doc, next) {
     try {
          const [users, payment] = await Promise.all([
               UsersModel.findOne({ _id: this.user }),
               PaymentModel.findOne({ 'data.reference': this.payment })
          ]);
          if (users && !users.orders?.includes(this._id)) users.orders?.push(this._id);
          if (payment) {
               payment.productId = this._id;
               payment.paymentFor = "product";
          }
          await users?.save();
          await payment?.save();
          next()
     }
     catch (err) {
          next(err instanceof NativeError ? err : null);
     }
})

export const OrdersModel = model<Orders>('Orders', OrdersSchema);

interface UserActivities extends Document {
     date: Date,
     action?: string,
     products?: string,
     url?: string,
     user: string
}

const UserActivitiesSchema = new Schema<UserActivities>({
     date: Date,
     action: String,
     products: { type: Schema.Types.ObjectId, ref: 'products' },
     url: String,
     user: { type: Schema.Types.ObjectId, ref: 'Users' }
}, {
     timestamps: true
})

UserActivitiesSchema.pre("deleteOne", { query: true, document: false }, async function (this: Query<any, UserActivities>, next) {
     try {
          await deleteOneCallback(this, "activities");
          next()
     }
     catch (err) {
          next(err instanceof NativeError ? err : null);
     }
})

UserActivitiesSchema.post("save", async function (doc, next) {
     try {
          const users = await UsersModel.findOne({ _id: this.user });
          if (users && !users.activities?.includes(this._id)) users?.activities?.push(this._id);
          if (users?.lastActionDate) users["lastActionDate"] = new Date();
          await users?.save();
          next()
     }
     catch (err) {
          next(err instanceof NativeError ? err : null);
     }
})

export const UserActivitiesModel = model<UserActivities>('UserActivities', UserActivitiesSchema)

interface Enquiries extends Document {
     enquiry: string,
     response: string,
     date: Date,
     attendedDate?: Date,
     remarks?: string,
     status: 'open' | 'closed' | 'terminated',
     user: string,
     _delete:boolean
}

const EnquirySchema = new Schema<Enquiries>({
     enquiry: { type: String, required: true },
     date: { type: Date, default: new Date() },
     attendedDate: Date,
     remarks: String,
     response: String,
     status: { type: String, enum: ['open', 'closed', 'terminated'] },
     _delete: { type: Boolean, default: false, select:false },
     user: { type: Schema.Types.ObjectId, ref: 'Users' }
}, {
     timestamps: true
});

EnquirySchema.pre("deleteOne", { query: true, document: false }, async function (this: Query<any, Enquiries>, next) {
     try {
          await deleteOneCallback(this, "appointments");
          next()
     }
     catch (err) {
          next(err instanceof NativeError ? err : null);
     }
})

EnquirySchema.post("save", async function (doc, next) {
     try {
          const users = await UsersModel.findOne({ _id: this.user });
          if (users && !users.enquiries?.includes(this._id)) users?.enquiries?.push(this._id);
          if (users?.lastActionDate) users["lastActionDate"] = new Date();
          await users?.save();
          next()
     }
     catch (err) {
          next(err instanceof NativeError ? err : null);
     }
})


export const EnquiryModel = model<Enquiries>('Enquiries', EnquirySchema);

interface Appointment {
     reason: string,
     description: string,
     bookingsDate: Date,
}

export interface IModelAppointment extends Appointment, Users { }

interface IAppointment extends Appointment, Document {
     status: 'open' | 'closed' | 'terminated',
     remarks?: string,
     user: string,
     closeDate: Date,
     _delete:boolean
}

const AppointmentSchema: Schema<IAppointment> = new Schema({
     reason: { type: String, required: true },
     description: String,
     status: {
          type: String, enum: ['open', 'closed', 'terminated'], default:'open'
     },
     closedDate: Date,
     bookingsDate: Date,
     remarks: String,
     _delete: {type:Boolean, default:false, select:false },
     user: { type: Schema.Types.ObjectId, ref: 'Users' }
}, {
     timestamps: true
})

AppointmentSchema.pre("deleteOne", { query: true, document: false }, async function (this: Query<any, IAppointment>, next) {
     try {
          await deleteOneCallback(this, "enquiries");
          next()
     }
     catch (err) {
          next(err instanceof NativeError ? err : null);
     }
})

AppointmentSchema.post("save", async function (doc, next) {
     try {
          const users = await UsersModel.findOne({ _id: this.user });
          if (users && !users.appointments?.includes(this._id)) users?.appointments?.push(this._id);
          if (users?.lastActionDate) users["lastActionDate"] = new Date();
          await users?.save();
          next()
     }
     catch (err) {
          next(err instanceof NativeError ? err : null);
     }
})

export const AppointmentModel = model<IAppointment>('Appointments', AppointmentSchema);

export interface ICreateUser extends Users {
     lastName?: string,
     password?: string,
}

export interface IUsers extends ICreateUser, Document {
     address?: string,
     enquiries?: Array<string>,
     orders?: Array<string>,
     activities?: Array<string>,
     lastActionDate: Date,
     appointments?: Array<string>,
}


const Users = new Schema<IUsers>({
     firstName: String,
     lastName: String,
     email: { type: String, unique: true },
     password: { type: String, select: false },
     phoneNumber: String,
     address: String,
     enquiries: [{ type: Schema.Types.ObjectId, ref: 'Enquiries' }],
     activities: [{ type: Schema.Types.ObjectId, ref: 'UserActivities' }],
     orders: [{ type: Schema.Types.ObjectId, ref: 'Orders' }],
     lastActionDate: { type: Date, default: new Date() },
     appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointments' }]
}, {
     timestamps: true
});

export const UsersModel: Model<IUsers> = model('Users', Users);

