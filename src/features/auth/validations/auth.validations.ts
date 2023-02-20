import { EMAIL_MAX_LEN, PASSWORD_MAX_LEN, PASSWORD_MIN_LEN, USER_NAME_MAX_LEN, USER_NAME_MIN_LEN } from '@constants/validation.constants';
import Joi, { ObjectSchema } from 'joi';

export const signUpSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().required().email().max(EMAIL_MAX_LEN).messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Email must be valid',
    'string.empty': 'Email is required'
  }),
  username: Joi.string().required().min(USER_NAME_MIN_LEN).max(USER_NAME_MAX_LEN).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Username should be 6-16 characters',
    'string.max': 'Username should be 6-16 characters',
    'string.empty': 'Username is required'
  }),
  password: Joi.string().required().min(PASSWORD_MIN_LEN).max(PASSWORD_MAX_LEN).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Password should be 8-16 characters',
    'string.max': 'Password should be 8-16 characters',
    'string.empty': 'Password is required'
  }),
  avatarColor: Joi.string().required().messages({
    'any.required': 'Avatar color is required'
  }),
  avatarImage: Joi.string().required().messages({
    'any.required': 'Avatar image is required'
  })
});

export const signInSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(USER_NAME_MIN_LEN).max(USER_NAME_MAX_LEN).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Invalid username',
    'string.max': 'Invalid username',
    'string.empty': 'Username is required'
  }),
  password: Joi.string().required().min(PASSWORD_MIN_LEN).max(PASSWORD_MAX_LEN).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is required'
  })
});

export const forgotPasswordSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().email().required().max(EMAIL_MAX_LEN).messages({
    'string.base': 'Email must be valid',
    'string.email': 'Email must be valid',
    'string.required': 'Email is required'
  })
});

export const resetPasswordSchema: ObjectSchema = Joi.object().keys({
  password: Joi.string().required().min(PASSWORD_MIN_LEN).max(PASSWORD_MAX_LEN).messages({
    'string.base': 'Password should be of type string',
    'string.min': 'Password should be 8-16 characters',
    'string.max': 'Password should be 8-16 characters',
    'string.empty': 'Password is required'
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords should match',
    'any.required': 'Confirm password is required'
  })
});
