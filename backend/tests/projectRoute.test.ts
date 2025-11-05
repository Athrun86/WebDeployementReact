import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { listOrganisations } from '../services/projectServices';
import { Octokit } from 'octokit';

jest.mock('octokit', () => ({
    Octokit: jest.fn().mockImplementation(() => ({
        rest: {
            orgs: {
                listForAuthenticatedUser: jest.fn().mockResolvedValue({ data: [{ id: 1, login: "org1" }] }),
            },
        },
    })),
}));



jest.mock('../services/projectServices', () => ({
    listOrganisations: jest.fn(),
}));

const JWTSECRET = process.env.JWTSECRET || "yourjsonwebtokensecretkey";

describe("GET /projects/organisations", () => {
    beforeEach(() => {
        (listOrganisations as jest.Mock).mockReset();
    });

    it("renvoie la liste d'organisations récupérées", async () => {
        const organisationsMock = [
            { login: "orgGithub1" },
            { login: "orgGithub2" }
        ];
        (listOrganisations as jest.Mock).mockResolvedValue(organisationsMock);

        const token = jwt.sign({ userId: "test" }, JWTSECRET, { expiresIn: "1h" });

        const res = await request(app)
            .get("/projects/organisations")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.organisations).toEqual(organisationsMock);
    });
});
