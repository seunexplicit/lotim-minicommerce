import express from 'express';
import Schema from './admin.schema';
import { CommonMiddleware } from '../common/common.middleware';
import { CommonRoute } from '../common/common.route';
import { AdminMiddleware } from './admin.middleware';
import { AdminService } from './admin.service';
import { ProductService } from '../products/product.service';

export class AdminRoute extends CommonRoute {
     private schema: Schema;
     private service: AdminService;
     private product: ProductService

     constructor(
          public app: express.Application,
          middleware: CommonMiddleware = new AdminMiddleware() 
          
     ) {
          super(app, "AdminRoute", middleware);
          this.fileOpts = { fileSize: Number(process.env.ADMIN_FILE_SIZE), filesCount: Number(process.env.ADMIN_FILE_COUNT || 0) };
          this.uploadFiles();
          this.getFiles();
          this.schema = new Schema();
          this.service = new AdminService();
          this.product = new ProductService();
     }

     configureRoutes() {
          this.service = new AdminService();
          this.product = new ProductService()
          this.schema = new Schema();
          this.app.post('/login',
               this.middleware.authorized,
               this.schema.loginValidator,
               this.service.loginAdmin)
               .post('/verifyotp',
                    this.middleware.authorized,
                    this.service.verifyOTP
               )
               .get('/product/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.product.getOneProduct
               )
               .get('/products',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.product.getProducts
               )
               .delete('/product/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .patch('/product',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .post('/product',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.schema.productValidator,
                    this.service.createNewProducts
               )
               .get('/order/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .get('/orders',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .delete('/order/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .patch('/order/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .get('/booking/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .get('/bookings',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .delete('/booking/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .patch('/booking/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .get('/enquiry/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .get('/enquiries',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .delete('/enquiry/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .patch('/enquiry/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .get('/activities',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .delete('/enquiry',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
                //this.uploadFiles(this.app) 
          //this.getFiles(this.app);
          return this.app;
     }
}