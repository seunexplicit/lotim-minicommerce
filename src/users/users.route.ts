import express, { NextFunction, Request, Response } from 'express';
import Schema from './users.schema';
import { CommonMiddleware } from '../common/common.middleware';
import { CommonRoute } from '../common/common.route';
import { UserMiddleware } from './users.middleware';
import { UserService } from './users.service';

export class UsersRoute extends CommonRoute {
     private schema: Schema;
     service: UserService = new UserService();
     constructor(
          public app: express.Application,
          middleware: CommonMiddleware = new UserMiddleware()
     ) {
          super(app, 'UsersRoute', middleware);
          this.schema = new Schema();
          this.fileOpts = { fileSize: Number(process.env.CLIENT_FILE_SIZE), filesCount: Number(process.env.CLIENT_FILE_COUNT || 0) };
          this.uploadFiles();
          this.uploadFilesAWS();
          this.getFilesAWS((req: Request, res: Response, next: NextFunction) => next());
          this.getFiles((req: Request, res: Response, next: NextFunction) => next());
     }

     configureRoutes() {
          this.schema = new Schema();
          this.service = new UserService();
          this.app.post('/enquiry',
               this.middleware.authorized,
               this.schema.enquiriesValidator,
               this.service.postEnquiry)
               .get('/enquiries',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getEnquiries)
               .get('/enquiry/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getEnquiry)
               .post('/booking',
                    this.middleware.authorized,
                    this.schema.bookingsValidator,
                    this.service.postAppointments)
               .get('/bookings',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getAppointments)
               .get('/booking/:id',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getAppointment)
               .post('/activities',
                    this.middleware.authorized,
                    this.schema.activitiesValidator,
                    async (req: express.Request, res: express.Response) => {
                    })
               .get('/orders',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getOrders)
               .post('/order',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.schema.orderValidator,
                    this.service.postOrders)
               .get('/order/:orderId',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    this.service.getOneOrders)
               .post('/create',
                    this.middleware.authorized,
                    this.schema.userValidator,
                    this.service.createNewUser
               )
               .post('/login',
                    this.middleware.authorized,
                    this.schema.loginValidator,
                    this.service.loginUser
                    )

          return this.app;
     }
}