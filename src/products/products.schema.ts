import joi from 'joi';
import { emailValidator, phoneNumber } from '../common/common.validator';
import express from 'express';

export default class ProductValidator {
     productValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
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
                         'boolean.required': `hasPaid is required`
                    }),
               paymentReference: joi.string()
                    .when('hasPaid', { is: true, then: joi.string().required() })
                    .min(10)
                    .messages({
                         'string.min': `payment reference is invalid`,
                         'string.empty': `payment reference cannot be empty`
                    }),
               amount: joi.number()
                    .positive()
                    .when('hasPaid', { is: true, then: joi.number().required() })
                    .messages({
                         'number.positive': `invalid amount`,
                         'number.required': `amount is required`
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
                         'string.required': `phone number is required`,
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
               return res.status(400).send({ message: validationResult.error })
          }
          next();
     }

     getProductValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
          const schema = joi.object({
               _id: joi.string()
                    .min(10)
                    .required()
                    .messages({
                         'string.base': `_id must be a string`,
                         'string.min': `invalid _id`,
                         'string.required': '_id is required',
                         'string.empty': '_id cannot be empty',
                    }),
          })

          const validationResult = schema.validate(req.body);
          if (validationResult.error) {
               return res.status(400).send({ message: validationResult.error })
          }
          next();
     }

}