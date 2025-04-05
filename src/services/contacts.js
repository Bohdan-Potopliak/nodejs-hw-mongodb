import { ContactCollection } from '../db/models/Contact.js';
import mongoose from 'mongoose';
const { Types } = mongoose;
const { ObjectId } = Types;

export const getContacts = () => ContactCollection.find();

export const getContactById = (id) => {
  if (!ObjectId.isValid(id)) return null;
  return ContactCollection.findOne({ _id: new ObjectId(id) });
};

export const addContact = (payload) => ContactCollection.create(payload);

export const upsertContact = async (id, payload, options = {}) => {
  const { upsert } = options;
  if (!ObjectId.isValid(id)) return null;

  const rawResult = await ContactCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    payload,
    {
      new: true,
      upsert,
      includeResultMetadata: true,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return rawResult.value;
};

export const deleteContactById = (id) => {
  if (!ObjectId.isValid(id)) return null;
  return ContactCollection.findOneAndDelete({ _id: new ObjectId(id) });
};
