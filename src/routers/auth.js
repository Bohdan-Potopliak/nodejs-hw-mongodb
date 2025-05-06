import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../utils/validateBody.js';
import {
  authLoginSchema,
  authRegisterSchema,
  // googleOAuthSchema,
  resetPasswordEmailSchema,
  resetPasswordSchema,
} from '../validation/auth.js';
import {
  loginController,
  // verifyController,
  registerController,
  refreshSessionController,
  logoutController,
  resetPasswordController,
  sendResetEmailController,
  // getGoogleAuthLinkController,
  // signUpOrLoginWithGoogleController,
} from '../controllers/auth.js';

const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(authRegisterSchema),
  ctrlWrapper(registerController),
);

// authRouter.get('/verify', ctrlWrapper(verifyController));

authRouter.post(
  '/login',
  validateBody(authLoginSchema),
  ctrlWrapper(loginController),
);

authRouter.post(
  '/send-reset-email',
  validateBody(resetPasswordEmailSchema),
  ctrlWrapper(sendResetEmailController),
);

authRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

authRouter.post('/refresh', ctrlWrapper(refreshSessionController));

authRouter.post('/logout', ctrlWrapper(logoutController));

// authRouter.post(
//   '/get-google-auth-link',
//   ctrlWrapper(getGoogleAuthLinkController),
// );

// authRouter.post(
//   '/auth-with-google',
//   validateBody(googleOAuthSchema),
//   ctrlWrapper(signUpOrLoginWithGoogleController),
// );

export default authRouter;
