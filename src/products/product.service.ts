import { NextFunction, Request, Response } from "express";
import { CategoryModel, ProductsModel, Category, Animal, AnimalModel } from "./products.model";

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

     async setCategory(req: Request, res: Response, next: NextFunction) {
          try {
               const { body } = req;
               const categories:Category[] = (body.categories as Array<string>).map((value) => {
                    return { value };
               });
               const categoryDoc = await CategoryModel.insertMany(categories);
               res.status(200).send({ message: "success", status: true, data: categoryDoc });
          }
          catch (err) {
               next(err);
          }
     }

     async getCategories(req: Request, res: Response, next: NextFunction) {
          try {
               const categories = await CategoryModel.find();
               res.status(200).send({ message: "success", status: true, data: categories });
          }
          catch (err) {
               next(err);
          }
     }

     async deleteCategory(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               await CategoryModel.deleteOne({ _id: params.id });
               res.status(200).send({ message: "success", status: true });

          }
          catch (err) {
               next(err);
          }
     }

     async setAnimal(req: Request, res: Response, next: NextFunction) {
          try {
               const { body } = req;
               const animals: Animal[] = (body.animals as Array<string>).map((value) => {
                    return { value };
               });
               const animalDoc = await AnimalModel.insertMany(animals);
               res.status(200).send({ message: "success", status: true, data: animalDoc });
          }
          catch (err) {
               next(err);
          }
     }

     async getAnimals(req: Request, res: Response, next: NextFunction) {
          try {
               const animals = await AnimalModel.find();
               res.status(200).send({ message: "success", status: true, data: animals });
          }
          catch (err) {
               next(err);
          }
     }

     async deleteAnimal(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               await AnimalModel.deleteOne({ _id: params.id });
               res.status(200).send({ message: "success", status: true });

          }
          catch (err) {
               next(err);
          }
     }
}