// import { CurrentUserController } from '@features/auth/controllers/current-user/current-user.controller';
// import { IUserDocument } from '@features/user/interfaces/user.interface';
// import { authMockRequest, authMockResponse, authUserPayload } from '@root/mocks/auth.mock';
// import { existingUser } from '@root/mocks/user.mock';
// import { UserCache } from '@shared/services/redis/user.cache';
// import { Request, Response } from 'express';

// jest.mock('@shared/queues/base.queue');
// jest.mock('@shared/cache/user.cache');
// jest.mock('@features/auth/auth.service');

// const USERNAME = 'Smoky123';
// const PASSWORD = 'smoky123';

// describe('current-user-controller', () => {
//   beforeEach(() => {
//     jest.restoreAllMocks();
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should set session token to null and send correct json response', async () => {
//     const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as Request;
//     const res: Response = authMockResponse();

//     jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue({} as IUserDocument);

//     await CurrentUserController.prototype.currentUser(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       accessToken: null,
//       isUser: false,
//       user: null
//     });
//   });

//   it('should set session token and send correct json response', async () => {
//     const req: Request = authMockRequest({ jwt: 'qwer1234' }, { username: USERNAME, password: PASSWORD }, authUserPayload) as Request;

//     const res: Response = authMockResponse();

//     jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

//     await CurrentUserController.prototype.currentUser(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       accessToken: req.session?.accessToken,
//       isUser: true,
//       user: existingUser
//     });
//   });
// });
