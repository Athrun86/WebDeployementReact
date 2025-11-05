import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
    listOrganisations,
    createProject,
    listProjects,
    getNextProjectId,
    modifyProject
} from '../services/projectServices';
import { Project } from '../models/Project';

export class ProjectController {
    static async getOrganisations(req: AuthenticatedRequest, res: Response) {
        try {
            const organisations = await listOrganisations();
            return res.status(200).json({
                success: true,
                organisations: organisations
            });
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message || "Internal server error"
            });
        }
    }

    static async createProject(req: AuthenticatedRequest, res: Response) {
        const { id, name, organizationName, githubUrl, minMembers, maxMembers, securityKey } = req.body;

        if (!name || !organizationName || !githubUrl || !minMembers || !maxMembers || !securityKey) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Strict validation for members
        if (!Number.isInteger(minMembers) || minMembers < 1) {
            return res.status(400).json({
                success: false,
                message: 'Minimum members must be a positive integer (>= 1).'
            });
        }
        if (!Number.isInteger(maxMembers) || maxMembers < 1) {
            return res.status(400).json({
                success: false,
                message: 'Maximum members must be a positive integer (>= 1).'
            });
        }
        if (maxMembers < minMembers) {
            return res.status(400).json({
                success: false,
                message: 'Maximum members must be greater than or equal to minimum.'
            });
        }

        try {
            // Generate pattern automatically: ProjectName##
            const repoPattern = `${name}##`;
            const project = await createProject({
                id, // can be undefined
                name,
                organizationName,
                githubUrl,
                minMembers,
                maxMembers,
                repoPattern,
                securityKey
            });

            // Return all useful info, including the invitation link
            return res.status(201).json({
                success: true,
                project: {
                    id: project.id,
                    name: project.name,
                    organizationName: project.organizationName,
                    githubUrl: project.githubUrl,
                    minMembers: project.minMembers,
                    maxMembers: project.maxMembers,
                    repoPattern: project.repoPattern,
                    securityKey: project.securityKey,
                    inviteLink: `/studentAdd/${project.id}/${project.securityKey}`
                }
            });
        } catch (err: any) {
            if (err.status === 409) {
                return res.status(409).json({
                    success: false,
                    message: 'A project with this id already exists. Please refresh the form.'
                });
            }
            if (err.status === 410) {
                return res.status(410).json({
                    success: false,
                    message: 'This organization is already used by another project.'
                });
            }
            return res.status(500).json({
                success: false,
                message: err.message || 'Error while creating the project'
            });
        }
    }

    static async getProjectById(req: AuthenticatedRequest, res: Response) {
        const projectId = Number(req.params.id);

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid project id'
            });
        }

        try {
            const project = await Project.findByPk(projectId);
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            // Generate invitation link from project data
            const inviteLink = `/studentAdd/${project.id}/${project.securityKey}`;
            return res.status(200).json({
                success: true,
                project: {
                    id: project.id,
                    name: project.name,
                    organizationName: project.organizationName,
                    githubUrl: project.githubUrl,
                    minMembers: project.minMembers,
                    maxMembers: project.maxMembers,
                    repoPattern: project.repoPattern,
                    securityKey: project.securityKey,
                    inviteLink
                }
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err || 'Error while retrieving the project'
            });
        }
    }

    static async updateProject(req: AuthenticatedRequest, res: Response) {
        const projectId = Number(req.params.id);

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid project id'
            });
        }

        const { name, organizationName, githubUrl, minMembers, maxMembers, securityKey } = req.body;

        if (!name || !organizationName || !githubUrl || !minMembers || !maxMembers || !securityKey) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (!Number.isInteger(minMembers) || minMembers < 1) {
            return res.status(400).json({
                success: false,
                message: 'Minimum members must be a positive integer (>= 1).'
            });
        }
        if (!Number.isInteger(maxMembers) || maxMembers < 1) {
            return res.status(400).json({
                success: false,
                message: 'Maximum members must be a positive integer (>= 1).'
            });
        }
        if (maxMembers < minMembers) {
            return res.status(400).json({
                success: false,
                message: 'Maximum members must be greater than or equal to minimum.'
            });
        }

        try {
            const repoPattern = `${name}##`;
            const project = await modifyProject({
                id: projectId,
                name,
                organizationName,
                githubUrl,
                minMembers,
                maxMembers,
                repoPattern,
                securityKey
            });

            return res.status(200).json({
                success: true,
                project: {
                    id: project.id,
                    name: project.name,
                    organizationName: project.organizationName,
                    githubUrl: project.githubUrl,
                    minMembers: project.minMembers,
                    maxMembers: project.maxMembers,
                    repoPattern: project.repoPattern,
                    securityKey: project.securityKey
                }
            });
        } catch (err: any) {
            if (err.status === 410) {
                return res.status(410).json({
                    success: false,
                    message: 'This organization is already used by another project.'
                });
            }
            return res.status(500).json({
                success: false,
                message: err.message || 'Error while updating the project'
            });
        }
    }

    static async getNextProjectId(req: AuthenticatedRequest, res: Response) {
        try {
            const nextId = await getNextProjectId();
            return res.status(200).json({
                success: true,
                nextId
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err || 'Error while retrieving the next id'
            });
        }
    }

    static async getProjectsList(req: AuthenticatedRequest, res: Response) {
        try {
            const projectList = await listProjects();
            if (!projectList || projectList.length === 0) {
                return res.status(200).json({
                    success: true,
                    projects: [],
                    message: 'No project found.'
                });
            }
            return res.status(200).json({
                success: true,
                projects: projectList
            });
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message || "Error while retrieving projects"
            });
        }
    }
}
