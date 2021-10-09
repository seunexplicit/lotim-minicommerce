declare global {
     namespace NodeJS {
          interface ProcessEnv {
               NODE_ENV: 'development' | 'production';
          }
     }

     namespace Express {
          interface Request {
               credentialEmail: string,
               credentialPassword: string,
               credentialId:string,
          }
     }
}

/*export const environment = {
     production: false
}*/
export {}