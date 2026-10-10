import { Router } from 'express';
import { CatalogController } from '../controllers/catalogController';

const router = Router();
const controller = new CatalogController();

router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));

export default router;