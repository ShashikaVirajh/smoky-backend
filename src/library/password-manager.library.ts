import bcrypt from 'bcryptjs';

const PASSWORD_HASH_SALT_ROUND = 10;

export class PasswordManager {
  static toHash = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, PASSWORD_HASH_SALT_ROUND);
  };

  static compare = async (password: string, encryptedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, encryptedPassword);
  };
}
