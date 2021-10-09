import joi from 'joi';
import { emailValidator, phoneNumber } from '../common/common.validator';
import express from 'express';

export default class UserValidator {
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
                    }),
               token: joi.string()
                    .pattern(/^[0-9]{6}$/)
                    .messages({
                         'string.base': `invalid token`,
                         'string.pattern': `invalid token`,
                         'string.empty': `token cannot be empty`,
                    }),
          })

          const validationResult = schema.validate(req.body);
          if (validationResult.error) {
               return res.status(400).send({ message: validationResult.error?.details[0]?.message })
          }
          next();
     }
     productValidator(req: express.Request, res: express.Response, next: express.NextFunction) {
          const schema = joi.object({
               name: joi.string()
                    .required()
                    .messages({
                         'string.base': `name must be a string`,
                         'string.required': `name is required`,
                    }),
               category: joi.array()
                    .items(joi.string())
                    .min(1),
               animal: joi.array().items(joi.string()),
               brand: joi.string(),
               description: joi.string(),
               imageUrl: joi.array()
                    .items(joi.string())
                    .min(1),
               features: joi.array().items(
                    joi.object({
                         key: joi.string()
                              .empty()
                              .messages({
                                   'string.base': "key must be a string"
                              }),
                         value: joi.any()
                              .required()
                              .messages({
                                   'any.required': 'value is required'
                              })
                    })
               ),
               varieties: joi.array()
                    .items(
                         joi.object({
                              key: joi.string()
                                   .messages({
                                        'string.required': 'variation key is required',
                                        'string.base': 'variation key must be a string'
                                   }),
                              value: joi.string()
                                   .messages({
                                        'string.required': 'variation value is required',
                                        'string.base': 'variation value must be a string'
                                   }),
                              quantity: joi.number()
                                   .required()
                                   .min(1)
                                   .messages({
                                        'number.required': 'variation quantity is required',
                                        'number.base': 'variation quantity must be a number',
                                        'number.min': 'variation must have at least 1 quantity'
                                   }),
                              imageUrl: joi.string(),
                              cost: joi.number()
                                   .required()
                                   .min(1)
                                   .messages({
                                        'number.required': 'variation cost is required',
                                        'number.base': 'variation cost must be a number',
                                        'number.min': 'variation must have a cost greater than 1'
                                   }),
                              price: joi.number()
                                   .required()
                                   .min(1)
                                   .messages({
                                        'number.required': 'variation price is required',
                                        'number.base': 'variation price must be a number',
                                        'number.min': 'variation must have a price greater than 1'
                                   }),
                              discount: joi.number()

                         })
                    )
                    .min(1)
          })

          const validationResult = schema.validate(req.body);
          if (validationResult.error) {
               return res.status(400).send({ status: false, message: validationResult.error?.details[0]?.message })
          }
          next();
     }
}