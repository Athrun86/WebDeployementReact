// File: `bakend/tests/projectServices.test.ts`
import { Octokit } from 'octokit';
import { Users } from '../models/User';
import * as cryptoUtils from '../utils/crypto';
import { listOrganisations } from '../services/projectServices';

// Mock Users model
jest.mock('../models/User', () => ({
    Users: {
        findOne: jest.fn(),
    },
}));

// Mock decryptToken
jest.mock('../utils/crypto', () => ({
    decryptToken: jest.fn(),
}));

// Mock Octokit
jest.mock('octokit', () => {
    return {
        Octokit: jest.fn().mockImplementation(() => ({
            rest: {
                orgs: {
                    listForAuthenticatedUser: jest.fn().mockResolvedValue({ data: [{ login: 'org1' }] }),
                },
            },
        })),
    };
});

const mockedUsers = Users as unknown as { findOne: jest.Mock };
const mockedDecrypt = (cryptoUtils as unknown as { decryptToken: jest.Mock }).decryptToken;
const MockedOctokit = (Octokit as unknown) as jest.Mock;

describe('service listOrganisations', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('retourne la liste des organisations quand tout va bien', async () => {
        mockedUsers.findOne.mockResolvedValue({ token: 'encrypted-token' });
        mockedDecrypt.mockReturnValue('ghp_valid_token');

        // ensure Octokit returns expected data (mock defined above)
        const res = await listOrganisations();
        expect(Array.isArray(res)).toBe(true);
        expect(res[0].login).toBe('org1');
        expect(mockedUsers.findOne).toHaveBeenCalled();
        expect(mockedDecrypt).toHaveBeenCalledWith('encrypted-token');
        expect(MockedOctokit).toHaveBeenCalledWith({ auth: 'ghp_valid_token' });
    });

    it('lance une erreur si aucun user ou token trouvé', async () => {
        mockedUsers.findOne.mockResolvedValue(null);
        await expect(listOrganisations()).rejects.toThrow('No user or token found');
    });

    it('lance une erreur si le déchiffrement échoue', async () => {
        mockedUsers.findOne.mockResolvedValue({ token: 'bad' });
        mockedDecrypt.mockImplementation(() => { throw new Error('decrypt fail'); });
        await expect(listOrganisations()).rejects.toThrow('Failed to decrypt token');
    });

    it('remonte une erreur quand Octokit échoue', async () => {
        mockedUsers.findOne.mockResolvedValue({ token: 'encrypted' });
        mockedDecrypt.mockReturnValue('ghp_token');
        // override Octokit to throw
        MockedOctokit.mockImplementationOnce(() => ({
            rest: {
                orgs: {
                    listForAuthenticatedUser: jest.fn().mockRejectedValue({ message: 'GH error', status: 502 }),
                },
            },
        }));
        await expect(listOrganisations()).rejects.toMatchObject({ message: 'GH error', status: 502 });
    });
});
