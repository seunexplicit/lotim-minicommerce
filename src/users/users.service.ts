import {
     UsersModel,
     Users,
     AppointmentModel,
     OrdersModel,
     PaymentModel,
     Payment,
     OrderProduct,
     Orders,
     IOrder,
     IUsers,
     ICreateUser,
     UserLogin,
     EnquiryModel,
} from './users.model';
import Hash from '../lib/hash_password';
import LoginEncryption from '../lib/login';
import { NextFunction, Request, Response } from 'express';
import { MailService } from '../common/common.service';
import { VerifyPTransaction } from '../lib/paystack';
import { ProductsModel } from '../products/products.model';

export class UserService {

     constructor(
          
     ) { }

     async addNewUser(req: Request, res: Response, next: NextFunction) {
          try {
               const body: Users = req.body;
               const user = await UsersModel.findOne(body);
               if (user) return res.status(409).send('user already exist!');

               const newUser = new UsersModel(body);
               return await newUser.save()
          }
          catch (err) {
               throw err
          }
     }

     async createNewUser(req: Request, res: Response, next: NextFunction) {
          try {
               const body: ICreateUser = req.body;
               let user = await UsersModel.findOne({ email: body.email })
                    .select('+password +email');

               if (user?.password) return res.status(409).send({ status: false, message: "User already exist" });
               const hashPassword = Hash(body.password || '');
               if (user) await user.update({ $set: { ...body, password: hashPassword } })
               else {
                    user = new UsersModel({ ...body, password: hashPassword });
                    await user.save();
               };

               const credentials = LoginEncryption(
                    hashPassword,
                    user?.email || '',
                    user?._id,
                    Number(process.env.CLIENT_CREDENTIAL_EXPIRATION),
                    process.env.CLIENT_API_KEY || ''
               );
               user.password = undefined;
               return res.status(200).send({ status: true, message:"Account created successfully", data:{ credentials, user: user  } })

          }
          catch (err) {
               next(err);
          }
     }

     async updateUser(req: Request, res: Response, next: NextFunction) {
          try {
               const { body, credentialId } = req;
               const user = await UsersModel.findOne({_id:credentialId})
                    .select('+password')
               if (!user || user.password !== Hash(body.oldPassword || '')) {
                    return res.status(400).send({status:false, message:"Invalid data/password"})
               }

               if (body.newPassword) body['password'] = Hash(body.newPassword);
               await user.updateOne({ ...body })
               let credentials;
               if (body.email || body.newPassword) {
                    credentials = LoginEncryption(
                         Hash(body.newPassword),
                         user?.email || '',
                         user?._id,
                         Number(process.env.CLIENT_CREDENTIAL_EXPIRATION),
                         process.env.CLIENT_API_KEY || ''
                    );
               }
               user.password = undefined;
               res.status(200).send({ status: true, message: "Update successful", data: { user: user, credentials } })
          }
          catch (err) {
               next(err)
          }
     }

     async loginUser(req: Request, res: Response, next: NextFunction) {
          try {
               const body: UserLogin = req.body;
               const user = await UsersModel.findOne({ email: body.email })
                    .select('+password');
               if (!(user?.password === Hash(body.password))) return res.status(401).send('wrong username or password');
               const credentials = LoginEncryption(
                    user?.password || '',
                    body.email,
                    user?._id,
                    Number(process.env.CLIENT_CREDENTIAL_EXPIRATION),
                    process.env.CLIENT_API_KEY||''
               );
               user.password = undefined;
               return res.status(200).send({ status: true, message:"Login successfully", data: { credentials, user:user } });
          }
          catch (err) {
               next(err);
          }
     }

