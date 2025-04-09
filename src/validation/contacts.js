import Joi from 'joi';
import { typeList } from '../constants/contacts.js';

export const addContactSchema = Joi.object({
  name: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string(),
  isFavorite: Joi.boolean(),
  contactType: Joi.string()
    .valid(...typeList)
    .required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  phoneNumber: Joi.string(),
  email: Joi.string(),
  isFavorite: Joi.boolean(),
  contactType: Joi.string().valid(...typeList),
});
