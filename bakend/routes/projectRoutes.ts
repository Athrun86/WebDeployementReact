import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { ProjectController } from "../controllers/projectController";

const router = Router();

// Toutes les routes de ce fichier nécessitent une authentification
router.use(authenticateToken);

// Routes pour les organisations
router.get('/organisations', ProjectController.getOrganisations);

// Routes pour les projets (attention à l'ordre : routes spécifiques avant routes avec paramètres)
router.get('/next-id', ProjectController.getNextProjectId);
router.get('/list', ProjectController.getProjectsList);
router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', ProjectController.updateProject);

export default router;
