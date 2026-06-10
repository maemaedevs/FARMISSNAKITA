import { Router } from 'express';

import { listMobileDistributions } from '../controllers/assistance-distributions.controller';
import {
  createMobileCropRecord,
  harvestMobileCropRecord,
  listMobileCropRecords,
} from '../controllers/crop-records.controller';
import { getMobileReportsOverview } from '../controllers/reports.controller';
import {
  createMobileSituationReport,
  listMobileSituationReports,
} from '../controllers/situation-reports.controller';
import {
  changeMobilePassword,
  getMobileProfile,
  listMobilePrograms,
  updateMobileProfile,
  uploadMobileAvatar,
} from '../controllers/mobile.controller';
import { authenticateJwt, requireClient } from '../middleware/auth';
import { avatarUpload, situationReportFieldsUpload } from '../middleware/upload';
import { AppError } from '../middleware/error';

const mobileApi = Router();

mobileApi.use(authenticateJwt);
mobileApi.use(requireClient);

mobileApi.get('/profile', getMobileProfile);
mobileApi.patch('/profile', updateMobileProfile);
mobileApi.post('/profile/avatar', (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err) {
      return next(
        new AppError(400, err instanceof Error ? err.message : 'Upload failed'),
      );
    }
    return uploadMobileAvatar(req, res, next);
  });
});
mobileApi.patch('/password', changeMobilePassword);
mobileApi.get('/programs', listMobilePrograms);
mobileApi.get('/distributions', listMobileDistributions);
mobileApi.get('/crop-records', listMobileCropRecords);
mobileApi.post('/crop-records', createMobileCropRecord);
mobileApi.patch('/crop-records/:id/harvest', harvestMobileCropRecord);
mobileApi.get('/reports/overview', getMobileReportsOverview);
mobileApi.get('/situation-reports', listMobileSituationReports);
mobileApi.post('/situation-reports', (req, res, next) => {
  situationReportFieldsUpload.fields([
    { name: 'photoCrop', maxCount: 1 },
    { name: 'photoLandslide', maxCount: 1 },
    { name: 'photoOther', maxCount: 1 },
    { name: 'document', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return next(
        new AppError(400, err instanceof Error ? err.message : 'Upload failed'),
      );
    }
    return createMobileSituationReport(req, res, next);
  });
});

export const mobileRouter = Router();

mobileRouter.use('/mobile', mobileApi);
