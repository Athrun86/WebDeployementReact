import { Group } from '../models/Group';
import { Student } from '../models/Student';
import { Project } from '../models/Project';
import { Users } from '../models/User';
import { decryptToken } from "../utils/crypto";
import { Octokit } from "@octokit/rest";
import {errorMessage} from "napi-postinstall/lib/helpers";

/**
 * Service for managing groups and their validation
 * Handles group creation, project validation, and security checks
 */
export class GroupService {

    /**
     * Retrieves project information and validates security key
     * @param projectId - The project identifier
     * @param securityKey - The project security key for validation
     * @returns Object containing validation status and project data or error message
     */
    async getProjectInfo(projectId: string, securityKey: string) {
        try {
            console.log(`🔍 GroupService.getProjectInfo called with projectId=${projectId}, securityKey=${securityKey}`);

            const project = await Project.findOne({
                where: {
                    id: parseInt(projectId),
                    security_key: securityKey  // Correction: using actual DB column name
                }
            });

            console.log(`📊 Database query result: ${project ? 'PROJECT FOUND' : 'PROJECT NOT FOUND'}`);

            if (!project) {
                console.log('❌ Project not found with provided ID and security key');
                return {
                    isValid: false,
                    message: "Projet non trouvé ou clé de sécurité invalide"
                };
            }

            console.log(`✅ Project found: ${project.name} (org: ${project.organizationName})`);

            return {
                isValid: true,
                data: {
                    id: project.id,
                    title: project.name,  // Correction: using 'name' column instead of 'title'
                    organization: project.organizationName ,// Correction: using 'organization_name' column
                    minMembers: project.minMembers,
                    maxMembers: project.maxMembers,
                }
            };
        } catch (error) {
            console.error('❌ Error in getProjectInfo:', error);
            return {
                isValid: false,
                message: "Internal server error during project validation"
            };
        }
    }

    /**
     * Creates a new group for a project after validation
     * @param projectId - The project identifier
     * @param securityKey - The project security key
     * @param students - Array of student data to validate
     * @returns The created group object
     * @throws Error if validation fails
     */
    async createGroup(projectId: number, securityKey: string, students: Array<{
        name: string,
        username: string}>) {
        try {
            // Vérifier que le projet existe et que la clé de sécurité est valide
            const project = await Project.findOne({
                where: {
                    id: projectId,
                    security_key: securityKey
                }
            });

            if (!project) {
                return {
                    success: false,
                    message: "Project not found or invalid security key"
                };
            }

            // Check if any of the students already exist in another group for this project
            const usernames = students.map(s => s.username);

            const existingStudents = await this.checkExistingStudents(projectId, usernames);
            if (existingStudents.length > 0) {
                return {
                    success: false,
                    message: `Some students already exist in another group for this project: ${existingStudents.join(', ')}`
                }
            }

            // Validate GitHub usernames
            const {valid, invalid} = await this.validateGitHubUsernames(usernames);
            if (invalid.length > 0) {
                return {
                    success: false,
                    message: `The following GitHub usernames are invalid: ${invalid.join(', ')}`
                };
            }

            // Compter le nombre de groupes existants dans ce projet
            const existingGroupsCount = await Group.count({
                where: {
                    projectId: parseInt(projectId.toString())
                }
            });

            // Calculer le nouveau numéro de groupe
            const newGroupNumber = existingGroupsCount + 1;

            // Générer le nom du groupe selon le pattern du projet
            const groupName = Project.formatRepoName(project.repoPattern, newGroupNumber);

            // Créer le repository GitHub avant d'insérer en base
            const repoCreationResult = await this.createGitHubRepository(
                groupName,
                project.organizationName,
                usernames
            );

            if (!repoCreationResult.success) {
                return {
                    success: false,
                    message: `Failed to create GitHub repository: ${repoCreationResult.message}`
                };
            }

            // Créer le groupe
            const group = await Group.create({
                name: groupName,
                projectId: parseInt(projectId.toString()),
                groupNumber: newGroupNumber,
                github_repo_url: repoCreationResult.repoUrl
            });

            // Créer les étudiants associés au groupe
            const studentsData = students.map(student => ({
                name: student.name,
                username: student.username,
                groupId: group.id,
                projectId: parseInt(projectId.toString()),
            }));

            await Student.bulkCreate(studentsData);

            return {
                success: true,
                message: "Group and GitHub repository created successfully",
                data: {
                    groupId: group.id,
                    groupName: groupName,
                    groupNumber: newGroupNumber,
                    studentsCount: students.length,
                    githubRepo: repoCreationResult.repoUrl
                }
            };

        } catch (error) {
            console.error('Error creating group with students:', error);
            return {
                success: false,
                message: "Error creating group"
            };
        }

    }

    /**
     * Vérifie si des étudiants existent déjà dans un autre groupe du même projet
     */
    async checkExistingStudents(projectId: number, usernames: string[]) {
        const existingStudents = await Student.findAll({
            where: {
                projectId: projectId,
                username: usernames
            }
        });

        return existingStudents.map(s => s.username);
    }

    /**
     * Valide les usernames GitHub via le StudentService
     */
    async validateGitHubUsernames(usernames: string[]) {
        const {StudentService} = await import('./studentService');
        const studentService = new StudentService();

        return await studentService.validateGitHubUsers(usernames);
    }

    async createGitHubRepository(repoName: string, orgName: string, studentUsernames: string[]) {
        try {
            // Récupérer le token GitHub de la même manière que dans projectServices
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

            const octokit = new Octokit({auth: githubToken});

            // Créer le repository dans l'organisation
            const repo = await octokit.rest.repos.createInOrg({
                org: orgName,
                name: repoName,
                description: `Repository for group ${repoName}`,
                private: false,
                auto_init: true
            });

            // Ajouter les étudiants comme collaborateurs
            for (const username of studentUsernames) {
                try {
                    await octokit.rest.repos.addCollaborator({
                        owner: orgName,
                        repo: repoName,
                        username: username,
                        permission: 'push'
                    });
                } catch (error) {
                    console.warn(`Failed to add ${username} as collaborator:`, error);
                }
            }

            return {
                success: true,
                repoUrl: repo.data.html_url,
                message: "Repository created successfully"
            };

        } catch (error) {
            console.error('Error creating GitHub repository:', error);
            return {
                success: false,
                message:  " error occurred creating group"
            };
        }
    }
}
