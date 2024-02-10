const Joi = require("joi");

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = { registrationSchema, loginSchema, resendVerificationSchema };
