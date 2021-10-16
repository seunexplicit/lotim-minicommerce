import './config'
import express from 'express';
import * as http from 'http';
import cors from 'cors';
import debug from 'debug';
import mongoose from 'mongoose';
import { UsersRoute } from './users/users.route';
import { ProductsRoute } from './products/products.route';
import { AdminRoute } from './admin/admin.route';
import { logger } from './config';
import { CommonRoute } from './common/common.route';

const clientApp: express.Application = express();
const clientProduct: express.Application = express();
const clientUser: express.Application = express();
const adminApp: express.Application = express();
const mainAdminApp: express.Application = express();

console.log(process.env.MONGOOSE_URL);
const dbConnection = mongoose.connect(process.env.MONGOOSE_URL || '', { useFindAndModify: false, useNewUrlParser: true });
dbConnection.then(
     (success) => { console.log(`connected to database successfully ${success}`) },
     (error) => { console.log(`error connecting to the database ${error}`) }
)
const clientServer: http.Server = http.createServer(clientApp);
const adminServer: http.Server = http.createServer(adminApp);

const routes: Array<CommonRoute> = [];
const debugLog: debug.IDebugger = debug('app');
clientApp.use(express.json());
adminApp.use(express.json());
const corsOption:any = {
     origin: process.env.WHITELIST_ORIGIN
}
clientApp.use(cors(corsOption));
adminApp.use(cors(corsOption));
//app.use(logger.log);
clientApp.use('/user', clientUser);
clientApp.use('/product', clientProduct);
adminApp.use('/admin', mainAdminApp);
const adminRoute: CommonRoute = new AdminRoute(mainAdminApp);
routes.push(new UsersRoute(clientUser));
routes.push(new ProductsRoute(clientProduct));

const port = process.env.CLIENT_PORT;
const adminPort = process.env.ADMIN_PORT;

clientServer.listen(process.env.PORT||port, () => {
     console.log("server listening to ->", port);
     routes.forEach((route) => {
          debugLog(`route configure for ${route.getName()}`)
     })
});

adminServer.listen(adminPort, () => {
     console.log('admin server listening to port ->', process.env.PORT ||adminPort);
     debugLog(`route configure for ${adminRoute.getName()}`)
})



