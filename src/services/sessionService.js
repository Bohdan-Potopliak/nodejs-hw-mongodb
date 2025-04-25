import { SessionCollection } from '../db/models/Session.js';

export const deleteSession = async (sessionId) => {
  const session = await SessionCollection.findByIdAndDelete(sessionId);

  if (!session) {
    throw new Error('Session not found');
  }

  return session;
};
