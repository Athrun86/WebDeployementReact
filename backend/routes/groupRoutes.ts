import { Router } from 'express';
import { GroupController } from '../controllers/groupController';

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
router.get('/project/:projectId/:securityKey', groupController.getProjectInfo);

/**
 * POST /create
 * Creates a new group with students after validation
 */
router.post('/create', groupController.createGroup);

/**
 * DEBUG ROUTES - For testing and troubleshooting
 * These routes help diagnose database connection and data issues
 */

/**
 * GET /debug/project/:projectId
 * Debug route: Get project by ID only (without security key validation)
 * Useful for checking if a project exists and seeing its actual security key
 */
router.get('/debug/project/:projectId', async (req, res) => {
    const { projectId } = req.params;
    console.log(`🐛 DEBUG: Getting project ${projectId} without security validation`);

    try {
        const { Project } = require('../models/Project');
        const project = await Project.findOne({
            where: { id: parseInt(projectId) }
        });

        if (!project) {
            console.log(`🐛 DEBUG: Project ${projectId} not found`);
            return res.json({
                found: false,
                message: `No project found with ID ${projectId}`
            });
        }

        console.log(`🐛 DEBUG: Project ${projectId} found - ${project.name}`);
        res.json({
            found: true,
            project: {
                id: project.id,
                name: project.name,
                organization_name: project.organization_name,
                security_key_preview: project.security_key.substring(0, 8) + '...',
                security_key_length: project.security_key.length
            }
        });
    } catch (err) {
        console.error('🐛 DEBUG ERROR:', err);
        res.status(500).json({
            err: true,
            message: err
        });
    }
});

/**
 * GET /debug/projects
 * Debug route: List all projects (limited info for security)
 */
router.get('/debug/projects', async (req, res) => {
    console.log('🐛 DEBUG: Listing all projects');

    try {
        const { Project } = require('../models/Project');
        const projects = await Project.findAll({
            limit: 10
        });

        console.log(`🐛 DEBUG: Found ${projects.length} projects`);
        res.json({
            count: projects.length,
            projects: projects.map((p: any) => ({
                id: p.id,
                name: p.name,
                organization_name: p.organization_name,
                security_key_preview: p.security_key.substring(0, 8) + '...'
            }))
        });
    } catch (error) {
        console.error('🐛 DEBUG ERROR:', error);
        res.status(500).json({
            error: true,
            message: error
        });
    }
});

/**
 * GET /debug/test-connection
 * Debug route: Test database connection
 */
router.get('/debug/test-connection', async (req, res) => {
    console.log('🐛 DEBUG: Testing database connection');

    try {
        const { Project } = require('../models/Project');
        const result = await Project.findOne();

        console.log('🐛 DEBUG: Database connection successful');
        res.json({
            dbConnection: true,
            message: 'Database connection OK',
            timestamp: new Date().toISOString(),
            sampleProject: result ? {
                id: result.id,
                name: result.name
            } : null
        });
    } catch (error) {
        console.error('🐛 DEBUG ERROR:', error);
        res.status(500).json({
            dbConnection: false,
            error: true,
            message: error
        });
    }
});

export default router;
