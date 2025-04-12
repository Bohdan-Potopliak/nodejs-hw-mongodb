import { ContactCollection } from '../db/models/Contact.js';
import mongoose from 'mongoose';
import { calcPaginationData } from '../utils/calcPaginationData.js';
import { sortList } from '../constants/index.js';

const { Types } = mongoose;
const { ObjectId } = Types;

export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = sortList[0],
  filters = {},
}) => {
  const skip = (page - 1) * perPage;

  const data = await ContactCollection.find(filters)
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

  const totalItems = await ContactCollection.countDocuments(filters);

  const paginationData = await calcPaginationData({
    page,
    perPage,
    totalItems,
  });

  return {
    data,
    totalItems,
    ...paginationData,
  };
};

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
      runValidators: true,
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