     async postOrders(req: Request, res: Response, next: NextFunction) {
          try {
               const { body, credentialId } = req;
               let pResponse: any;
               let paymentSchema: Payment | undefined = undefined;
               let checkIfOrderExist = await OrdersModel.findOne({ paymentReference: body.paymentReference });
               if (checkIfOrderExist) return res.status(400).send({ status: false, message: "Order has been already been confirmed, Check with admin" });
               if (body.paid) {
                    pResponse = await VerifyPTransaction(body.paymentReference);
                    if (!pResponse?.status) return res.status(400).send({ status: false, message: "payment cannot be verified" });
                    const paymentData = {
                         status: pResponse?.status,
                         data: {
                              reference: pResponse?.data?.reference,
                              amount: pResponse?.data?.amount,
                              channel: pResponse?.data?.channel,
                              paid_at: pResponse?.data?.paid_at,
                              fees: pResponse?.data?.fees,
                              customer: {
                                   first_name: pResponse?.data?.customer?.first_name,
                                   last_name: pResponse?.data?.customer?.last_name,
                                   email: pResponse?.data?.customer?.email,
                                   phone: pResponse?.data?.customer?.phone,
                              }
                         }
                    }
                    paymentSchema = await new PaymentModel(paymentData);
                    await paymentSchema.save();
               }
               const products = await ProductsModel.find({
                    _id: {
                         $in: [...(body.products.map((value: any) => value.id))]
                    }
               });

               let eachProducts: OrderProduct[] = [];
               let totalPrice: number = 0;
               let fraudulent = false;
               (body.products as Array<any>).forEach((value, id) => {
                    const product = products.find(each => each._id == value.id);
                    const varietyIndex = product!.varieties.findIndex((each) => (each as any)._id == value.variation);
                    const variety = product?.varieties[varietyIndex];
                    const cost = variety!.discount ? Number(variety?.price) - (Number(variety?.discount) * Number(variety?.price)) : Number(variety?.price);           
                    eachProducts.push({
                         product: value.id,
                         price: Number(cost * value?.quantity),
                         discount: variety?.discount,
                         quantity: value?.quantity!,
                         cost: variety?.price!,
                         variety: value.variation
                    });
                    product!.varieties[varietyIndex].totalOrder += value!.quantity;
                    product!.varieties[varietyIndex].quantity -= value!.quantity
                    console.log(product!.varieties[varietyIndex].quantity);
                    if (product!.varieties[varietyIndex].quantity <= 0) {
                         product!.varieties[varietyIndex].outOfStock = true;
                         product!.varieties[varietyIndex].deficitQuantity += Math.abs(product!.varieties[varietyIndex].quantity)
                         product!.varieties[varietyIndex].quantity = 0;
                    }
                    let remProductQty = 0;
                    product!.varieties.forEach((_v) => { remProductQty += _v.quantity })
                    if (remProductQty <= 0) product!.outOfStock = true;
                    totalPrice += Number(cost * value?.quantity);
                    product?.save();
               });

               console.log(eachProducts);

               const paystackPaidAmount = Number(pResponse?.data?.amount||0)/100
               if (body.paid &&
                    ((totalPrice + 1 < paystackPaidAmount) || (totalPrice - 1 > paystackPaidAmount))) {
                    fraudulent = true;
               }

               let orderData: IOrder = {
                    delivery: body.delivery,
                    deliveryAddress: body.deliveryAddress,
                    orders: eachProducts,
                    paid: body.paid,
                    paymentReference: body.paymentReference,
                    fraudulent,
                    totalPurchasedPrice: totalPrice,
                    user: credentialId,
                    status: 'open',
                    payment: paymentSchema?._id,
               };

               if (body.primaryAddress) {
                    UsersModel.updateOne({ _id: credentialId }, { address:body.deliveryAddress })
               }

               const newOrder = new OrdersModel(orderData);
               await newOrder.save();
               fraudulent ?
                    res.status(400).send({ status: false, message: `An issue with payment confirmation; please contact admin. issue code: ${newOrder._id}` }) :
                    res.status(200).send({ status: true, message: "Order submitted successfully", data: newOrder });

          }
          catch (err) {
               next(err);
          }
     }

