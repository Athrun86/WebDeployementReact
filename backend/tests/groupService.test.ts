import { GroupService } from '../services/groupService';
import { Project } from '../models/Project';
import { Student } from '../models/Student';
import { Group } from '../models/Group';

// Mock des modèles Sequelize
jest.mock('../models/Project');
jest.mock('../models/Student');
jest.mock('../models/Group');

const MockedProject = Project as jest.MockedClass<typeof Project>;
const MockedStudent = Student as jest.MockedClass<typeof Student>;
const MockedGroup = Group as jest.MockedClass<typeof Group>;

describe('GroupService', () => {
    let groupService: GroupService;

    beforeEach(() => {
        groupService = new GroupService();
        jest.clearAllMocks();
    });

    describe('getProjectInfo', () => {
        it('should return valid project info when project exists with correct security key', async () => {
            // Arrange
            const mockProject = {
                id: 1,
                name: 'Test Project',
                organizationName: 'test-org',
                securityKey: '7e1acb3cc532f8f2a734411df0a032e7'
            };

            MockedProject.findOne = jest.fn().mockResolvedValue(mockProject);

            // Act
            const result = await groupService.getProjectInfo('1', '7e1acb3cc532f8f2a734411df0a032e7');

            // Assert
            expect(MockedProject.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    securityKey: '7e1acb3cc532f8f2a734411df0a032e7'
                }
            });

            expect(result).toEqual({
                isValid: true,
                data: {
                    id: 1,
                    title: 'Test Project',
                    organization: 'test-org'
                }
            });
        });

        it('should return invalid when project not found', async () => {
            // Arrange
            MockedProject.findOne = jest.fn().mockResolvedValue(null);

            // Act
            const result = await groupService.getProjectInfo('999', 'wrong-key');

            // Assert
            expect(result).toEqual({
                isValid: false,
                message: "Projet non trouvé ou clé de sécurité invalide"
            });
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            MockedProject.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

            // Act
            const result = await groupService.getProjectInfo('1', 'test-key');

            // Assert
            expect(result).toEqual({
                isValid: false,
                message: "Internal server error during project validation"
            });
        });
    });

    describe('createGroup', () => {
        it('should create group successfully when project exists and no duplicate usernames', async () => {
            // Arrange
            const mockProject = {
                id: 1,
                name: 'Test Project',
                securityKey: '7e1acb3cc532f8f2a734411df0a032e7'
            };

            const mockGroup = {
                id: 1,
                name: 'Groupe 1',
                projectId: 1,
                groupNumber: 1
            };

            const students = [
                { name: 'John Doe', username: 'johndoe' },
                { name: 'Jane Smith', username: 'janesmith' }
            ];

            MockedProject.findOne = jest.fn().mockResolvedValue(mockProject);
            MockedStudent.findAll = jest.fn().mockResolvedValue([]);
            MockedGroup.findOne = jest.fn().mockResolvedValue(null);
            MockedGroup.create = jest.fn().mockResolvedValue(mockGroup);

            // Act
            const result = await groupService.createGroup(1, '7e1acb3cc532f8f2a734411df0a032e7', students);

            // Assert
            expect(MockedProject.findOne).toHaveBeenCalledWith({
                where: { id: 1, securityKey: '7e1acb3cc532f8f2a734411df0a032e7' }
            });

            expect(MockedStudent.findAll).toHaveBeenCalledWith({
                include: [{
                    model: Group,
                    as: 'group',
                    where: { projectId: 1 },
                    required: true
                }],
                where: {
                    githubUsername: ['johndoe', 'janesmith']
                }
            });

            expect(MockedGroup.create).toHaveBeenCalledWith({
                name: 'Groupe 1',
                projectId: 1,
                groupNumber: 1
            });

            expect(result).toEqual(mockGroup);
        });

        it('should throw error when project not found', async () => {
            // Arrange
            MockedProject.findOne = jest.fn().mockResolvedValue(null);

            const students = [{ name: 'John Doe', username: 'johndoe' }];

            // Act & Assert
            await expect(
                groupService.createGroup(999, 'wrong-key', students)
            ).rejects.toThrow('Project not found or invalid security key');
        });

        it('should throw error when duplicate GitHub usernames exist', async () => {
            // Arrange
            const mockProject = {
                id: 1,
                securityKey: '7e1acb3cc532f8f2a734411df0a032e7'
            };

            const existingStudent = {
                githubUsername: 'johndoe'
            };

            MockedProject.findOne = jest.fn().mockResolvedValue(mockProject);
            MockedStudent.findAll = jest.fn().mockResolvedValue([existingStudent]);

            const students = [{ name: 'John Doe', username: 'johndoe' }];

            // Act & Assert
            await expect(
                groupService.createGroup(1, '7e1acb3cc532f8f2a734411df0a032e7', students)
            ).rejects.toThrow('GitHub usernames already used in this project: johndoe');
        });
    });
});
