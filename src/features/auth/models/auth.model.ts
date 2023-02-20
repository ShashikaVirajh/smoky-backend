import { ModelNames } from '@enums';
import { IAuthDocument } from '@features/auth/interfaces/auth.interfaces';
import { PasswordManager } from '@library/password-manager.library';
import { model, Schema } from 'mongoose';

const authSchema: Schema = new Schema(
  {
    username: { type: String },
    uId: { type: String },
    email: { type: String },
    password: { type: String },
    avatarColor: { type: String },
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const hashedPassword: string = await PasswordManager.toHash(this.password!);
  this.password = hashedPassword;
  next();
});

authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IAuthDocument).password!;
  return await PasswordManager.compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
  return await PasswordManager.toHash(password);
};

export const AuthModel = model<IAuthDocument>(ModelNames.AUTH, authSchema, ModelNames.AUTH);
