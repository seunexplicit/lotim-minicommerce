import express from 'express';
import Schema from './admin.schema';
import { CommonMiddleware } from '../common/common.middleware';
import { CommonRoute } from '../common/common.route';
import { AdminMiddleware } from './admin.middleware';
import { AdminService } from './admin.service';
import { ProductService } from '../products/product.service';
import { UserService } from '../users/users.service';
import ProductValidator from '../products/products.schema';

export class AdminRoute extends CommonRoute {
     private schema: Schema;
     private service: AdminService;
     private product: ProductService;
     private user: UserService = new UserService();

     constructor(
          public app: express.Application,
          middleware: CommonMiddleware = new AdminMiddleware() 
     ) {
          super(app, "AdminRoute", middleware);
          this.fileOpts = { fileSize: Number(process.env.ADMIN_FILE_SIZE), filesCount: Number(process.env.ADMIN_FILE_COUNT || 0) };
          this.uploadFiles();
          //this.uploadFilesAWS();
          this.getFiles();
          //this.getFilesAWS();
          this.uploadFilesCloudinary();
          this.getFilesCloudinary();
          this.schema = new Schema();
          this.service = new AdminService();
          this.product = new ProductService();
     }

     configureRoutes() {
          this.service = new AdminService();
          this.product = new ProductService();
          this.user = new UserService();
          this.schema = new Schema();
          const productSchema = new ProductValidator();
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
               .get('/product',
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
               .get('/order/:orderId',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getOneOrder)
               .get('/order',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getOrders)
               .delete('/order/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    () => { })
               .patch('/order/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getOneOrder)
               .get('/payments',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getPayments)
               .get('/payment/:paymentId',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getOnePayment)
               .get('/user/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getOneUser)
               .get('/user',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getUsers)
               .get('/booking/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getAppointment)
               .get('/bookings',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getAppointments)
               .delete('/booking/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.deleteAppointment)
               .patch('/booking/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: express.Request, res: express.Response) => {
                    })
               .get('/enquiry/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getEnquiry)
               .get('/enquiries',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getEnquiries)
               .delete('/enquiry/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.deleteEnquiry)
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
               .delete('/activities/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async () => { })
               .post('/category',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    productSchema.Categoryvalidator,
                    this.product.setCategory
          )
               .get('/category',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.product.getCategories
          )
               .delete('/category/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.product.deleteCategory
          )
               .post('/animal',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    productSchema.Animalvalidator,
                    this.product.setAnimal
               )
               .get('/animal',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.product.getAnimals
               )
               .delete('/animal/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.product.deleteAnimal
               )
                //this.uploadFiles(this.app) 
          //this.getFiles(this.app);
          return this.app;
     }
}