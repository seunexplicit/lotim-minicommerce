import express from 'express';
import Schema from './products.schema';

import { CommonRoute } from '../common/common.route';
import { CommonMiddleware } from '../common/common.middleware';
import { ProductMiddleware } from './products.middleware';
import { ProductService } from './product.service';
import { UserMiddleware } from '../users/users.middleware';

export class ProductsRoute extends CommonRoute {
     private schema: Schema;
     private product: ProductService;

     constructor(
          public app: express.Application,
          middleware: CommonMiddleware = new UserMiddleware()
     ) {
          super(app, 'Products Route', middleware)
          this.schema = new Schema();
          this.product = new ProductService();
     }

     configureRoutes() {
          this.schema = new Schema();
          this.product = new ProductService();

          this.app.get('/products',
               this.middleware.authorized,
               this.product.getProducts)
               .get('/product/:id',
                    this.middleware.authorized,
                    this.product.getOneProduct)

          return this.app;
     }
}