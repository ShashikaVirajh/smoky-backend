// import { SignOutController } from '@features/auth/controllers/sign-out/sign-out.controller';
// import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
// import { Request, Response } from 'express';

// const USERNAME = 'Smoky123';
// const PASSWORD = 'pass1234';

// describe('sign-out-controller', () => {
//   it('should set session to null', async () => {
//     const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
//     const res: Response = authMockResponse();

//     await SignOutController.prototype.signOut(req, res);

//     expect(req.session).toBeNull();
//   });

//   it('should send correct json response', async () => {
//     const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
//     const res: Response = authMockResponse();

//     await SignOutController.prototype.signOut(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       message: 'Logout successful',
//       user: {},
//       accessToken: ''
//     });
//   });
// });
