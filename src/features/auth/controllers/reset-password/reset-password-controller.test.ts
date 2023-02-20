// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { authService } from '@features/auth/auth.service';
// import { ResetPasswordController } from '@features/auth/controllers/reset-password/reset-password.controller';
// import { CustomError } from '@library/error-handler.library';
// import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
// import { emailQueue } from '@shared/queues/email.queue';
// import { Request, Response } from 'express';

// const CORRECT_PASSWORD = 'smokysmoky';

// jest.mock('@shared/queues/base.queue');
// jest.mock('@shared/queues/email.queue');
// jest.mock('@features/auth/auth.service');
// jest.mock('@library/email-transport.library');

// describe('reset-password-controller', () => {
//   beforeEach(() => {
//     jest.restoreAllMocks();
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should throw an error if password is empty', () => {
//     const req: Request = authMockRequest({}, { password: '' }) as Request;
//     const res: Response = authMockResponse();

//     ResetPasswordController.prototype.resetPassword(req, res).catch((error: CustomError) => {
//       expect(error.statusCode).toEqual(400);
//       expect(error.serializeErrors().message).toEqual('Password is required');
//     });
//   });

//   it('should throw an error if password and confirmPassword are different', () => {
//     const req: Request = authMockRequest({}, { password: CORRECT_PASSWORD, confirmPassword: `${CORRECT_PASSWORD}2` }) as Request;

//     const res: Response = authMockResponse();

//     ResetPasswordController.prototype.resetPassword(req, res).catch((error: CustomError) => {
//       expect(error.statusCode).toEqual(400);
//       expect(error.serializeErrors().message).toEqual('Passwords should match');
//     });
//   });

//   it('should throw error if reset token has expired', () => {
//     const req: Request = authMockRequest({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
//       token: ''
//     }) as Request;

//     const res: Response = authMockResponse();

//     jest.spyOn(authService, 'getAuthUserByResetPasswordToken').mockResolvedValue(null as any);

//     ResetPasswordController.prototype.resetPassword(req, res).catch((error: CustomError) => {
//       expect(error.statusCode).toEqual(400);
//       expect(error.serializeErrors().message).toEqual('Reset token has expired.');
//     });
//   });

//   it('should send correct json response', async () => {
//     const req: Request = authMockRequest({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
//       token: 'qweqwe123123'
//     }) as Request;

//     const res: Response = authMockResponse();

//     jest.spyOn(authService, 'getAuthUserByResetPasswordToken').mockResolvedValue(authMock);
//     jest.spyOn(emailQueue, 'addEmailJob');

//     await ResetPasswordController.prototype.resetPassword(req, res);

//     expect(emailQueue.addEmailJob).toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       message: 'Password updated successfully.'
//     });
//   });
// });
