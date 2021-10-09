import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import { DecryptToken } from "../lib/login";
import crypto from 'crypto';
import { CommonMiddleware } from "../common/common.middleware";
import { AdminModel } from "./admin.model";

export class AdminMiddleware extends CommonMiddleware {
     async authenticate(req: Request, res: Response, next: NextFunction){
          try {
               let auth = req.headers['authorization'];
               if (auth?.split(' ')[1]) auth = (auth?.split(' '))[1];
               else return res.status(401).send('Invalid/expired authentication token');

               let adminCredentials: any = DecryptToken(auth, process.env.ADMIN_API_KEY||'');
               if (new Date() > new Date(adminCredentials['expiresTime'])) return res.status(401).send('Invalid/expired authentication token');
               const email = adminCredentials['email'];
               const password = adminCredentials['password'];
               const otp = adminCredentials['id'];
               if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) return res.status(401).send('Invalid/expired authentication token');
               const admin = await AdminModel.findOne({ email: email });
               if (!(admin && admin.otp.code === otp)) return res.status(401).send('Invalid/expired authentication token');
               next();
          }
          catch (err) {
               if (err instanceof JsonWebTokenError) return res.status(401).send('Invalid/expired authentication token');
               next(err);
          }
     }

     authorized(req: Request, res: Response, next: NextFunction): any {
          try {

               const timestamp = req.headers['timestamp'] as any;
               const api_key = req.headers['api_key'];

               const hash = crypto.createHash('sha512').update(process.env.ADMIN_API_KEY + "||" + timestamp).digest('hex');
               let date_diff = Date.now() - Number(timestamp);
               date_diff = Math.abs(date_diff);
               if (api_key !== hash || date_diff > 60000) {
                    return res.status(401).send({ message: "Invalid Authorization" });
               }

               next()
          }
          catch (err) {
               return res.status(401).send({ message: "Invalid Authorization" });
          }
     }
}