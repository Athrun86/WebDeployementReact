import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { listOrganisations } from '../services/projectServices';

jest.mock('../services/projectServices', () => ({
    listOrganisations: jest.fn(),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'your_json_web_token_secret_key';

describe('GET /projects/organisations (affichage organisations)', () => {
    beforeEach(() => {
        (listOrganisations as jest.Mock).mockReset();
    });

    it('affiche les organisations récupérées', async () => {
        const organisationsMock = [
            { login: 'orgGithub1' },
            { login: 'orgGithub2' }
        ];
        (listOrganisations as jest.Mock).mockResolvedValue(organisationsMock);
        const token = jwt.sign({}, JWT_SECRET, { expiresIn: '1h' });

        const res = await request(app)
            .get('/projects/organisations')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        // Affiche les organisations dans la console
        console.log('Organisations récupérées :', res.body.organisations);

        expect(res.body.success).toBe(true);
        expect(res.body.organisations).toEqual(organisationsMock);
    });
});



