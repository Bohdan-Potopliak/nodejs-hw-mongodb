import { Router } from 'express';
import {
  getContactsByIdController,
  getContactsController,
  addContactController,
  patchContactsController,
  deleteContactsController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const contactsRouter = Router();

contactsRouter.get('/', ctrlWrapper(getContactsController));
contactsRouter.get('/:contactId', ctrlWrapper(getContactsByIdController));
contactsRouter.post('/', ctrlWrapper(addContactController));
contactsRouter.patch('/:contactId', ctrlWrapper(patchContactsController));
contactsRouter.delete('/:contactId', ctrlWrapper(deleteContactsController));

export default contactsRouter;
