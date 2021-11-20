import Hash from '../lib/hash_password';
import { NextFunction, Request, Response } from "express";
import { IProducts, ProductsModel } from "../products/products.model";
import { RandomValue } from '../lib/utility.lib';
import { MailService } from '../common/common.service';
import { AdminModel } from './admin.model';
import Login from '../lib/login';
import { AppointmentModel, EnquiryModel, OrdersModel, PaymentModel, UsersModel } from '../users/users.model';
import { Mongoose, SchemaType, SchemaTypes, Types } from 'mongoose';

export class AdminService {

     mailService: MailService = new MailService();

     constructor() {

     }

     async loginAdmin(req: Request, res: Response, next: NextFunction) {
          try {
               const { body } = req;
               if (body.email === process.env.ADMIN_EMAIL && Hash(body.password) === process.env.ADMIN_PASSWORD) {
                    const randomValue = RandomValue('number', 6);
                    let admin = await AdminModel.findOne({ email: body.email });
                    if (!admin?._id) {
                         const newAdmin = new AdminModel({ email: body.email });
                         admin = await newAdmin.save();
                    }
                    admin.otp = { createdAt: new Date(), code: Hash(randomValue) }
                    await admin.save();
                    const mail: MailService = new MailService();
                    mail.sendMessage(body.email, `Complete your login using ${randomValue}. Expires in 10 minutes`, "Login Token");
                    res.status(200).send({ status: true, message: "An email has been sent to admin. It expires in 10 minutes" });
               }
               else res.status(401).send({ status: false, message: "Invalid/wrong authentication details" });
          }
          catch (err) {
               console.log(err);
               next(err);
          }
     }

     async verifyOTP(req: Request, res: Response, next: NextFunction) {
          try {
               const { body } = req;
               if (!(body.email === process.env.ADMIN_EMAIL && Hash(body.password) === process.env.ADMIN_PASSWORD)) return res.status(401).send({ status: false, message: "Invalid/wrong authentication details" });
               let admin = await AdminModel.findOne({ email: body.email });
               if (!(admin?.otp)) return res.status(401).send({ status: false, message: "Invalid/wrong authentication details" });
               if (admin.otp?.code === Hash(body.otp) && new Date(admin.otp.createdAt) >= new Date(new Date().setMinutes(new Date().getMinutes() - 10))) {
                    const adminCredentials = Login(
                         Hash(body.password),
                         body.email,
                         Hash(body.otp),
                         Number(process.env.ADMIN_CREDENTIAL_EXPIRATION),
                         process.env.ADMIN_API_KEY||''
                    );

                    res
                    .cookie('credentials', adminCredentials.token, { maxAge: (adminCredentials.expiresTime).getTime() })
                    .status(200).send({
                         status: true,
                         message: "Verification successful",
                         data: adminCredentials
                    });
               }
               
               else res.status(401).send({ status: false, message: "Invalid/wrong authentication details" });
          }
          catch (err) {
               console.log(err);
               next(err)
          }
     }

     async createNewProducts(req: Request, res: Response, next: NextFunction) {
          try {
               const body: IProducts = req.body;
               const product = new ProductsModel(body);
               const saveProduct = await product.save();
               return res.status(200).send({ status: true, data: saveProduct });
          }
          catch (err) {
               next(err);
          }
     }

