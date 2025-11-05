import { Router } from 'express';
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Route de connexion (pas d'authentification requise)
router.post('/', AuthController.login);

// Route de validation de token (authentification requise)
router.get('/validate-token', authenticateToken, AuthController.validateToken);

export default router;