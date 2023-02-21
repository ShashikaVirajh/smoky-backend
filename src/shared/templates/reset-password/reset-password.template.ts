import { IResetPasswordParams } from '@features/user/interfaces/user.interface';
import ejs from 'ejs';
import fs from 'fs';

class ResetPasswordTemplate {
  public sendPasswordResetSuccessfulEmail(templateParams: IResetPasswordParams): string {
    const { username, email, ipaddress, date } = templateParams;

    return ejs.render(fs.readFileSync(__dirname + '/reset-password.template.ejs', 'utf8'), {
      username,
      email,
      ipaddress,
      date,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}

export const resetPasswordTemplate = new ResetPasswordTemplate();
