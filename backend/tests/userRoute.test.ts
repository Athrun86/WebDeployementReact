// TypeScript
// Fichier: `bakend/tests/userRoute.test.ts`
//
// Commande curl pour test manuel (PowerShell / CMD / WSL) :
// curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"pass\"}"

jest.mock('../services/userServices', () => ({
    checkLogin: jest.fn(),
}));

import request from 'supertest';
import app from '../app';
import { checkLogin } from '../services/userServices';

describe('POST /login', () => {
    beforeEach(() => {
        (checkLogin as jest.Mock).mockReset();
    });

    it('renvoie 200 quand les identifiants sont valides', async () => {
        (checkLogin as jest.Mock).mockResolvedValue(true);
        const res = await request(app)
            .post('/login')
            .send({ username: 'validUser', password: 'validPass' })
            .set('Accept', 'application/json');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('renvoie 401 quand identifiants invalides', async () => {
        (checkLogin as jest.Mock).mockResolvedValue(false);
        const res = await request(app)
            .post('/login')
            .send({ username: 'bad', password: 'bad' })
            .set('Accept', 'application/json');
        expect(res.status).toBe(401);
    });

    it('renvoie 400 quand il manque des champs', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'onlyUsername' })
            .set('Accept', 'application/json');
        expect(res.status).toBe(400);
    });
});
