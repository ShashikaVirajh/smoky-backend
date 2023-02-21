import { IAuthDocument } from '@features/auth/auth.interfaces';
import { authService } from '@features/auth/auth.service';
import { BadRequestError } from '@library/error-handler.library';
import { joiValidation } from '@library/validation.library';
import { userService } from '@service/db/user.service';
import { emailQueue } from '@service/queues/email.queue';
import { resetPasswordTemplate } from '@shared/templates/reset-password/reset-password.template';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { changePasswordSchema } from '@user/schemes/info';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import publicIP from 'ip';
import moment from 'moment';

export class Update {
  @joiValidation(changePasswordSchema)
  public async password(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords do not match.');
    }
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(req.currentUser!.username);
    const passwordsMatch: boolean = await existingUser.comparePassword(currentPassword);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const hashedPassword: string = await existingUser.hashPassword(newPassword);
    userService.updatePassword(`${req.currentUser!.username}`, hashedPassword);

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.sendPasswordResetSuccessfulEmail(templateParams);
    emailQueue.addEmailJob('changePassword', { template, receiverEmail: existingUser.email!, subject: 'Password update confirmation' });
    res.status(HTTP_STATUS.OK).json({
      message: 'Password updated successfully. You will be redirected shortly to the login page.'
    });
  }
}
