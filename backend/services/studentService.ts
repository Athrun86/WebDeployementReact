import { Student } from '../models/Student';
import { createOctokitClient } from '../utils/octokitClient';

/**
 * Service for managing students and GitHub validation
 * Handles student creation and GitHub username validation
 */
export class StudentService {

    /**
     * Validates GitHub usernames using Octokit API
     * @param usernames - Array of GitHub usernames to validate
     * @returns Object containing arrays of valid and invalid usernames
     */
    async validateGitHubUsers(usernames: string[]): Promise<{valid: string[], invalid: string[]}> {
        console.log(`🔍 Validating ${usernames.length} GitHub usernames: ${usernames.join(', ')}`);

        const valid: string[] = [];
        const invalid: string[] = [];

        // Create Octokit client without token for public user validation
        const octokit = createOctokitClient();

        for (const username of usernames) {
            try {
                console.log(`🧪 Checking GitHub user: ${username}`);
                await octokit.rest.users.getByUsername({
                    username: username
                });
                valid.push(username);
                console.log(`✅ Valid GitHub user: ${username}`);
            } catch (error: any) {
                // If status is 404, user doesn't exist
                if (error.status === 404) {
                    console.log(`❌ GitHub user not found: ${username}`);
                    invalid.push(username);
                } else {
                    // For other errors (rate limiting, etc.), consider as invalid for safety
                    console.log(`⚠️ GitHub API error for ${username}: ${error.message}`);
                    invalid.push(username);
                }
            }
        }

        console.log(`📊 GitHub validation results: ${valid.length} valid, ${invalid.length} invalid`);
        return { valid, invalid };
    }

    /**
     * Creates students after validating their GitHub usernames
     * @param groupId - The group identifier where students will be added
     * @param projectId - The project identifier where students belong
     * @param studentsData - Array of student data with name and username
     * @returns Array of created student objects
     * @throws Error if GitHub validation fails
     */
    async createStudents(groupId: number, projectId: number, studentsData: Array<{name: string, username: string}>): Promise<Student[]> {
        console.log(`🔍 Creating ${studentsData.length} students for group ${groupId} in project ${projectId}`);

        // Validate GitHub usernames exist
        const usernames = studentsData.map(s => s.username);
        const { invalid } = await this.validateGitHubUsers(usernames);

        if (invalid.length > 0) {
            console.log(`❌ Cannot create students - invalid GitHub users: ${invalid.join(', ')}`);
            throw new Error(`GitHub users do not exist: ${invalid.join(', ')}`);
        }

        console.log('✅ All GitHub usernames validated, creating students in database');

        // Create students in database using correct column names
        const students = await Student.bulkCreate(
            studentsData.map(data => ({
                name: data.name,
                github_username: data.username,  // Correction: using 'github_username' column
                group_id: groupId,  // Correction: using 'group_id' column
                project_id: projectId  // Correction: using 'project_id' column
            }))
        );

        console.log(`✅ Successfully created ${students.length} students in database`);
        return students;
    }

    /**
     * Retrieves all students belonging to a specific group
     * @param groupId - The group identifier
     * @returns Array of students in the group
     */
    async getStudentsByGroup(groupId: string): Promise<Student[]> {
        console.log(`🔍 Fetching students for group ${groupId}`);

        const students = await Student.findAll({
            where: { group_id: parseInt(groupId) }  // Correction: using 'group_id' column
        });

        console.log(`📊 Found ${students.length} students in group ${groupId}`);
        return students;
    }
}


