import {
  addContact,
  deleteContactById,
  getContactById,
  getContacts,
  upsertContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { contactSortField } from '../db/models/Contact.js';
import { parseContactFilterParams } from '../utils/filters/parseContactFilterParams.js';
import createHttpError from 'http-errors';

export const getContactsController = async (req, res) => {
  const userId = req.user._id;
  const paginationParams = parsePaginationParams(req.query);
  const sortParams = parseSortParams(req.query, contactSortField);
  const filters = parseContactFilterParams(req.query);
  const data = await getContacts({
    ...paginationParams,
    ...sortParams,
    filters,
    userId,
  });
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: data.data,
      page: data.page,
      perPage: data.perPage,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      hasPreviousPage: data.hasPreviousPage,
      hasNextPage: data.hasNextPage,
    },
  });
};

export const getContactsByIdController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const data = await getContactById(contactId, userId);

  if (!data) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data,
  });
};

export const addContactController = async (req, res) => {
  const userId = req.user._id;
  const data = await addContact(req.body, userId);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const patchContactsController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const result = await upsertContact(contactId, req.body, userId);

  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result,
  });
};

export const deleteContactsController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const data = await deleteContactById(contactId, userId);

  if (!data) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};
