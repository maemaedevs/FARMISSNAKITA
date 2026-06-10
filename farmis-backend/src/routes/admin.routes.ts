import { Router } from 'express';

import {
  createFarmer,
  generateFarmerPassword,
  getFarmerDetail,
  listFarmers,
  createProgram,
  listPrograms,
  listSystemUsers,
  uploadFarmerLandDocument,
} from '../controllers/admin.controller';
import {
  createDistribution,
  listDistributions,
  updateDistribution,
} from '../controllers/assistance-distributions.controller';
import {
  createCropRecord,
  listCropRecords,
} from '../controllers/crop-records.controller';
import { authenticateJwt, requireAdmin } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { landDocumentUpload } from '../middleware/upload';

const adminApi = Router();

adminApi.use(authenticateJwt);
adminApi.use(requireAdmin);

adminApi.get('/crop-records', listCropRecords);
adminApi.post('/crop-records', createCropRecord);
adminApi.get('/farmers', listFarmers);
adminApi.post('/farmers', createFarmer);
adminApi.get('/farmers/:id', getFarmerDetail);
adminApi.post('/farmers/:id/generate-password', generateFarmerPassword);
adminApi.post('/farmers/:id/land-documents', (req, res, next) => {
  landDocumentUpload.single('document')(req, res, (err) => {
    if (err) {
      return next(
        new AppError(400, err instanceof Error ? err.message : 'Upload failed'),
      );
    }
    return uploadFarmerLandDocument(req, res, next);
  });
});
adminApi.get('/users', listSystemUsers);
adminApi.get('/programs', listPrograms);
adminApi.post('/programs', createProgram);
adminApi.get('/distributions', listDistributions);
adminApi.post('/distributions', createDistribution);
adminApi.patch('/distributions/:id', updateDistribution);

export const adminRouter = Router();

adminRouter.use('/admin', adminApi);

