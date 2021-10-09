import { NextFunction, Request, Response } from "express";
import { ProductsModel } from "./products.model";

export class ProductService {

     async getProducts(req: Request, res: Response, next: NextFunction) {
          try {
               const { params, query } = req;
               const limit: number = query.limit ? Number(query.limit) : 20;
               const skip: number = query.skip ? Number(query.skip) : 0;
               const searchKey: string = query.search ? query.search + '' : '';
               let category: any = query.category ? query.category + '' : '';
               let animal: any = query.animal ? query.animal + '' : '';
               let brand: any = query.brand ? query.brand + '' : '';
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
                                        { brand: { $in: [new RegExp(searchKey), ...searchArray] } }
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
     }
}