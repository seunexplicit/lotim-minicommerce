import { NextFunction, Request, Response } from "express";
import { CommonMiddleware } from "../common/common.middleware";
import crypto from 'crypto';

export class ProductMiddleware extends CommonMiddleware {

     authenticate() { }
     authorized(req: Request, res: Response, next: NextFunction): any {
          try {
               const timestamp = req.headers['timestamp'] as any;
               const api_key = req.headers['api_key'];
               const my_api_key = (process.env.CLIENT_API_KEY as any);

               const hash = crypto.createHash('sha512', my_api_key).update(timestamp).digest('hex');
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