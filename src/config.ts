import { config as config_dotenv } from 'dotenv';
import path, { resolve } from 'path';
import * as winston from 'winston';
/*import { environment } from './environment';


environment.production ? process.env.NODE_ENV = 'production' : process.env.NODE_ENV = 'development';*/
console.log(process.env.NODE_ENV, path.resolve(__dirname, "../.env.development"));
switch (process.env.NODE_ENV) {
     case 'production':
          config_dotenv({
               path: resolve(__dirname, '../.env.production')
          })
          break
     case 'development':
          config_dotenv({
               path: resolve(__dirname, '../.env.development')
          })
          break
     default:
          throw new Error(`'NODE_ENV' ${process.env.NODE_ENV} is not handled`);
}

const loggerRoot = resolve(__dirname, './logger');

// instantiate a new Winston Logger with the settings defined above
export const logger = winston.createLogger({
     format: winston.format.json(),
     defaultMeta: { service: 'user-service' },
     transports: [
          new winston.transports.File({
               filename: `${loggerRoot}/error.log`,
               level: 'error',
               format: winston.format.json()
          }),
          new winston.transports.Http({
               level: 'warn',
               format: winston.format.json()
          }),
          new winston.transports.Console({
               level: 'info',
               format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
               )
          })
     ],
     exitOnError: false, // do not exit on handled exceptions
});



