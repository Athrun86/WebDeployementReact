import Joi from 'joi';

export const userLoginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(128).required()
});


export const projectSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    name: Joi.string().trim().min(1).max(255).required(),
    organizationName: Joi.string().trim().min(1).max(255).required(),
    githubUrl: Joi.string().uri().optional(),
    minMembers: Joi.number().integer().min(1).max(10).required(),
    maxMembers: Joi.number().integer().min(1).max(10).required(),
    securityKey: Joi.string().min(1).max(255).required()
});
export const studentSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    username: Joi.string().alphanum().min(1).max(255).required()
});

export const groupSchema = Joi.object({
    projectId: Joi.alternatives().try(
        Joi.number().integer().positive(),
        Joi.string().pattern(/^\d+$/)
    ).required(),
    securityKey: Joi.string().min(1).max(255).required(),
    students: Joi.array().items(
        Joi.object({
            name: Joi.string().trim().min(1).max(100).required(),
            username: Joi.string().trim().min(1).max(39).required()
        })
    ).min(1).max(10).required()
});

export const projectInfoQuerySchema = Joi.object({
    projectId: Joi.string().pattern(/^\d+$/).required(), // Query param = string
    securityKey: Joi.string().min(1).max(255).required()
});

export const projectIdSchema = Joi.object({
    id: Joi.string().pattern(/^\d+$/).required()
});

export const projectIdAndKeySchema = Joi.object({
    projectId: Joi.string().pattern(/^\d+$/).required(),
    securityKey: Joi.string().min(1).max(255).required()
});