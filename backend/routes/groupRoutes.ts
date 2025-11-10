import { Router } from 'express';
import { GroupController } from '../controllers/groupController';
import {validate, validateParams, validateQuery} from "../middleware/validation";
import {
    groupSchema,
   studentSchema,
    projectSchema
} from "../validators/shema";

/**
 * Router for group-related endpoints
 * Handles project validation and group creation
 */
const router = Router();
const groupController = new GroupController();

/**
 * GET /project/:projectId/:securityKey
 * Retrieves project information and validates access credentials
 */
router.get('/project/:projectId/:securityKey',
    validateQuery(projectSchema),
    groupController.getProjectInfo);

/**
 * POST /create
 * Creates a new group with students after validation
 */
router.post('/create',
    validate(groupSchema),
    groupController.createGroup);






export default router;
