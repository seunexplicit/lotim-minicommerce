import Hash from '../lib/hash_password';
import { NextFunction, Request, Response } from "express";
import { IProducts, ProductsModel } from "../products/products.model";
import { RandomValue } from '../lib/utility.lib';
import { MailService } from '../common/common.service';
import { AdminModel } from './admin.model';
import Login from '../lib/login';

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
                    res.status(200).send({
                         status: 200,
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

     /*async getProducts(req: Request, res: Response, next: NextFunction) {
          try {
               const { params, query } = req;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const searchKey: string = query.search?query.search+'':'';
               let category: any = query.category?query.category+'':'';
               let animal: any = query.animal?query.animal+'':'';
               let brand: any = query.brand?query.brand + '':'';
               category = (category.split(",") as Array<string>).map(each => new RegExp(each));
               animal = (animal.split(",") as Array<string>).map(each => new RegExp(each));
               brand = (brand.split(",") as Array<string>).map(each => new RegExp(each));
               const minPrice: number = query.minPrice ? Number(query.minPrice) : 0;
               const maxPrice: number = query.maxPrice ? Number(query.maxPrice) : 1000000000;
               let searchArray = ((searchKey.split(" ")).filter(each => each.length > 2)).map(each => new RegExp(each));
               const [products, counts] = await Promise.all([
                    ProductsModel.find({
                         $and: [
                              { category: { $in: [...category] } },
                              { animal: { $in: [...animal] } },
                              { brand: { $in: [...brand] } },
                              {
                                   varieties: {
                                        $all: [
                                             { $elemMatch: { price: { $gte: minPrice } } },
                                             { $elemMatch: { price: { $lte: maxPrice } } }
                                        ]
                                   }
                              },
                              {
                                   $or: [
                                        { name: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { category: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { animal: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { description: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { brand: { $in: [new RegExp(searchKey), ...searchArray] }}
                                   ]
                              }
                         ]
                    })
                         .skip(skip)
                         .limit(limit),
                    ProductsModel.countDocuments({
                         $and: [
                              { category: { $in: [...category] } },
                              { animal: { $in: [...animal] } },
                              { brand: { $in: [...brand] } },
                              {
                                   varieties: {
                                        $all: [
                                             { $elemMatch: { price: { $gte: minPrice } } },
                                             { $elemMatch: { price: { $lte: maxPrice } } }
                                        ]
                                   }
                              },
                              {
                                   $or: [
                                        { name: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { category: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { animal: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { description: { $in: [new RegExp(searchKey), ...searchArray] } },
                                        { brand: { $in: [new RegExp(searchKey), ...searchArray] } }
                                   ]
                              }
                         ]
                    })
               ]);

               return res.status(200).send(
                    { status: true, data: { products, document: { limit, skip, documentCount: counts } } }
               )
          }
          catch (err) {
               next(err);
          }
     }

     async getOneProduct(req: Request, res: Response, next: NextFunction) {
          try {
               const { params, query } = req;
               const product = await ProductsModel.findById(params.id)
               return res.status(200).send(
                    { status: true, data: product }
               )
          }
          catch (err) {
               next(err)
          }
     }*/
}