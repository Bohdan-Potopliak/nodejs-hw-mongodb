import Joi from 'joi';
import { typeList } from '../constants/contacts.js';

export const addContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().min(3).max(20),
  isFavorite: Joi.boolean(),
  contactType: Joi.string()
    .min(3)
    .max(20)
    .valid(...typeList)
    .required(),
  photo: Joi.string().uri(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.string().min(3).max(20),
  email: Joi.string().email().min(3).max(20),
  isFavorite: Joi.boolean(),
  contactType: Joi.string()
    .min(3)
    .max(20)
    .valid(...typeList),
  photo: Joi.string().uri(),
});