     async getOneOrder(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               const order = await OrdersModel
                    .findOne({ _id: params.orderId })
                    .populate([
                         { path: 'orders.products' },
                         { path: 'user' }
                    ])
               return res.status(200).send({ status: true, message: "success", data: order });
          }
          catch (err) {
               next(err);
          }
     }

     async getOrders(req: Request, res: Response, next: NextFunction) {
          try {
               const { query } = req;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const [orders, total] = await Promise.all([
                    OrdersModel.find()
                         .skip(skip)
                         .limit(limit),
                    OrdersModel.countDocuments()
               ])

               return res.status(200).send({ status: true, message: "success", data: { orders: orders, document: { total, limit, skip } }});
          }
          catch (err) {
               next(err);
          }
     }

     async getPayments(req: Request, res: Response, next: NextFunction) {
          try {
               const { query } = req;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const [payments, total] = await Promise.all([
                    PaymentModel.find()
                         .skip(skip)
                         .limit(limit),
                    PaymentModel.countDocuments()
               ])

               return res.status(200).send({ status: true, message: "success", data: { payments: payments, document: { total, limit, skip } } });
          }
          catch (err) {
               next(err);
          }
     }

     async getOnePayment(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               const payment = await PaymentModel.findOne({_id:params.paymentId})
               return res.status(200).send({ status: true, message: "success", data: payment });
          }
          catch (err) {
               next(err);
          }
     }

     async getAppointment(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               const appointment = await AppointmentModel.findOne({ _id: params.id })
                    .populate('user').select('+_delete')
               return res.status(200).send({ status: true, message: "success", data: appointment });
          }
          catch (err) {
               next(err);
          }
     }

     async deleteAppointment(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               const appointment = await AppointmentModel.findOne({ _id: params.id }).select('_delete');
               if (!appointment?._delete) return res.status(409).send({ status: false, message: "Enquiry cannot be deleted" });
               
               await AppointmentModel.deleteOne({ _id: params.id });
               res.status(200).send({ status: true, message: "Enquiry deleted" });
          }
          catch (err) {
               next(err);
          }
     }

     async getAppointments(req: Request, res: Response, next: NextFunction) {
          try {
               const { query } = req;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const queryData = (query.user + "").length == 24 ? (query.user as string) : undefined;
               const [appointment, total] = await Promise.all(queryData ?
                    [
                         AppointmentModel.find({ user: queryData })
                         .skip(skip)
                              .limit(limit)
                         .select('+_delete'),
                         AppointmentModel.countDocuments({ user: queryData })
                    ] : [
                         AppointmentModel.find()
                              .skip(skip)
                              .limit(limit),
                         AppointmentModel.countDocuments()
                    ])
               return res.status(200).send({ status: true, message: "success", data: { appointment: appointment, document: { total, limit, skip } } });
          }
          catch (err) {
               next(err);
          }
     }

     async getEnquiry(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               const enquiry = await EnquiryModel.findOne({ _id: params.id })
                                        .populate('user').select('+_delete')
               return res.status(200).send({ status: true, message: "success", data: enquiry });
          }
          catch (err) {
               next(err);
          }
     }

     async getEnquiries(req: Request, res: Response, next: NextFunction) {
          try {
               const { query } = req;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const queryData = (query.user + "").length == 24 ? (query.user as string) : undefined;
               const [enquiries, total] = await Promise.all(queryData?[
                    EnquiryModel.find({ user: queryData })
                         .skip(skip)
                         .limit(limit)
                         .select('+_delete'),
                    EnquiryModel.countDocuments({ user: queryData })
               ] : [
                         EnquiryModel.find()
                              .skip(skip)
                              .limit(limit),
                         EnquiryModel.countDocuments()
                    ])
               return res.status(200).send({ status: true, message: "success", data: { enquiries: enquiries, document: { total, limit, skip } } });
          }
          catch (err) {
               next(err);
          }
     }

     async deleteEnquiry(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               const enquiry = await EnquiryModel.findOne({ _id: params.id }).select('_delete');
               console.log(enquiry);
               if (!enquiry?._delete) return res.status(409).send({ status: false, message: "Enquiry cannot be deleted" });
               await EnquiryModel.deleteOne({ _id: params.id });
               res.status(200).send({ status: true, message: "Enquiry deleted" });
          }
          catch (err) {
               next(err);
          }
     }

     async getUsers(req: Request, res: Response, next: NextFunction) {
          try {
               const { query } = req;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const searchKey: string = query.search ? query.search + '' : '';
               let searchArray = ((searchKey.split(" ")).filter(each => each.length > 2)).map(each => new RegExp(each));
               const [users, total] = await Promise.all([
                    UsersModel.find({
                         $or: [
                              { firstName: { $in: [new RegExp(searchKey), ...searchArray] } },
                              { lastName: { $in: [new RegExp(searchKey), ...searchArray] } },
                              { email: { $in: [new RegExp(searchKey), ...searchArray] } },
                              { phoneNumber: { $in: [new RegExp(searchKey), ...searchArray] } }
                         ]
                    })
                         .skip(skip)
                         .limit(limit),
                    UsersModel.countDocuments(
                              {
                                   $or: [
                                        { firstName: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { lastName: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { email: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { phoneNumber: { $in: [new RegExp(searchKey), ...searchArray] } }
                                   ]
                              })])

               return res.status(200).send(
                    { status: true, message:"success", data: { users:users, document: { limit, skip, total } } }
               )
          }
          catch (err) {
               next(err);
          }
     }

     async getOneUser(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               const product = await UsersModel.findById(params.id)
                    .populate([
                         { path: 'enquiries', options: {limit:20}},
                         { path: 'activities', options: { limit: 20 } },
                         { path: 'orders', options: { limit: 20 } },
                         { path: 'appointments', options: { limit: 20 } }
                    ])
               return res.status(200).send(
                    { status: true, message:"success", data: product }
               )
          }
          catch (err) {
               next(err)
          }
     }



   
}