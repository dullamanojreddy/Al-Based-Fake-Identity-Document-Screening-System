import { Router } from 'express';
import multer from 'multer';
import { analyzeDocumentController, getScreeningStatsController } from './screening.controller';

const router = Router();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB max

router.post('/analyze', upload.single('document'), analyzeDocumentController);
router.get('/stats', getScreeningStatsController);

export default router;
