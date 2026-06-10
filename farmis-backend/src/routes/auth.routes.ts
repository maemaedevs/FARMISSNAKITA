import { Router } from 'express';

import {
  loginAdmin,
  loginMobileByFarmerId,
  registerAdmin,
  requestOtpHandler,
  verifyOtpHandler,
} from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/auth/admin/register', registerAdmin);
authRouter.post('/auth/admin/login', loginAdmin);
authRouter.post('/auth/mobile/login', loginMobileByFarmerId);
authRouter.post('/auth/mobile/request-otp', requestOtpHandler);
authRouter.post('/auth/mobile/verify-otp', verifyOtpHandler);

