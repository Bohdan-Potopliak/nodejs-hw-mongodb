import { ContactCollection } from '../db/models/Contact.js';
import mongoose from 'mongoose';
import { calcPaginationData } from '../utils/calcPaginationData.js';
import { sortList } from '../constants/index.js';
import cloudinary from '../utils/cloudinary.js';

const { Types } = mongoose;
const { ObjectId } = Types;

export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = sortList[0],
  filters = {},
  userId,
}) => {
  const skip = (page - 1) * perPage;

  const data = await ContactCollection.find({ ...filters, userId })
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

  const totalItems = await ContactCollection.countDocuments({
    ...filters,
    userId,
  });

  const paginationData = await calcPaginationData({
    page,
    perPage,
    totalItems,
  });

  return {
    data,
    page,
    perPage,
    totalItems,
    ...paginationData,
  };
};

export const getContactById = (id, userId) => {
  if (!ObjectId.isValid(id)) return null;
  return ContactCollection.findOne({ _id: new ObjectId(id), userId });
};

export const addContact = (payload, userId) =>
  ContactCollection.create({ ...payload, userId });

export const upsertContact = async (id, payload, userId, options = {}) => {
  const { upsert } = options;
  if (!ObjectId.isValid(id)) return null;

  const rawResult = await ContactCollection.findOneAndUpdate(
    { _id: new ObjectId(id), userId },
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

export const deleteContactById = (id, userId) => {
  if (!ObjectId.isValid(id)) return null;
  return ContactCollection.findOneAndDelete({ _id: new ObjectId(id), userId });
};

export const uploadImageToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );

    stream.end(fileBuffer);
  });
};
