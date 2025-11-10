import { Request, Response } from 'express';
import { GroupService } from '../services/groupService';


/**
 * Controller for handling group-related HTTP requests
 * Manages group creation and project information retrieval
 */
export class GroupController {
    private groupService = new GroupService();


    /**
     * Retrieves project information and validates access
     * Route: GET /api/groups/project/:projectId/:securityKey
     * @param req - Express request object containing projectId and securityKey params
     * @param res - Express response object
     */
    getProjectInfo = async (req: Request, res: Response) => {
        const { projectId, securityKey } = req.params;
        console.log(`🌐 API Request: GET /groups/project/${projectId}/${securityKey}`);
        console.log(`📋 Request details: projectId=${projectId}, securityKey=${securityKey}`);

        try {
            const result = await this.groupService.getProjectInfo(projectId, securityKey);

            if (!result.isValid) {
                console.log(`❌ API Response: 404 - ${result.message}`);
                return res.status(404).json({
                    isValid: false,
                    message: result.message
                });
            }

            console.log(`✅ API Response: 200 - Project found: ${result.data?.title}`);
            res.json({
                isValid: true,
                data: result.data
            });
        } catch (error: any) {
            console.error('❌ API Error in getProjectInfo:', error);
            res.status(500).json({
                isValid: false,
                message: 'Internal server error during project retrieval'
            });
        }
    };

    /**
     * Creates a new group with students after validation
     * Route: POST /api/groups/create
     * @param req - Express request object containing projectId, securityKey, and students in body
     * @param res - Express response object
     */
    createGroup = async (req: Request, res: Response) => {
        console.log(`🌐 API Request: POST /groups/create`);

        try {
            const { projectId, securityKey, students } = req.body;
            console.log(`📋 Request body: projectId=${projectId}, securityKey=${securityKey}, students=${students?.length || 0}`);

            // Validate input
            if (!projectId || !securityKey || !students || !Array.isArray(students)) {
                console.log('❌ API Response: 400 - Missing required fields');
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: projectId, securityKey, or students'
                });
            }

            console.log(`🔍 Creating group for project ${projectId} with ${students.length} students`);

            // Create the group (sans le paramètre groupNumber qui est calculé automatiquement)
            const result = await this.groupService.createGroup(
                parseInt(projectId),
                securityKey,
                students
            );

            // Retourner la réponse selon le résultat du service
            if (result.success) {
                console.log(`✅ API Response: 201 - Group created successfully: ${result.data?.groupName}`);
                return res.status(201).json(result);
            } else {
                console.log(`❌ API Response: 400 - ${result.message}`);
                return res.status(400).json(result);
            }

        } catch (error: any) {
            console.error('❌ API Error in createGroup:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error during group creation'
            });
        }
    };
}
