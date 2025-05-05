import {
  registerUser,
  // verifyUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { UserCollection } from '../db/models/User.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../services/emailService.js';
import { deleteUserSessions } from '../services/sessionService.js';

export const registerController = async (req, res) => {
  const newUser = await registerUser(req.body);

  const { _id, email, name, createdAt, updatedAt } = newUser;

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      _id,
      email,
      name,
      createdAt,
      updatedAt,
    },
  });
};

// export const verifyController = async (req, res) => {
//   await verifyUser(req.query.token);

//   res.json({
//     message: 'Email verified',
//   });
// };

export const loginController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const refreshSessionController = async (req, res) => {
  const { refreshToken, sessionId } = req.cookies;

  const session = await refreshSession({ refreshToken, sessionId });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutController = async (req, res) => {
  const { sessionId } = req.cookies;

  await logoutUser(sessionId);

  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).end();
};

export const sendResetEmailController = async (req, res) => {
  const { email } = req.body;

  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign({ email }, getEnvVar('JWT_SECRET'), {
    expiresIn: '5m',
  });

  const resetLink = `${getEnvVar('APP_DOMAIN')}/reset-password?token=${token}`;

  const emailBody = `
    <h2>Hi ${user.name || 'there'},</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: emailBody,
    });

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, getEnvVar('JWT_SECRET'));
    const { email } = decoded;

    const user = await UserCollection.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    await deleteUserSessions(user._id);

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error instanceof jwt.JsonWebTokenError
    ) {
      throw createHttpError(401, 'Token is expired or invalid.');
    }
    throw error;
  }
};
