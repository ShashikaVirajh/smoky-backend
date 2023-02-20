/* eslint-disable @typescript-eslint/no-explicit-any */

import { ForgotPasswordController } from '@features/auth/controllers/forgot-password/forgot-password.controller';
import { authService } from '@features/auth/service/auth.service';
import { CustomError } from '@library/error-handler.library';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { emailQueue } from '@shared/queues/email.queue';
import { Request, Response } from 'express';

const WRONG_EMAIL = 'wrong@email.com';
const INVALID_EMAIL = 'invalid@email';
const CORRECT_EMAIL = 'smoky123@me.com';

jest.mock('@shared/queues/base.queue');
jest.mock('@shared/queues/email.queue');
jest.mock('@features/auth/auth.service');
jest.mock('@library/email-transport.library');

describe('forgot-password-controller', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if email is invalid', () => {
    const req: Request = authMockRequest({}, { email: INVALID_EMAIL }) as Request;
    const res: Response = authMockResponse();

    ForgotPasswordController.prototype.forgotPassword(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw "No user found with the email" if email does not exist', () => {
    const req: Request = authMockRequest({}, { email: WRONG_EMAIL }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(null as any);

    ForgotPasswordController.prototype.forgotPassword(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('No user found with the email');
    });
  });

  it('should send correct json response', async () => {
    const req: Request = authMockRequest({}, { email: CORRECT_EMAIL }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
    jest.spyOn(emailQueue, 'addEmailJob');

    await ForgotPasswordController.prototype.forgotPassword(req, res);

    expect(emailQueue.addEmailJob).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Password reset email sent.'
    });
  });
});
