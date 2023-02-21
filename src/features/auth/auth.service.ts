import { IAuthDocument } from '@features/auth/auth.interfaces';
import { AuthModel } from '@features/auth/auth.model';
import { TokenManager } from '@library/token-manager.library';
import { config } from '@root/config';
import { capitalizeFirstLetter, lowerCase } from '@utils/strings.utils';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async updateResetPasswordToken(authId: string, token: string): Promise<void> {
    const query = { passwordResetToken: token };
    await AuthModel.updateOne({ _id: authId }, query);
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: capitalizeFirstLetter(username) }, { email: lowerCase(email) }]
    };
    return (await AuthModel.findOne(query).exec()) as IAuthDocument;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const query = { username: capitalizeFirstLetter(username) };
    return (await AuthModel.findOne(query).exec()) as IAuthDocument;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const query = { email: lowerCase(email) };
    return (await AuthModel.findOne(query).exec()) as IAuthDocument;
  }

  public async getAuthUserByResetPasswordToken(resetToken: string): Promise<IAuthDocument | null> {
    try {
      TokenManager.verifyToken(resetToken, config.PASSWORD_RESET_TOKEN_SECRET!);

      const query = { passwordResetToken: resetToken };
      return AuthModel.findOne(query).exec();
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
