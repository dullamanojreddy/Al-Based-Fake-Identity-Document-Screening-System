import { Request, Response } from 'express';
import { screeningService } from './screening.service';

export const analyzeDocumentController = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Document image file is required' });
    }

    const result = await screeningService.screenDocumentWithAI(file.buffer, file.mimetype);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getScreeningStatsController = async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      totalScanned: 3326,
      cleared: 3180,
      secondary: 95,
      detained: 51,
      averageVerificationSeconds: 2.4,
      nodeStatus: 'ONLINE_ACTIVE',
    },
  });
};
