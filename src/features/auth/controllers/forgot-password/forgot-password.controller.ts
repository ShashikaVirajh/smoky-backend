import { EmailTypes } from '@enums';
import { authService } from '@features/auth/auth.service';
import { forgotPasswordSchema } from '@features/auth/auth.validations';
import { BadRequestError } from '@library/error-handler.library';
import { TokenManager } from '@library/token-manager.library';
import { joiValidation } from '@library/validation.library';
import { config } from '@root/config';
import { emailQueue } from '@shared/queues/email.queue';
import { forgotPasswordTemplate } from '@shared/templates/forgot-password/forgot-password.template';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class ForgotPasswordController {
  @joiValidation(forgotPasswordSchema)
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const authUser = await authService.getAuthUserByEmail(email);

    if (!authUser) throw new BadRequestError('No user found with the email');

    const payload = { userId: authUser?.id };
    const resetTokenSecret = config.PASSWORD_RESET_TOKEN_SECRET!;
    const resetTokenOptions = { expiresIn: config.PASSWORD_RESET_TOKEN_TTL! };

    const passwordResetToken = TokenManager.generateToken(payload, resetTokenSecret, resetTokenOptions);

    await authService.updateResetPasswordToken(authUser._id.toString(), passwordResetToken);

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${passwordResetToken}`;
    const template = forgotPasswordTemplate.sendForgotPasswordEmail(authUser.username!, resetLink);
    emailQueue.addEmailJob(EmailTypes.FORGOT_PASSWORD, {
      template,
      receiverEmail: email,
      subject: 'Password Reset Confirmation'
    });

    const response = { message: 'Password reset email sent.', passwordResetToken };
    res.status(HTTP_STATUS.OK).json(response);
  }
}
