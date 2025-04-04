import { ContactCollection } from '../db/models/Contact.js';

export const getContacts = () => ContactCollection.find();

export const getContactById = (id) => ContactCollection.findOne({ _id: id });

export const addContact = (payload) => ContactCollection.create(payload);

export const upsertContact = async (id, payload, options = {}) => {
  const { upsert } = options;
  const rawResult = await ContactCollection.findOneAndUpdate({ id }, payload, {
    new: true,
    upsert,
    includeResultMetadata: true,
  });

  if (!rawResult || !rawResult.value) return null;

  return {
    data: rawResult,
    isNew: Boolean(rawResult.lastErrorObject.upserted),
  };
};

export const deleteContactById = (id) =>
  ContactCollection.findOneAndDelete({ id });
