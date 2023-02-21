/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService } from '@features/auth/auth.service';
import { SignUpController } from '@features/auth/controllers/sign-up/sign-up.controller';
import * as cloudinary from '@library/cloudinary.library';
import { CustomError } from '@library/error-handler.library';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { UserCache } from '@shared/cache/user.cache';
import { Request, Response } from 'express';

jest.useFakeTimers();
jest.mock('@shared/queues/base.queue');
jest.mock('@shared/queues/auth.queue');
jest.mock('@shared/queues/user.queue');
jest.mock('@shared/cache/user.cache');
jest.mock('@library/cloudinary.library');

describe('sign-up-controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'smoky@test.com',
        password: 'smoky123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUpController.prototype.signUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is required');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'smoky',
        email: 'smoky@test.com',
        password: 'smoky123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUpController.prototype.signUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'smoky_smoky_smoky',
        email: 'smoky@test.com',
        password: 'smoky123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUpController.prototype.signUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if email is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'smoky_smoky_smoky',
        email: '',
        password: 'smoky123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUpController.prototype.signUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is required');
    });
  });

  it('should throw an error if email is not in valid format', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'smoky_smoky',
        email: 'invalid_email',
        password: 'smoky123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUpController.prototype.signUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'smoky_smoky',
        email: 'smoky@test.com',
        password: '',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUpController.prototype.signUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is required');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'smoky_smoky',
        email: 'smoky@test.com',
        password: '1234567',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUpController.prototype.signUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'smoky_smoky',
        email: 'smoky@test.com',
        password: '12345678123456781',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUpController.prototype.signUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw unauthorize error if user already exists', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'smoky_smoky',
        email: 'smoky@test.com',
        password: '12345678',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);

    SignUpController.prototype.signUp(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username or Email already exists');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'smoky_smoky',
        email: 'smoky@test.com',
        password: '12345678',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest.spyOn(cloudinary, 'uploadImage').mockImplementation((): any => Promise.resolve({ version: '12345678', public_id: '1122334455' }));

    await SignUpController.prototype.signUp(req, res);

    expect(req.session?.accessToken).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      accessToken: req.session?.accessToken
    });
  });
});
