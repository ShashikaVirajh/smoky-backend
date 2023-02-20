import { CurrentUserController } from '@features/auth/controllers/current-user/current-user.controller';
import { ForgotPasswordController } from '@features/auth/controllers/forgot-password/forgot-password.controller';
import { ResetPasswordController } from '@features/auth/controllers/reset-password/reset-password.controller';
import { SignInController } from '@features/auth/controllers/sign-in/sign-in.controller';
import { SignOutController } from '@features/auth/controllers/sign-out/sign-out.controller';
import { SignUpController } from '@features/auth/controllers/sign-up/sign-up.controller';
import { authMiddleware } from '@middleware/auth-middleware';
import express, { Router } from 'express';

class AuthRouter {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/sign-up', SignUpController.prototype.signUp);
    this.router.post('/sign-in', SignInController.prototype.signIn);
    this.router.get('/sign-out', SignOutController.prototype.signOut);
    this.router.post('/forgot-password', ForgotPasswordController.prototype.forgotPassword);
    this.router.post('/reset-password/:token', ResetPasswordController.prototype.resetPassword);

    this.router.get('/current-user', [authMiddleware.verifyUser], CurrentUserController.prototype.currentUser);

    return this.router;
  }
}

export const authRouter = new AuthRouter();
