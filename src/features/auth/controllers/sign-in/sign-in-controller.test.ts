/* eslint-disable @typescript-eslint/no-explicit-any */
import { SignInController } from '@features/auth/controllers/sign-in/sign-in.controller';
import { authService } from '@features/auth/service/auth.service';
import { CustomError } from '@library/error-handler.library';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { mergedAuthAndUserData } from '@root/mocks/user.mock';
import { userService } from '@shared/services/db/user.service';
import { capitalizeFirstLetter } from '@utils/strings.utils';
import { Request, Response } from 'express';

const USERNAME = 'smoky123';
const PASSWORD = 'smoky#pass';
const WRONG_PASSWORD = 'smoky#123';
const SHORT_PASSWORD = 'short';
const LONG_PASSWORD = 'smoky_password_long';
const SHORT_USERNAME = 'short';
const LONG_USERNAME = 'smoky_username_long';

jest.useFakeTimers();
jest.mock('@shared/queues/base.queue');

describe('sign-in-controller', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    SignInController.prototype.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is required');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: SHORT_USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    SignInController.prototype.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();

    SignInController.prototype.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();

    SignInController.prototype.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is required');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: SHORT_PASSWORD }) as Request;
    const res: Response = authMockResponse();

    SignInController.prototype.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();

    SignInController.prototype.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw "Invalid credentials" if username does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as any);

    SignInController.prototype.signIn(req, res).catch((error: CustomError) => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(capitalizeFirstLetter(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should throw "Invalid credentials" if password does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as any);

    SignInController.prototype.signIn(req, res).catch((error: CustomError) => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(capitalizeFirstLetter(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    authMock.comparePassword = () => Promise.resolve(true);

    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(authMock);
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData);

    await SignInController.prototype.signIn(req, res);

    expect(req.session?.accessToken).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User logged in successfully',
      user: mergedAuthAndUserData,
      accessToken: req.session?.accessToken
    });
  });
});
