import { ContactCollection } from '../db/models/Contact.js';

export const getContacts = () => ContactCollection.find();

export const getContactById = (id) => ContactCollection.findOne({ _id: id });

export const addContact = (payload) => ContactCollection.create(payload);

export const upsertContact = async (id, payload, options = {}) => {
  const { upsert } = options;
  const rawResult = await ContactCollection.findOneAndUpdate(
    { _id: id },
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

export const deleteContactById = (id) =>
  ContactCollection.findOneAndDelete({ _id: id });
