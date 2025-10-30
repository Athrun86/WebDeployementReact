import {Router, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {listOrganisations, createProject} from "../services/projectServices";
import crypto from "crypto";
import { Project } from "../models/Project";
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_json_web_token_secret_key";


router.get('/organisations', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token manquant ou mal formé' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
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
        return res.status(401).json({ success: false, message: 'Token manquant ou mal formé' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }
    const { id, name, organizationName, githubUrl, minMembers, maxMembers, securityKey } = req.body;
    if (!name || !organizationName || !githubUrl || !minMembers || !maxMembers || !securityKey) {
        return res.status(400).json({ success: false, message: 'Champs manquants' });
    }
    // Validation stricte des membres
    if (!Number.isInteger(minMembers) || minMembers < 1) {
        return res.status(400).json({ success: false, message: 'Le nombre minimum de membres doit être un entier positif (>= 1).' });
    }
    if (!Number.isInteger(maxMembers) || maxMembers < 1) {
        return res.status(400).json({ success: false, message: 'Le nombre maximum de membres doit être un entier positif (>= 1).' });
    }
    if (maxMembers < minMembers) {
        return res.status(400).json({ success: false, message: 'Le nombre maximum de membres doit être supérieur ou égal au minimum.' });
    }
    try {
        // Génère le pattern automatiquement : NomProjet##
        const repoPattern = `${name}##`;
        const project = await createProject({
            id, // peut être undefined
            name,
            organizationName,
            githubUrl,
            minMembers,
            maxMembers,
            repoPattern,
            securityKey
        });
        // Retourne toutes les infos utiles, y compris le lien d'invitation
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
            return res.status(409).json({ success: false, message: 'Un projet avec cet id existe déjà. Veuillez rafraîchir le formulaire.' });
        }
        return res.status(500).json({ success: false, message: err.message || 'Erreur lors de la création du projet' });
    }
});

router.get('/projects/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token manquant ou mal formé' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }
    const projectId = Number(req.params.id);
    if (!projectId) {
        return res.status(400).json({ success: false, message: 'Id de projet manquant ou invalide' });
    }
    try {
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Projet non trouvé' });
        }
        // Génère le lien d'invitation à partir des données du projet
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
        return res.status(500).json({ success: false, message: err || 'Erreur lors de la récupération du projet' });
    }
});

router.get('/next-id', async (req, res) => {
    try {
        const lastProject = await Project.findOne({
            order: [['id', 'DESC']]
        });
        const nextId = lastProject ? lastProject.id + 1 : 1;
        return res.status(200).json({ success: true, nextId });
    } catch (err) {
        return res.status(500).json({ success: false, message: err || 'Erreur lors de la récupération du prochain id' });
    }
});
export default router;
