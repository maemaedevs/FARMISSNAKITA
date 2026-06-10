import { Router } from 'express';

import { listMobileDistributions } from '../controllers/assistance-distributions.controller';
import { listMobileCropRecords } from '../controllers/crop-records.controller';
import {
  changeMobilePassword,
  getMobileProfile,
  listMobilePrograms,
  updateMobileProfile,
  uploadMobileAvatar,
} from '../controllers/mobile.controller';
import { authenticateJwt, requireClient } from '../middleware/auth';
import { avatarUpload } from '../middleware/upload';
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

export const mobileRouter = Router();

mobileRouter.use('/mobile', mobileApi);
