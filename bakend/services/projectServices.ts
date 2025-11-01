import {Users } from '../models/User';
import {Octokit} from "octokit";
import {decryptToken} from "../utils/crypto";
import {components} from "@octokit/openapi-types";
import {NextFunction} from "connect";
import any = jasmine.any;
import { Project } from "../models/Project";

type Organisation = components["schemas"]["organization-simple"];




export async function listOrganisations() {

    const user = await Users.findOne();
    if (!user || !user.token) {
        throw new Error('No user or token found');
    }
    const encryptedToken = user.token;
    if (!encryptedToken) {
        throw new Error('No token found for user');
    }
    let githubToken: string;
    try {
        githubToken = decryptToken(encryptedToken);
    } catch (e) {
        console.error('Error decrypting token:', e);
        throw new Error('Failed to decrypt token');
    }
    const octokit = new Octokit({ auth: githubToken });
    try {
        const resp = await octokit.rest.orgs.listForAuthenticatedUser();
        return resp.data.map((org: Organisation) => ({
            id: org.id,
            login:  org.login,
            avatar_url: org.avatar_url,
            url: org.url,
        }));
    }catch (e: any) {
    const  err : any = new Error(e?.message ?? "Error fetching organisations");
    err.status = e?.status ?? 502;
    throw err;
    }
    }

export async function createProject({
    id, // optionnel
    name,
    organizationName,
    githubUrl,
    minMembers,
    maxMembers,
    repoPattern,
    securityKey
}: {
    id?: number,
    name: string,
    organizationName: string,
    githubUrl: string,
    minMembers: number,
    maxMembers: number,
    repoPattern: string,
    securityKey: string
}) {
    // Si un id est fourni, vérifier qu'il n'existe pas déjà
    if (id) {
        const existing = await Project.findByPk(id);
        if (existing) {
            const err: any = new Error('Un projet avec cet id existe déjà');
            err.status = 409;
            throw err;
        }
    }
    // Création du projet en base, avec id fourni si présent
    const project = await Project.create({
        ...(id ? { id } : {}),
        name,
        organizationName,
        githubUrl,
        minMembers,
        maxMembers,
        repoPattern,
        securityKey
    });
    return project;
}
export async function getNextProjectId() {
    const maxProject = await Project.findOne({
        order: [['id', 'DESC']]
    });
    return maxProject ? maxProject.id + 1 : 1;
}
export async function listProjects() {
    const projects = await Project.findAll({
        attributes: ['id', 'name', 'organizationName']
    });
    return projects.map(p => p.toJSON());
}
