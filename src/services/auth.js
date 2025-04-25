import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import Handlebars from 'handlebars';
import jwt from 'jsonwebtoken';
import { UserCollection } from '../db/models/User.js';
import { SessionCollection } from '../db/models/Session.js';
import {
  accessTokenLifeTime,
  refreshTokenLifeTime,
} from '../constants/auth.js';
import { sendEmail } from '../services/emailService.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { TEMPLATES_DIR } from '../constants/index.js';

const verifyEmailPath = path.join(TEMPLATES_DIR, 'verify-email.html');
const appDomain = getEnvVar('APP_DOMAIN');
const jwtSecret = getEnvVar('JWT_SECRET');

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const user = await UserCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await UserCollection.create({
    ...payload,
    password: hashPassword,
  });

  const token = jwt.sign({ email }, jwtSecret, {
    expiresIn: '24h',
  });

  const templateSource = await fs.readFile(verifyEmailPath, 'utf-8');
  const template = Handlebars.compile(templateSource);
  const html = template({
    verifyLink: `${appDomain}/auth/verify?token=${token}`,
  });

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html,
  };
  await sendEmail(verifyEmail);

  return newUser;
};

export const verifyUser = (token) => {
  try {
    const { email } = jwt.verify(token, jwtSecret);
    return UserCollection.findOneAndUpdate({ email }, { verify: true });
  } catch (error) {
    throw createHttpError(401, error.message);
  }
};

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  if (!user.verify) {
    throw createHttpError(401, 'Email not verified');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  await SessionCollection.findOneAndDelete({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return SessionCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: Date.now() + accessTokenLifeTime,
    refreshTokenValidUntil: Date.now() + refreshTokenLifeTime,
  });
};

export const refreshSession = async ({ refreshToken, sessionId }) => {
  const session = await SessionCollection.findById(sessionId);
  if (!session || session.refreshToken !== refreshToken) {
    throw createHttpError(401, 'Invalid session or refresh token');
  }

  await SessionCollection.findByIdAndDelete(sessionId);

  const newAccessToken = randomBytes(30).toString('base64');
  const newRefreshToken = randomBytes(30).toString('base64');

  return SessionCollection.create({
    userId: session.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: Date.now() + accessTokenLifeTime,
    refreshTokenValidUntil: Date.now() + refreshTokenLifeTime,
  });
};

export const logoutUser = async (sessionId) => {
  if (!sessionId) {
    throw createHttpError(400, 'Session ID is required');
  }

  await SessionCollection.findByIdAndDelete(sessionId);
};
