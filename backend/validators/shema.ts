import Joi from 'joi';

export const userLoginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(128).required()
});

export const projectSchema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(1000).optional(),
    organization: Joi.string().min(1).max(255).required(),
    minStudents: Joi.number().integer().min(1).max(10).required(),
    maxStudents: Joi.number().integer().min(1).max(10).required(),
    repositoryName: Joi.string().max(255).optional(),
    templateUrl: Joi.string().uri().max(500).optional()
});

export const studentSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    username: Joi.string().alphanum().min(1).max(255).required()
});

export const groupSchema = Joi.object({
    projectId: Joi.number().integer().positive().required(),
    students: Joi.array().items(studentSchema).min(1).max(10).required(),
    repositoryUrl: Joi.string().uri().max(500).optional()
});
export const projectIdSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});