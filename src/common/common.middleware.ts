import { NextFunction, Request, Response } from 'express';
import rate_limit from 'express-rate-limit';
import crypto from 'crypto';


export abstract class CommonMiddleware {
     abstract authenticate(req: Request, res: Response, next: NextFunction): any
     abstract authorized(req: Request, res: Response, next: NextFunction):any
}

/*export abstract class AuthenticationMiddleware {

     constructor(
     ) {
     }

     userAuthentication(req: Request, res: Response, next: NextFunction) {
          try {
               const timestamp = req.headers['timestamp'] as any;
               const api_key = req.headers['api_key'];
               const my_api_key = (process.env.API_KEY as any);

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

     userAuthorization(req: Request, res: Response, next: NextFunction) {
          try {

          }
          catch (err) {

          }
     }

     adminAuthentication(req: Request, res: Response, next: NextFunction) {
          try {
               const timestamp = req.headers['timestamp'] as any;
               const api_key = req.headers['api_key'];
               const my_api_key = (process.env.ADMIN_API_KEY as any);

               const hash = crypto.createHash('sha512', my_api_key).update(timestamp).digest('hex');
               let date_diff = Date.now() - Number(timestamp);
               date_diff = Math.abs(date_diff);
               if (api_key !== hash || date_diff > 40000) {
                    return res.status(401).send({ message: "Invalid Authentication" });
               }

               next()
          }
          catch (err) {
               return res.status(401).send({ message: "Invalid Authentication" });
          }

     }
}
*/

export class RateLimiterMiddleware {

     config: rate_limit.Options = {}

     constructor(
     ) {
          this.config = {
               keyGenerator: this.keyGenerator,
               store: {
                    decrement: function () { },
                    incr: function (key, cb) {

                    },
                    resetKey: function () { },
                    resetAll: function () { }
               }
          }
     }

     keyGenerator(http_request: Request, http_response?: Response,) {
          return http_request.headers['user-agent'] as string
     }

     process(windowMs: number, max: number, message="You have exceed the number of times you can carryout this action") {
          return rate_limit({
               ...this.config,
               windowMs: windowMs,
               max: max,
               message: message
          })
     }

    
}



