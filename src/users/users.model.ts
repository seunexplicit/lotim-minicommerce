import { Schema, model, Document, Model, Query} from 'mongoose';

interface SubUserDoc extends Document {
     user:string
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
     password:string,
}

export interface Users {
     firstName?: string,
     email?: string,
     phoneNumber?: string,
}

interface OrderProduct {
     quantity: number,
     product:string,
}

interface Payment extends Document{
     status: boolean,
     data: {
          status: string,
          reference: string,
          amount: number,
          paid_at: Date,
          channel: string,
          authorization: {
               last4: string,
               channel: string,
               card_type: string,
          },
     },
     orderId:string,
}

const PaymentSchema = new Schema<Payment>({
     status: Boolean,
     data: {
          status: String,
          reference: String,
          amount: Number,
          paid_at: Date,
          channel: String,
          authorization: {
               last4: String,
               channel: String,
               card_type: String,
          },
     },
     orderId: String,
})

const PaymentModel = model<Payment>("Payment", PaymentSchema);

interface IOrder {
     deliveryMeans: 'pickup' | 'delivery',
     deliveryAddress: string,
     paid: boolean,
     paymentReference: string,
     orders: [
          OrderProduct
     ]
}

interface Orders extends IOrder, Document {
     remarks: string,
     purchasedDate: Date,
     rejectedDate: Date,
     closedDate: Date,
     totalPurchasedPrice: number,
     receivedDate: Date,
     status: 'open' | 'delivery' | 'closed' | 'completed' | 'cancel',
     user: string,
     payment:string
}

const OrdersSchema = new Schema<Orders>({
     payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
     remarks: String,
     purchasedDate: Date,
     rejectedDate: Date,
     closedDate: Date,
     totalPurchasedPrice: Number,
     deliveryMeans: { type: String, enum: ['pickup', 'delivery'] },
     deliveryAddress: String,
     receivedDate: Date,
     paymentRefernce: String,
     paid:Boolean,
     status: {
          type: String, enum: ['open', 'delivery', 'closed', 'completed', 'cancelled']
     },
     user: { type: Schema.Types.ObjectId, ref: 'Users' },
     orders: [
          {
               quantity: Number,
               product: { type: Schema.Types.ObjectId, ref:'Products' }
          }
     ]
});

OrdersSchema.pre("deleteOne", { query: true, document: false }, async function (this: Query<any, Orders>, next) {
     try {
          await deleteOneCallback(this, "orders");
          next()
     }
     catch (err) {
          next(err);
     }
})

OrdersSchema.post("save", async function (doc, next){
     try {
          const [users, payment] = await Promise.all([
               UsersModel.findOne({ _id: this.user }),
               PaymentModel.findOne({ 'data.reference': this.paymentReference })
          ]);
          users?.orders?.push(this._id);
          if (payment) payment.orderId = this._id;
          await users?.save();
          await payment?.save();
          next()
     }
     catch (err) {
          next(err);
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
     products: { type: Schema.Types.ObjectId, ref: 'Products' },
     url: String,
     user: { type: Schema.Types.ObjectId, ref: 'Users' }
})

UserActivitiesSchema.pre("deleteOne", { query: true, document: false }, async function (this: Query<any, UserActivities>, next) {
     try {
          await deleteOneCallback(this, "activities");
          next()
     }
     catch (err) {
          next(err);
     }
})

UserActivitiesSchema.post("save", async function (doc, next) {
     try {
          const users = await UsersModel.findOne({ _id: this.user });
          users?.activities?.push(this._id);
          if (users?.lastActionDate) users["lastActionDate"] = new Date();
          await users?.save();
          next()
     }
     catch (err) {
          next(err);
     }
})

export const UserActivitiesModel = model<UserActivities>('UserActivities', UserActivitiesSchema)

interface Enquiries extends Document {
     enquiry: string,
     response:string,
     date: Date,
     attendedDate?: Date,
     remarks?: string,
     status: 'open' | 'closed' | 'terminated',
     user: string
}

const EnquirySchema = new Schema<Enquiries>({
     enquiry: { type: String, required: true },
     date: { type: Date, default: new Date() },
     attendedDate: Date,
     remarks: String,
     response:String,
     status: { type: String, enum: ['open', 'closed', 'terminated'] },
     user: { type: Schema.Types.ObjectId, ref: 'Users' }
});

EnquirySchema.pre("deleteOne", { query: true, document: false }, async function (this: Query<any, Enquiries>, next) {
     try {
          await deleteOneCallback(this, "appointments");
          next()
     }
     catch (err) {
          next(err);
     }
})

EnquirySchema.post("save", async function (doc, next) {
     try {
          const users = await UsersModel.findOne({ _id: this.user });
          users?.enquiries?.push(this._id);
          if (users?.lastActionDate) users["lastActionDate"] = new Date();
          await users?.save();
          next()
     }
     catch (err) {
          next(err);
     }
})


export const EnquiryModel = model<Enquiries>('Enquiries', EnquirySchema);

interface Appointment {
     reason: string,
     description: string,
     bookingsDate: Date,
}

export interface IModelAppointment extends Appointment, Users{ } 

interface IAppointment extends Appointment, Document {
     status: 'open' | 'closed' | 'terminated',
     remarks?: string,
     user: string,
     closeDate:Date
}

const AppointmentSchema: Schema<IAppointment> = new Schema({
     reason: { type:String, required:true},
     description: String,
     status: {
          type: String, enum: ['open', 'closed', 'terminated']
     },
     closedDate:Date,
     bookingsDate: Date,
     remarks: String,
     user: { type: Schema.Types.ObjectId, ref:'Users' }
})

AppointmentSchema.pre("deleteOne", { query: true, document: false }, async function (this: Query<any, IAppointment>, next) {
     try {
          await deleteOneCallback(this, "enquiries");
          next()
     }
     catch (err) {
          next(err);
     }
})

AppointmentSchema.post("save", async function (doc, next) {
     try {
          const users = await UsersModel.findOne({ _id: this.user });
          users?.appointments?.push(this._id);
          if (users?.lastActionDate) users["lastActionDate"] = new Date();
          await users?.save();
          next()
     }
     catch (err) {
          next(err);
     }
})

export const AppointmentModel = model<IAppointment>('Appointments', AppointmentSchema);

export interface ICreateUser extends Users {
     lastName?: string,
     password?: string,
}

export interface IUsers extends ICreateUser, Document{
     address?: string,
     enquiries?: Array<string>,
     orders?:Array<string>,
     activities?:Array<string>,
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
     enquiries: [{ type: Schema.Types.ObjectId, ref: 'enquries' }],
     activities: [{ type: Schema.Types.ObjectId, ref: 'UserActivities' }],
     orders: [{ type: Schema.Types.ObjectId, ref: 'Orders' }],
     lastActionDate: { type: Date, default: new Date() },
     appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointments' }]
});

export const UsersModel: Model<IUsers> = model('Users', Users);

