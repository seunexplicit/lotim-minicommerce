import joi from 'joi';
import { emailValidator, phoneNumber } from '../common/common.validator';
import express from 'express';

export default class UserValidator {
     enquiriesValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
          const schema = joi.object({
               name: joi.string()
                    .min(3)
                    .max(30)
                    .required()
                    .messages({
                         'string.base':`name must be a string`,
                         'string.min': `minimum name value allowed is {#limt}`,
                         'string.max': `maximum name value allowed is {#limit}`,
                         'string.required': `name is required`,
                         'string.empty':`name cannot be empty`
                    }),
               email: joi.string()
                    .custom(emailValidator, 'email validator')
                    .when('phoneNumber', { not: joi.exist(), then: joi.required() })
                    .required()
                    .messages({
                         'string.base': `email must be a string`,
                         'string.empty': `email cannot be empty`,
                         'string.invalid': `not a valid email`,
                         'string.required':"email is required"
                    }),
               phoneNumber: joi.string()
                    .pattern(/^\+?\d{11,13}$/)
                    .custom(phoneNumber, 'mobile number validator')
                    .messages({
                         'string.base': `phone number must be a number`,
                         'string.pattern':`not a valid phone number`,
                         'string.empty': `phone number cannot be empty`,
                         'string.invalid':`not a valid phone number`,
                    }),
               enquiry: joi.string()
                    .min(5)
                    .required()
                    .messages({
                         'string.min': `enquiry min length is {#limit}`,
                         'string.empty': `enquiry cannot be empty`,
                         'string.required':`enquiry is required`
                    })
          })