     async getOrders(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, query } = req;
               const skip:number = query.skip ? Number(query.skip) : 0;
               const limit:number = query.limit ? Number(query.limit) : 20;
               const [order, total] = await Promise.all([
                    OrdersModel.find({ user: credentialId })
                         .skip(skip)
                         .limit(limit)
                         .populate({
                              path: 'orders.product',
                              select:'name imageUrl brand'
                         }),
                    OrdersModel.countDocuments({ user: credentialId })
               ])
               return res.status(200).send({
                    status: true,
                    message: "success",
                    data: { order: order, document: { total, limit, skip } }
               });
          }
          catch (err) {
               next(err);
          }
     }

     async getOneOrders(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, params } = req;
               console.log(credentialId, params)
               const order = await OrdersModel
                    .findOne({ _id: params.orderId, user: credentialId })
                    .populate('orders.product')
               return res.status(200).send({ status: true, message: "success", data: order });
          }
          catch (err) {
               next(err);
          }
     }

     async postAppointments(req: Request, res: Response, next: NextFunction) {
          try {
               const { body } = req;
               const user = await UsersModel.findOneAndUpdate({ email: body.email }, {
                    email: body.email,
                    phoneNumber: body.phoneNumber,
               }, { upsert: true })

               if (user && !user.firstName) {
                    user["firstName"] = body.name
                    user.save();
               }
               const appointment = await new AppointmentModel({
                    reason: body.reason,
                    description: body.description,
                    user: user?._id,
                    bookingsDate: body.bookingsDate
               });
               await appointment.save();
               res.status(200).send({ status: true, message: "Appointment booked successfully", data: appointment })
          }
          catch (err) {
               console.log(err);
               next(err)
          }
     }

     async getAppointments(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, query } = req;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const [appointment, total] = await Promise.all([
                    AppointmentModel.find({ user: credentialId, _delete:false })
                         .skip(skip)
                         .limit(limit),
                    AppointmentModel.countDocuments({ user: credentialId, _delete: false })
               ])
               return res.status(200).send({ status: true, message: "success", data: { appointment:appointment, document: { total, limit, skip } } });
          }
          catch (err) {
               next(err);
          }
     }

     async getAppointment(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, params } = req;
               const appointment = await AppointmentModel.findOne({ _id: params.id, user: credentialId, _delete:false })
               return res.status(200).send({ status: true, message: "success", data: appointment });
          }
          catch (err) {
               next(err);
          }
     }

     async deleteAppointment(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, params } = req;
               await AppointmentModel.updateOne({ _id: params.id, user: credentialId }, { _delete: true });
               return res.status(200).send({ status: true, message: "success" })
          }
          catch (err) {
               next(err);
          }
     }

     async postEnquiry(req: Request, res: Response, next: NextFunction) {
          try {
               const { body } = req;
               const user = await UsersModel.findOneAndUpdate({ email: body.email }, {
                    email: body.email,
                    phoneNumber: body.phoneNumber,
               }, { upsert: true })

               if (user && !user.firstName) {
                    user["firstName"] = body.name
                    user.save();
               }
               const enquiry = new EnquiryModel({
                    enquiry: body.enquiry,
                    user: user?._id,
               });

               await enquiry.save();
               res.status(200).send({ status: true, message: "Enquiry submitted successfully", data: enquiry })
          }
          catch (err) {
               console.log(err);
               next(err)
          }
     }

     async getEnquiries(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, query } = req;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const [enquiries, total] = await Promise.all([
                    EnquiryModel.find({ user: credentialId, _delete:false })
                         .skip(skip)
                         .limit(limit),
                    EnquiryModel.countDocuments({ user: credentialId, _delete:false })
               ])
               return res.status(200).send({ status: true, message: "success", data: { enquiries: enquiries, document: { total, limit, skip } }});
          }
          catch (err) {
               next(err);
          }
     }

     async getEnquiry(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, params } = req;
               const enquiry = await EnquiryModel.findOne({ _id: params.id, user: credentialId, _delete:false })
               return res.status(200).send({ status: true, message: "success", data: enquiry });
          }
          catch (err) {
               next(err);
          }
     }

     async deleteEnquiry(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, params } = req;
               await EnquiryModel.updateOne({ _id: params.id, user: credentialId }, { _delete: true });
               return res.status(200).send({status:true, message:"success"})
          }
          catch (err) {

          }
     }

     async findOne(req: Request, res: Response, next: NextFunction){
          try {
               const { credentialEmail, credentialId, credentialPassword } = req;
               const user = await UsersModel.findOne({ email: credentialEmail, _id: credentialId, password: credentialPassword })
                    .populate({
                         path: 'enquiries activities orders appointments',
                         perDocumentLimit: 20,
                    });
               return res.status(200).send(user);
          }
          catch (err) {
               throw err;
          }
     }
}