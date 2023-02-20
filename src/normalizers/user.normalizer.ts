import { IAuthDocument, ISignUpData } from '@features/auth/interfaces/auth.interfaces';
import { IUserDocument } from '@features/user/interfaces/user.interface';
import { capitalizeFirstLetter, lowerCase } from '@utils/strings.utils';
import { ObjectId } from 'mongodb';

export const normalizeSignUpPayload = (data: ISignUpData): IAuthDocument => {
  const { _id, username, email, uId, password, avatarColor } = data;

  return {
    _id,
    uId,
    username: capitalizeFirstLetter(username),
    email: lowerCase(email),
    password,
    avatarColor,
    createdAt: new Date()
  } as IAuthDocument;
};

export const normalizeUserPayload = (data: IAuthDocument, userObjectId: ObjectId): IUserDocument => {
  const { _id, username, email, uId, password, avatarColor } = data;

  return {
    _id: userObjectId,
    authId: _id,
    uId,
    username: capitalizeFirstLetter(username),
    email,
    password,
    avatarColor,
    profilePicture: '',
    blocked: [],
    blockedBy: [],
    work: '',
    location: '',
    school: '',
    quote: '',
    bgImageVersion: '',
    bgImageId: '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    notifications: {
      messages: true,
      reactions: true,
      comments: true,
      follows: true
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  } as unknown as IUserDocument;
};
