import crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';
// Charge les variables d'environnement depuis le fichier .env situé dans le répertoire parent

dotenv.config({ path: path.join(__dirname, '..', '.env') });


/**
 * Lit la clé de chiffrement depuis la variable d'environnement TOKEN_KEY.
 * Vérifie que la clé est définie et qu'elle a une longueur valide (32 octets après décodage Base64).
 */
const KEY_BASE64 = process.env.TOKEN_KEY || '';
if (!KEY_BASE64)  throw new Error('TOKEN_KEY is not set in .env file');
const KEY = Buffer.from(KEY_BASE64, 'base64');
if (KEY.length !== 32) throw new Error('TOKEN_KEY must be 32 bytes');
/**
 * Chiffre une chaîne de caractères en utilisant AES-256-GCM.
 *
 * @param {string} plain - La chaîne de caractères en clair à chiffrer.
 * @returns {string} - Le texte chiffré encodé en Base64, contenant l'IV, le tag d'authentification et le texte chiffré.
 */
export default function encryptToken(plain:string):string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm",KEY, iv );
    const ciphertext = Buffer.concat([cipher.update(plain, 'utf-8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv,tag, ciphertext]).toString('base64');
}
/**
 * Déchiffre une chaîne de caractères chiffrée en utilisant AES-256-GCM.
 *
 * @param {string} payload - Le texte chiffré encodé en Base64, contenant l'IV, le tag d'authentification et le texte chiffré.
 * @returns {string} - La chaîne de caractères déchiffrée.
 * @throws {Error} - Si le payload est invalide ou si le déchiffrement échoue.
 */
export function decryptToken(payload:string): string {
    const buf = Buffer.from(payload, 'base64');
    if (buf.length < 12 + 16) throw new Error('Invalid payload length');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12,28);
    const ciphertext = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf-8');

}