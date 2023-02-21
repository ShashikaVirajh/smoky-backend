import { EmailTypes } from '@enums';
import { authService } from '@features/auth/auth.service';
import { resetPasswordSchema } from '@features/auth/auth.validations';
import { IResetPasswordParams } from '@features/user/interfaces/user.interface';
import { BadRequestError } from '@library/error-handler.library';
import { joiValidation } from '@library/validation.library';
import { emailQueue } from '@shared/queues/email.queue';
import { resetPasswordTemplate } from '@shared/templates/reset-password/reset-password.template';
import { formatDate, getCurrentTime } from '@utils/date.utils';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import publicIp from 'ip';

export class ResetPasswordController {
  @joiValidation(resetPasswordSchema)
  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (password !== confirmPassword) throw new BadRequestError('Passwords do not match');

    const authUser = await authService.getAuthUserByResetPasswordToken(token);
    if (!authUser) throw new BadRequestError('Reset token has expired.');

    authUser.password = password;
    authUser.passwordResetExpires = undefined;
    authUser.passwordResetToken = undefined;
    await authUser.save();

    const templateParams: IResetPasswordParams = {
      username: authUser.username!,
      email: authUser.email!,
      ipaddress: publicIp.address(),
      date: formatDate(getCurrentTime(), 'DD/MM/YYYY HH:mm')
    };

    const template = resetPasswordTemplate.sendPasswordResetSuccessfulEmail(templateParams);

    emailQueue.addEmailJob(EmailTypes.FORGOT_PASSWORD, {
      template,
      receiverEmail: authUser.email!,
      subject: 'Password Reset Successful'
    });

    const response = { message: 'Password updated successfully.' };
    res.status(HTTP_STATUS.OK).json(response);
  }
}