          const validationResult = schema.validate(req.body);
          if (validationResult.error) {
               return res.status(400).send({ message: validationResult.error.details[0].message })
          }
          next();

     };

     bookingsValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
          const schema = joi.object({
               name: joi.string()
                    .min(3)
                    .max(30)
                    .required()
                    .messages({
                         'string.min': `minimum name value allowed {#limit}`,
                         'string.max': `maximum name value allowed {#limit}`,
                         'string.empty': `name cannot be empty`,
                         'string.required': `name is required`
                    }),
               email: joi.string()
                    .custom(emailValidator, 'email validator')
                    .required()
                    .messages({
                         'string.base': `email must be a string`,
                         'string.empty': `email cannot be empty`,
                         'string.invalid': `not a valid email`,
                         'string.required':'email is required'
                    }),
               phoneNumber: joi.string()
                    .pattern(/^\+?[0-9]+$/)
                    .custom(phoneNumber, 'mobile number validator')
                    .messages({
                         'string.base': `phone number must be a string`,
                         'string.pattern': `not a valid phone number`,
                         'string.empty': `phone number cannot be empty`,
                         'string.invalid': `not a valid phone number`,
                    }),
               reason: joi.string()
                    .min(5)
                    .required()
                    .messages({
                         'string.base': `reason must be a string`,
                         'string.empty': `reason cannot be empty`,
                         'string.min': `reason too short`,
                         'string.required': 'reason is required'
                    }),
               description: joi.string()
                    .allow('')
                    .messages({
                         'string.base': 'description must be a string'
                    }),
               bookingsDate: joi.date()
                    .greater(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0, 0, 0))
                    .required()
                    .messages({
                         'date.base': `date should be of type Date`,
                         'date.greater': `selected date not allowed`,
                         'date.required': `date is required`,
                    })
          });

          const validationResult = schema.validate(req.body);
          if (validationResult.error) {
               return res.status(400).send({status:false, message: validationResult.error.details[0].message })
          }
          next();
     };

     orderValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
          const schema = joi.object({
               products: joi.array().items(
                    joi.object({
                         _id: joi.string()
                              .min(10)
                              .required()
                              .messages({
                                   'string.base': `_id must be a string`,
                                   'string.min': `invalid _id`,
                                   'string.required': '_id is required',
                                   'string.empty': '_id cannot be empty',
                              }),
                         quantity: joi.number()
                              .min(1)
                              .required()
                              .messages({
                                   'number.min': `quantity cannot be less than 1`,
                                   'number.required': `quantity is required`,
                              }),
                         variation: joi.string()
                              .min(10)
                              .messages({
                                   'string.base': `variation must be a string`,
                                   'string.min': `invalid  variation`,
                                   'string.empty': 'variation cannot be empty',
                              })
                    })
               ),
               hasPaid: joi.boolean()
                    .required()
                    .messages({
                         'boolean.required':`hasPaid is required`
                    }),
               paymentReference: joi.string()
                    .when('hasPaid', { is: true, then: joi.string().required() })
                    .min(10)
                    .messages({
                         'string.min': `payment reference is invalid`,
                         'string.empty':`payment reference cannot be empty`
                    }),
               amount: joi.number()
                    .positive()
                    .when('hasPaid', { is: true, then: joi.number().required() })
                    .messages({
                         'number.positive': `invalid amount`,
                         'number.required':`amount is required`
                    })
               ,
               name: joi.string()
                    .min(3)
                    .max(30)
                    .required()
                    .messages({
                         'string.min': `minimum name value allowed {#limit}`,
                         'string.max': `maximum name value allowed {#limit}`,
                         'string.empty': `name cannot be empty`,
                         'string.required': `name is required`
                    }),
               phoneNumber: joi.string()
                    .pattern(/^\+?[0-9]+$/)
                    .custom(phoneNumber, 'mobile number validator')
                    .required()
                    .messages({
                         'string.base': `phone number must be a number`,
                         'string.pattern': `not a valid phone number`,
                         'string.empty': `phone number cannot be empty`,
                         'string.required':`phone number is required`,
                         'string.invalid': `not a valid phone number`,
                    }),
               email: joi.string()
                    .custom(emailValidator, 'email validator')
                    .messages({
                         'string.base': `email must be a string`,
                         'string.empty': `email cannot be empty`,
                         'string.invalid': `not a valid email`,
                    }),
               delivery: joi.boolean()
                    .required()
                    .messages({
                         'boolean.required': `hasPaid is required`
                    }),
               deliveryAddress: joi.string()
                    .when('delivery', { is: true, then: joi.string().required() })
                    .min(5)
                    .messages({
                         'string.min': `payment reference is invalid`,
                         'string.empty': `payment reference cannot be empty`
                    }),
              
          })

          const validationResult = schema.validate(req.body);
          if (validationResult.error) {
               return res.status(400).send({status:false, message: validationResult.error.details[0].message })
          }
          next();
     }

     userValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
          const schema = joi.object({
               firstName: joi.string()
                    .min(3)
                    .max(30)
                    .required()
                    .messages({
                         'string.base': `firstname must be a string`,
                         'string.min': `minimum firstname value allowed is {#limt}`,
                         'string.max': `maximum firstname value allowed is {#limit}`,
                         'string.required': `firstname is required`,
                         'string.empty': `firstname cannot be empty`
                    }),
               lastName: joi.string()
                    .min(3)
                    .max(30)
                    .required()
                    .messages({
                         'string.base': `lastname must be a string`,
                         'string.min': `minimum lastname value allowed is {#limt}`,
                         'string.max': `maximum lastname value allowed is {#limit}`,
                         'string.required': `lastname is required`,
                         'string.empty': `lastname cannot be empty`
                    }),
               email: joi.string()
                    .custom(emailValidator, 'email validator')
                    .required()
                    .messages({
                         'string.base': `email must be a string`,
                         'string.empty': `email cannot be empty`,
                         'string.invalid': `not a valid email`
                    }),
               phoneNumber: joi.string()
                    .pattern(/^\+?\d{11,13}$/)
                    .custom(phoneNumber, 'mobile number validator')
                    .required()
                    .messages({
                         'string.base': `phone number must be a number`,
                         'string.pattern': `not a valid phone number`,
                         'string.empty': `phone number cannot be empty`,
                         'string.invalid': `not a valid phone number`,
                    }),
               password: joi.string()
                    .min(6)
                    .required()
                    .messages({
                         'string.min': `password min length is {#limit}`,
                         'string.empty': `password cannot be empty`,
                         'string.required': `password is required`
                    }),
               address: joi.string()
                    .min(5)
                    .required()
                    .messages({
                         'string.min': `address min length is {#limit}`,
                         'string.empty': `address cannot be empty`,
                         'string.required': `address is required`
                    })
          })

          const validationResult = schema.validate(req.body);
          if (validationResult.error) {
               return res.status(400).send({status:false, message: validationResult.error.details[0].message })
          }
          next();
     }

     loginValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
          const schema = joi.object({
               email: joi.string()
                    .email()
                    .required()
                    .messages({
                         'string.base': `email must be a string`,
                         'string.email': `not a valid email`,
                         'string.required': `email is required`,
                         'string.empty': `email cannot be empty`
                    }),
               password: joi.string()
                    .min(6)
                    .required()
                    .messages({
                         'string.base': `password must be a string`,
                         'string.empty': `password cannot be empty`,
                         'string.required': `password is required`,
                         'string.min': 'password must be 6 characters or more'
                    })
          })
          const validationResult = schema.validate(req.body);
          if (validationResult.error) {
               return res.status(400).send({status:false, message: validationResult.error?.details[0]?.message })
          }
          next();
     }

     activitiesValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
          const schema = joi.object({
               phoneNumber: joi.string()
                    .allow('')
                    .pattern(/^\+?[0-9]+$/)
                    .custom(phoneNumber, 'mobile number validator')
                    .messages({
                         'string.base': `phone number must be a string`,
                         'string.pattern': `not a valid phone number`,
                         'string.empty': `phone number cannot be empty`,
                         'string.invalid': `not a valid phone number`,
                    }),
               email: joi.string()
                    .custom(emailValidator, 'email validator')
                    .messages({
                         'string.base': `email must be a string`,
                         'string.empty': `email cannot be empty`,
                         'string.invalid': `not a valid email`
                    }),

               description: joi.string()
                    .required()
                    .messages({
                         'string.base': `description must be a string`,
                         'string.required': `description is required`,
                         'string.empty':'description cannot be empty',
                    }),
          })

          const validationResult = schema.validate(req.body);
          if (validationResult.error) {
               return res.status(400).send({status:false, message: validationResult.error })
          }
          next();
     }
}