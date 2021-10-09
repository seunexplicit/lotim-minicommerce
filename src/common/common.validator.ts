import validator from 'validator';

export const emailValidator = (value: string, helpers: any) => {
     if (validator.isEmail(value)) {
          return value;
     }
     else if (helpers) {
          return helpers.error('string.invalid')
     }
     else {
          return false;
     }
}

export const phoneNumber = (value: string, helpers: any) => {
     if (validator.isMobilePhone(value, 'en-NG')) {
          return value;
     }
     else if (helpers) {
          return helpers.error('string.invalid')
     }
     else {
          return false;
     }
}


