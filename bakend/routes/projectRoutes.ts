import {Router, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {listOrganisations, createProject, listProjects, getNextProjectId} from "../services/projectServices";
import crypto from "crypto";
import { Project } from "../models/Project";
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_json_web_token_secret_key";


router.get('/organisations', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    try {
        const organisations = await listOrganisations();
        return  res.status(200).json({ success: true, organisations : organisations});
    }
    catch(err: any) {
        return res.status(500).json({ success: false, message: err.message || "Internal server error"});
    }
});

router.post('/', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    const { id, name, organizationName, githubUrl, minMembers, maxMembers, securityKey } = req.body;
    if (!name || !organizationName || !githubUrl || !minMembers || !maxMembers || !securityKey) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    // Strict validation for members
    if (!Number.isInteger(minMembers) || minMembers < 1) {
        return res.status(400).json({ success: false, message: 'Minimum members must be a positive integer (>= 1).' });
    }
    if (!Number.isInteger(maxMembers) || maxMembers < 1) {
        return res.status(400).json({ success: false, message: 'Maximum members must be a positive integer (>= 1).' });
    }
    if (maxMembers < minMembers) {
        return res.status(400).json({ success: false, message: 'Maximum members must be greater than or equal to minimum.' });
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
            return res.status(409).json({ success: false, message: 'A project with this id already exists. Please refresh the form.' });
        }
        return res.status(500).json({ success: false, message: err.message || 'Error while creating the project' });
    }
});

router.get('/projects/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    const projectId = Number(req.params.id);
    if (!projectId) {
        return res.status(400).json({ success: false, message: 'Missing or invalid project id' });
    }
    try {
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
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
        return res.status(500).json({ success: false, message: err || 'Error while retrieving the project' });
    }
});

router.get('/next-id', async (req, res) => {
    try {
        const nextId = await  getNextProjectId();
        return res.status(200).json({ success: true, nextId });
    } catch (err) {
        return res.status(500).json({ success: false, message: err || 'Error while retrieving the next id' });
    }
});
router.get('/list', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    try {
        const projectList = await listProjects();
        if (!projectList || projectList.length === 0) {
            return res.status(200).json({ success: true, projects: [], message: 'No project found.' });
        }
        return res.status(200).json({ success: true, projects: projectList });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message || "Error while retrieving projects" });
    }
});
export default router;
