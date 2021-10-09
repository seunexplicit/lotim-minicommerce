import { UsersModel, Users, AppointmentModel, OrdersModel, IUsers, ICreateUser, UserLogin, EnquiryModel, } from './users.model';
import Hash from '../lib/hash_password';
import LoginEncryption from '../lib/login';
import { NextFunction, Request, Response } from 'express';
import { MailService } from '../common/common.service';

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
               const user = await UsersModel.findOne({ email: body.email })
                    .select('password email');

               if (user?.password) return res.status(409).send({ status: false, message: "User already exist" });
               const hashPassword = Hash(body.password || '');
               let newUser: IUsers;
               if (user) newUser = await user.update({ $set: { ...body, password: hashPassword } })
               else {
                    const _newUser = new UsersModel({ ...body, password: hashPassword });
                    newUser = await _newUser.save();
               };

               const credentials = LoginEncryption(
                    hashPassword,
                    newUser?.email || '',
                    newUser?._id,
                    Number(process.env.CLIENT_CREDENTIAL_EXPIRATION),
                    process.env.CLIENT_API_KEY || ''
               );
               newUser.password = undefined;
               return res.status(200).send({ status: true, message:"Account created successfully", data:{ credentials, user: newUser  } })

          }
          catch (err) {
               next(err);
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


     async getOrders(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, query } = req;
               const skip:number = query.skip ? Number(query.skip) : 0;
               const limit:number = query.limit ? Number(query.limit) : 20;
               const [order, documentCounts] = await Promise.all([
                    OrdersModel.find({ user: credentialId })
                         .skip(skip)
                         .limit(limit),
                    OrdersModel.countDocuments({ user: credentialId })
               ])
               return res.status(200).send({ order, document: { documentCounts, limit, skip } });
          }
          catch (err) {
               next(err);
          }
     }

     async getOneOrders(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId,  params } = req;
               const order =  OrdersModel.findOne({_id:params.id, user: credentialId })
               return res.status(200).send(order);
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
                    AppointmentModel.find({ user: credentialId })
                         .skip(skip)
                         .limit(limit),
                    AppointmentModel.countDocuments({ user: credentialId })
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
               const appointment = AppointmentModel.findOne({ _id: params.id, user: credentialId })
               return res.status(200).send({ status: true, message: "success", data: appointment });
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
               const enquiry = await new EnquiryModel({
                    enquiry: body.enquiry,
                    user: user?._id,
               });
               await enquiry.save();
               res.status(200).send({ status: true, message: "Enqury submitted successfully", data: enquiry })
          }
          catch (err) {
               console.log(err);
               next(err)
          }
     }

     async getEnquiries(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialEmail, credentialId, credentialPassword, query } = req;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const [enquiries, total] = await Promise.all([
                    EnquiryModel.find({ user: credentialId })
                         .skip(skip)
                         .limit(limit),
                    EnquiryModel.countDocuments({ user: credentialId })
               ])
               return res.status(200).send({ status: true, message: "success", data: { enquiries: enquiries, document: { total, limit, skip } }});
          }
          catch (err) {
               next(err);
          }
     }

     async getEnqury(req: Request, res: Response, next: NextFunction) {
          try {
               const { credentialId, params } = req;
               const appointment = AppointmentModel.findOne({ _id: params.id, user: credentialId })
               return res.status(200).send(appointment);
          }
          catch (err) {
               next(err);
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