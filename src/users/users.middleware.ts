import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import { CommonMiddleware } from "../common/common.middleware";
import { DecryptToken } from "../lib/login";
import crypto from 'crypto';
import { UsersModel } from "./users.model";

export class UserMiddleware extends CommonMiddleware {

     async authenticate(req: Request, res: Response, next: NextFunction): Promise<any> {
          try {
               let auth = req.headers['authorization'];
               if (auth?.split(' ')[1]) auth = (auth?.split(' '))[1];
               else return res.status(401).send('Invalid/expired authentication token');

               let userCredentials: any = DecryptToken(auth, process.env.CLIENT_API_KEY||'');
               if (new Date() > new Date(userCredentials['expiresTime'])) return res.status(401).send('Invalid/expired authentication token');
               req.credentialEmail = userCredentials['email'];
               req.credentialId = userCredentials['id'];
               req.credentialPassword = userCredentials['password'];
               const user = await UsersModel.findOne({ _id: req.credentialId }).select('+password');
               if (req.credentialEmail !== user?.email || req.credentialPassword !== user.password) return res.status(401).send('Invalid/expired authentication token');
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

               const hash = crypto.createHash('sha512').update(process.env.CLIENT_API_KEY + "||" + timestamp).digest('hex');
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