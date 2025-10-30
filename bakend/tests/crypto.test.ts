import { decryptToken } from '../utils/crypto'; // adapte au chemin réel
import encryptToken from '../utils/crypto';

describe('decryptToken', () => {
    it('should decrypt an encrypted token correctly', () => {
        const plainToken = 'github_pat_testvalue12345';
        const encrypted = encryptToken(plainToken);
        const decrypted = decryptToken(encrypted);
        expect(decrypted).toBe(plainToken);
    });

    it('should throw error on invalid payload', () => {
        expect(() => decryptToken('invalid_base64')).toThrow('Invalid payload length');
    });
});
